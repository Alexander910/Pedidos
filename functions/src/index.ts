import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

/**
 * Transaction-safe HTTPS Callable function for driver assignment.
 * Prevents race conditions where multiple drivers claim the same trip.
 */
export const assignDriver = functions.https.onCall(async (data, context) => {
  // Ensure user is signed in
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'El usuario debe estar autenticado.'
    );
  }

  const { orderId, driverId } = data;
  if (!orderId || !driverId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Debe proporcionar orderId y driverId.'
    );
  }

  const orderRef = db.collection('orders').doc(orderId);
  const driverRef = db.collection('drivers').doc(driverId);

  try {
    const result = await db.runTransaction(async (transaction) => {
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists) {
        throw new Error('La orden no existe.');
      }

      const orderData = orderSnap.data();
      if (!orderData) throw new Error('Datos de la orden vacíos.');

      // Check if order is already assigned
      if (orderData.driverId !== null || orderData.status !== 'pending') {
        throw new Error('La orden ya fue asignada o no está disponible.');
      }

      // Check if driver exists and is idle
      const driverSnap = await transaction.get(driverRef);
      if (!driverSnap.exists) {
        throw new Error('El conductor no existe.');
      }
      
      const driverData = driverSnap.data();
      if (driverData?.status === 'busy') {
        throw new Error('El conductor ya está ocupado en otro viaje.');
      }

      // Perform transaction updates
      transaction.update(orderRef, {
        driverId: driverId,
        status: 'assigned',
        'timeline': admin.firestore.FieldValue.arrayUnion({
          status: 'assigned',
          timestamp: admin.firestore.Timestamp.now(),
          userId: context.auth.uid,
        }),
      });

      transaction.update(driverRef, {
        status: 'busy',
        activeOrderId: orderId,
      });

      return { success: true };
    });

    return result;
  } catch (error: any) {
    console.error('Error assigning driver transaction:', error);
    throw new functions.https.HttpsError('aborted', error.message || 'Error en la transacción.');
  }
});

/**
 * Webhook integration receiver. Parses WhatsApp or Social Chat messages.
 * Simulates converting chats into Draft orders.
 */
export const socialIntegrationWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const payload = req.body;
  
  // Verify payload properties (e.g. text message from Whatsapp)
  const from = payload.From || payload.senderPhone || 'Unknown';
  const text = payload.Body || payload.messageText || '';

  console.log(`Received social message from ${from}: ${text}`);

  try {
    // Basic AI or Regex rule simulation parsing: "Mandado de Origen a Destino..."
    // Create draft order for coordination confirmation
    const draftOrder = {
      clientId: 'SYSTEM_SOCIAL_CHANNEL',
      driverId: null,
      status: 'draft',
      origin: {
        address: 'Origen Detectado en Chat: (Pendiente Confirmar)',
        latitude: 14.6349,
        longitude: -90.5069,
      },
      destination: {
        address: 'Destino Detectado en Chat: (Pendiente Confirmar)',
        latitude: 14.6349,
        longitude: -90.5069,
      },
      cargo: {
        description: `Creado desde WhatsApp: "${text}"`,
        weightKg: 1,
      },
      payment: {
        method: 'cash_on_delivery',
        codAmount: 0,
        deliveryPrice: 15.00, // standard base price
        driverCommission: 11.25,
        currency: 'GTQ',
      },
      timeline: [
        {
          status: 'draft',
          timestamp: admin.firestore.Timestamp.now(),
          userId: `social_webhook:${from}`,
        }
      ],
      createdAt: admin.firestore.Timestamp.now(),
    };

    await db.collection('orders').add(draftOrder);
    res.status(200).json({ success: true, message: 'Draft order created' });
  } catch (error) {
    console.error('Error in social integration webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Firestore Trigger on order updates. Automatically creates ledger transactions
 * and reconciles driver balances when an order is completed.
 */
export const onOrderUpdated = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const nextData = change.after.data();
    const prevData = change.before.data();
    const orderId = context.params.orderId;

    if (!nextData || !prevData) return;

    // Trigger actions when status turns to 'delivered'
    if (nextData.status === 'delivered' && prevData.status !== 'delivered') {
      const driverId = nextData.driverId;
      if (!driverId) return;

      const driverRef = db.collection('drivers').doc(driverId);
      const deliveryPrice = nextData.payment.deliveryPrice || 0;
      const driverCommission = nextData.payment.driverCommission || 0;
      const codAmount = nextData.payment.codAmount || 0;
      const paymentMethod = nextData.payment.method;

      await db.runTransaction(async (transaction) => {
        // Fetch current driver statistics
        const driverSnap = await transaction.get(driverRef);
        if (!driverSnap.exists) return;
        const driverData = driverSnap.data();

        // 1. Log driver earnings ledger txn
        const earningTxnRef = db.collection('transactions').doc();
        transaction.set(earningTxnRef, {
          transactionId: earningTxnRef.id,
          driverId,
          orderId,
          type: 'delivery_earning',
          amount: driverCommission,
          status: 'completed',
          referenceNotes: `Comisión por viaje ${orderId}`,
          performedBy: 'SYSTEM',
          timestamp: admin.firestore.Timestamp.now(),
        });

        // 2. If Cash on Delivery, driver collects the package price + shipping,
        // which accumulates on their wallet balance (cash currently held by driver)
        let walletDiff = 0;
        if (paymentMethod === 'cash_on_delivery') {
          walletDiff = codAmount + deliveryPrice;

          const cashCollectedTxnRef = db.collection('transactions').doc();
          transaction.set(cashCollectedTxnRef, {
            transactionId: cashCollectedTxnRef.id,
            driverId,
            orderId,
            type: 'cash_collected',
            amount: -walletDiff, // negative balance represents cash the driver owes to company
            status: 'completed',
            referenceNotes: `Efectivo recaudado de viaje ${orderId}`,
            performedBy: 'SYSTEM',
            timestamp: admin.firestore.Timestamp.now(),
          });
        }

        // 3. Update driver wallet balance & payout balance
        const currentWallet = driverData?.walletBalance || 0;
        const currentPayout = driverData?.payoutBalance || 0;

        transaction.update(driverRef, {
          status: 'idle',
          activeOrderId: null,
          walletBalance: currentWallet + walletDiff,
          payoutBalance: currentPayout + driverCommission,
        });
      });
      console.log(`Financial settlement processed for order: ${orderId}`);
    }
  });
