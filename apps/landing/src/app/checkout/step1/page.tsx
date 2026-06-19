"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/cart-store";
import { getBusinessById, Business } from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, CreditCard, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@envios-ya/firebase/src/client";
import { doc, setDoc } from "firebase/firestore";

export default function CheckoutStep1() {
  const { items, totalPrice, totalItems, clearCart } = useCartStore();
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");
  const [business, setBusiness] = useState<Business | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (items.length > 0) {
      // Find the business of the first item
      getBusinessById(items[0].businessId).then(setBusiness);
    }
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center flex-1">
        <h1 className="text-2xl font-bold mb-4 text-slate-800">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mb-8">Agrega algunos productos antes de proceder al pago.</p>
        <Link href="/">
          <Button className="bg-orange-600 hover:bg-orange-500 text-white font-bold">Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  const handleOrderPlacement = async () => {
    if (!address.trim()) {
      alert("Por favor ingresa tu dirección de entrega.");
      return;
    }

    setSubmitting(true);
    try {
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const cargoDescription = items
        .map((item) => `${item.quantity}x ${item.name}`)
        .join(", ");

      const deliveryCost = 15.00; // GTQ Delivery Cost
      const finalPrice = totalPrice() + deliveryCost;

      // Construct a valid monorepo Order object
      const newOrder = {
        orderId,
        clientId: "public_user_gt",
        driverId: null,
        status: "pending",
        origin: {
          address: business?.name || "Comercio Asociado",
          latitude: 14.5573, // Antigua Guatemala default coordinates
          longitude: -90.7332,
        },
        destination: {
          address: address,
          latitude: 14.56 + (Math.random() - 0.5) * 0.02, // slightly randomized
          longitude: -90.73 + (Math.random() - 0.5) * 0.02,
        },
        cargo: {
          description: `Pedido de comida/tienda: ${cargoDescription}`,
          instructions: instructions
        },
        payment: {
          method: "cash_on_delivery",
          codAmount: finalPrice, // Cash amount to collect at delivery
          deliveryPrice: deliveryCost,
          driverCommission: 10.00,
          currency: "GTQ",
        },
        timeline: [
          {
            status: "pending",
            timestamp: new Date().toISOString(),
            userId: "public_user_gt",
          },
        ],
        createdAt: new Date().toISOString(),
      };

      // Write to Firestore orders collection
      await setDoc(doc(db, "orders", orderId), newOrder);

      // Clear local cart
      clearCart();
      
      // Redirect to tracking page
      router.push(`/order/${orderId}`);
    } catch (error) {
      console.error("Error creating order in Firebase:", error);
      alert("Hubo un error al crear tu pedido. Por favor intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-slate-900 text-white h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-sm">
            <ArrowLeft className="w-4 h-4" /> Cancelar
          </Link>
          <span className="font-bold text-orange-500">ENVIOS-YA Checkout</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
        <h1 className="text-3xl font-extrabold mb-8 text-slate-800">Completar Orden</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Formulario de entrega y pago */}
          <div className="space-y-8">
            <section className="bg-card p-6 rounded-xl border border-border shadow-md">
              <h2 className="text-xl font-bold flex items-center mb-4 text-slate-800">
                <MapPin className="w-5 h-5 mr-2 text-orange-500" /> Detalles de Entrega
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block text-slate-600">Dirección completa</label>
                  <Input 
                    placeholder="Ej. Calle Principal 123, Depto 4B, Antigua Guatemala" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block text-slate-600">Instrucciones para el repartidor (Opcional)</label>
                  <Input 
                    placeholder="Ej. Tocar timbre, portón negro, dejar en recepción..." 
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="border-slate-300"
                  />
                </div>
              </div>
            </section>

            <section className="bg-card p-6 rounded-xl border border-border shadow-md">
              <h2 className="text-xl font-bold flex items-center mb-4 text-slate-800">
                <CreditCard className="w-5 h-5 mr-2 text-orange-500" /> Método de Pago
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Por seguridad y comodidad en Guatemala, el pago por defecto es **Efectivo contra Entrega (COD)**.
              </p>
              <div className="h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 bg-slate-50 p-4 text-center">
                <span className="font-bold text-sm text-emerald-600">Efectivo contra Entrega (COD)</span>
                <span className="text-[10px] text-muted-foreground">Pagas en efectivo al piloto al recibir tu pedido.</span>
              </div>
            </section>
          </div>

          {/* Resumen de Orden */}
          <div>
            <div className="bg-card p-6 rounded-xl border border-border sticky top-24 shadow-md">
              <h2 className="text-xl font-bold mb-6 text-slate-800">Resumen de tu Orden</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="flex items-center">
                      <span className="font-bold w-8 text-orange-600 text-sm">{item.quantity}x</span>
                      <span className="truncate max-w-[150px] text-slate-700 font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">Q{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 mb-8 space-y-2">
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Subtotal ({totalItems()} items)</span>
                  <span>Q{totalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Costo de envío (Express)</span>
                  <span>Q15.00</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border mt-2">
                  <span className="text-slate-800">Total a Pagar</span>
                  <span className="text-orange-600">Q{(totalPrice() + 15.00).toFixed(2)}</span>
                </div>
              </div>

              <Button 
                className="w-full text-lg h-14 rounded-xl shadow-lg bg-orange-600 hover:bg-orange-500 text-white font-bold" 
                onClick={handleOrderPlacement}
                disabled={submitting}
              >
                {submitting ? "Procesando pedido..." : "Confirmar y Ordenar"}
                {!submitting && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
