"use client";

import React, { useEffect, useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  DollarSign, 
  LogOut, 
  ToggleLeft,
  ToggleRight,
  Phone,
  Package,
  Star,
  ThumbsDown,
  Clock,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { db } from '@envios-ya/firebase/src/client';
import { collection, doc, onSnapshot, updateDoc, arrayUnion, query, where, getDocs, setDoc } from 'firebase/firestore';

const seedDriversIfEmpty = async () => {
  try {
    const col = collection(db, 'drivers');
    const snap = await getDocs(col);
    if (snap.empty) {
      console.log("Seeding mock pilots into Firestore...");
      const mockDrivers = [
        { name: 'Mario Ponce', vehicleType: 'motorcycle', status: 'idle', phone: '+502 4432 1122', rating: 4.8 },
        { name: 'Luis García', vehicleType: 'motorcycle', status: 'idle', phone: '+502 5532 9988', rating: 4.9 },
        { name: 'Carlos Morales', vehicleType: 'pickup', status: 'idle', phone: '+502 3311 0022', rating: 4.7 }
      ];
      for (let i = 0; i < mockDrivers.length; i++) {
        await setDoc(doc(db, 'drivers', `driver-${i+1}`), mockDrivers[i]);
      }
      console.log("Mock pilots seeded successfully!");
    }
  } catch (e) {
    console.warn("Could not seed pilots (verify Firebase config):", e);
  }
};

export default function PilotDashboard() {
  const [activePilotId, setActivePilotId] = useState('driver-1'); // Default Mario Ponce
  const [pilot, setPilot] = useState<any | null>(null);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [rejectedOrders, setRejectedOrders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [pilotsList, setPilotsList] = useState<any[]>([]);

  // Form states for new registration
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newVehicle, setNewVehicle] = useState('motorcycle');
  const [isRegistering, setIsRegistering] = useState(false);

  // 1. Fetch available pilots list to allow session switching
  useEffect(() => {
    seedDriversIfEmpty().then(() => {
      getDocs(collection(db, 'drivers')).then(snap => {
        setPilotsList(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
      });
    });
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    setIsRegistering(true);
    try {
      const targetId = activePilotId === 'driver-1' && !pilotsList.some(p => p.uid === 'driver-1') 
        ? 'driver-1' 
        : `driver-${Date.now()}`;
      
      const newDriverData = {
        name: newName,
        phone: newPhone,
        vehicleType: newVehicle,
        status: 'idle',
        rating: 5.0,
        activeOrderId: null
      };

      await setDoc(doc(db, 'drivers', targetId), newDriverData);
      
      // Update local lists
      const snap = await getDocs(collection(db, 'drivers'));
      setPilotsList(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
      
      // Select the newly registered pilot
      setActivePilotId(targetId);
    } catch (err) {
      console.error("Error registering pilot:", err);
      alert("Error al registrar piloto. Verifica tu conexión.");
    } finally {
      setIsRegistering(false);
    }
  };

  // 2. Real-time subscription to active pilot profile
  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(doc(db, 'drivers', activePilotId), (snap) => {
      if (snap.exists()) {
        setPilot({ uid: snap.id, ...snap.data() });
      } else {
        setPilot(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error subscribing to pilot profile:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [activePilotId]);

  // 3. Real-time subscription to active order
  useEffect(() => {
    if (!pilot || !pilot.activeOrderId) {
      setActiveOrder(null);
      return;
    }

    const unsub = onSnapshot(doc(db, 'orders', pilot.activeOrderId), (snap) => {
      if (snap.exists()) {
        setActiveOrder({ orderId: snap.id, ...snap.data() });
      } else {
        setActiveOrder(null);
      }
    });

    return () => unsub();
  }, [pilot?.activeOrderId]);

  // 4. Real-time subscription to available (pending) orders
  useEffect(() => {
    if (!pilot || pilot.status !== 'idle') {
      setAvailableOrders([]);
      return;
    }

    const q = query(collection(db, 'orders'), where('status', '==', 'pending'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(docSnap => ({ orderId: docSnap.id, ...docSnap.data() }));
      // Filter out rejected orders
      setAvailableOrders(list.filter(o => !rejectedOrders.has(o.orderId)));
    });

    return () => unsub();
  }, [pilot?.status, rejectedOrders]);

  // 5. Real-time subscription to completed orders history
  useEffect(() => {
    const q = query(
      collection(db, 'orders'), 
      where('driverId', '==', activePilotId), 
      where('status', '==', 'delivered')
    );
    const unsub = onSnapshot(q, (snap) => {
      setCompletedOrders(snap.docs.map(docSnap => ({ orderId: docSnap.id, ...docSnap.data() })));
    });

    return () => unsub();
  }, [activePilotId]);

  // Actions
  const toggleOnlineStatus = async () => {
    if (!pilot) return;
    const nextStatus = pilot.status === 'offline' ? 'idle' : 'offline';
    try {
      await updateDoc(doc(db, 'drivers', activePilotId), {
        status: nextStatus
      });
    } catch (e) {
      console.error("Error toggling status:", e);
    }
  };

  const acceptTrip = async (order: any) => {
    try {
      // 1. Update order
      await updateDoc(doc(db, 'orders', order.orderId), {
        driverId: activePilotId,
        status: 'assigned',
        timeline: arrayUnion({
          status: 'assigned',
          timestamp: new Date().toISOString(),
          userId: activePilotId
        })
      });

      // 2. Update driver profile
      await updateDoc(doc(db, 'drivers', activePilotId), {
        status: 'busy',
        activeOrderId: order.orderId
      });
    } catch (e) {
      console.error("Error accepting trip:", e);
    }
  };

  const rejectTrip = (orderId: string) => {
    setRejectedOrders(prev => {
      const next = new Set(prev);
      next.add(orderId);
      return next;
    });
  };

  const advanceTripProcess = async () => {
    if (!activeOrder || !pilot) return;
    let nextStatus = '';
    
    if (activeOrder.status === 'assigned') nextStatus = 'arrived_origin';
    else if (activeOrder.status === 'arrived_origin') nextStatus = 'in_transit';
    else if (activeOrder.status === 'in_transit') nextStatus = 'arrived_destination';
    else if (activeOrder.status === 'arrived_destination') nextStatus = 'delivered';

    if (!nextStatus) return;

    try {
      // 1. Update order
      await updateDoc(doc(db, 'orders', activeOrder.orderId), {
        status: nextStatus,
        timeline: arrayUnion({
          status: nextStatus,
          timestamp: new Date().toISOString(),
          userId: activePilotId
        }),
        ...(nextStatus === 'delivered' ? { completedAt: new Date().toISOString() } : {})
      });

      // 2. If delivered, clear activeOrderId and set status to idle
      if (nextStatus === 'delivered') {
        await updateDoc(doc(db, 'drivers', activePilotId), {
          status: 'idle',
          activeOrderId: null
        });
      }
    } catch (e) {
      console.error("Error advancing trip process:", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-400">Cargando perfil del piloto...</p>
      </div>
    );
  }

  if (!pilot) {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-950 text-slate-100 border-x border-slate-800 p-6 justify-center">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-orange-500 font-extrabold text-3xl tracking-tight block">ENVIOS-YA</span>
            <h2 className="text-xl font-bold text-white">Registro de Nuevo Piloto</h2>
            <p className="text-xs text-slate-400">
              Parece que es tu primera vez aquí o el perfil seleccionado no existe. Completa los datos para darte de alta.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Teléfono</label>
              <input
                type="tel"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Ej. +502 5555 1234"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tipo de Vehículo</label>
              <select
                value={newVehicle}
                onChange={(e) => setNewVehicle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
              >
                <option value="motorcycle">Moto Express</option>
                <option value="pickup">Camioneta / Pickup</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-orange-600/20 disabled:opacity-50"
            >
              {isRegistering ? 'Registrando...' : 'Registrar y Activar'}
            </button>
          </form>

          {pilotsList.length > 0 && (
            <div className="pt-6 border-t border-slate-900 text-center space-y-3">
              <p className="text-[11px] text-slate-500">¿Ya tienes un piloto creado? Selecciónalo abajo:</p>
              <select
                value={activePilotId}
                onChange={(e) => setActivePilotId(e.target.value)}
                className="bg-slate-900 text-xs font-bold text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none mx-auto block"
              >
                <option value="" disabled>Seleccionar piloto...</option>
                {pilotsList.map(p => (
                  <option key={p.uid} value={p.uid}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Earnings calculation: 80% commission of the deliveryPrice or fixed Q10.00
  const totalEarnings = completedOrders.reduce((acc, order) => {
    const fee = order.payment?.deliveryPrice || 15.00;
    const commission = order.payment?.driverCommission || (fee * 0.8);
    return acc + commission;
  }, 0);

  const totalCashCollected = completedOrders
    .filter(order => order.payment?.method === 'cash_on_delivery')
    .reduce((acc, order) => acc + (order.payment?.codAmount || 0), 0);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-950 text-slate-100 border-x border-slate-800 relative">
      {/* PWA Header */}
      <header className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center sticky top-0 z-50">
        <div className="flex flex-col">
          <span className="text-orange-500 font-extrabold text-lg tracking-tight">ENVIOS-YA</span>
          <span className="text-[10px] block text-slate-400 uppercase tracking-widest font-bold">Consola Piloto</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Pilot Switcher */}
          <select 
            value={activePilotId}
            onChange={(e) => setActivePilotId(e.target.value)}
            className="bg-slate-800 text-xs font-bold text-white px-2 py-1 rounded border border-slate-700 focus:outline-none"
          >
            {pilotsList.map(p => (
              <option key={p.uid} value={p.uid}>{p.name.split(' ')[0]}</option>
            ))}
          </select>

          {pilot.status === 'offline' ? (
            <div className="flex items-center gap-1 bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
              Offline
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
              Online
            </div>
          )}
        </div>
      </header>

      {/* Main App Scroll Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Quick Driver Profile & Rating Card */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-sm text-white">{pilot.name}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Vehículo: {pilot.vehicleType === 'motorcycle' ? 'Moto Express' : 'Camioneta/Pickup'}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-2.5 py-1 rounded-lg text-xs font-bold">
            <Star size={14} className="fill-current" />
            <span>{pilot.rating?.toFixed(1) || '5.0'}</span>
          </div>
        </div>

        {/* Quick Driver Wallet stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-bold">Efectivo por Liquidar</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-xl font-extrabold text-white">Q{totalCashCollected.toFixed(2)}</span>
            </div>
            <span className="text-[9px] text-yellow-500 mt-1 block">Límite Caja: Q1,500.00</span>
          </div>

          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-bold">Mis Ganancias (80%)</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-xl font-extrabold text-emerald-500">Q{totalEarnings.toFixed(2)}</span>
            </div>
            <span className="text-[9px] text-slate-400 mt-1 block">{completedOrders.length} viajes finalizados</span>
          </div>
        </div>

        {/* Current Active Trip Section / Stepper Process */}
        {activeOrder ? (
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Viaje Activo</h2>
              <span className="text-xs text-orange-500 font-bold animate-pulse uppercase tracking-wider">
                {activeOrder.status === 'assigned' ? 'Asignado' :
                 activeOrder.status === 'arrived_origin' ? 'En Origen' :
                 activeOrder.status === 'in_transit' ? 'En Ruta' :
                 activeOrder.status === 'arrived_destination' ? 'En Destino' : activeOrder.status}
              </span>
            </div>

            <div className="p-5 bg-slate-900 rounded-2xl border-2 border-orange-500/40 shadow-lg space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-500 font-bold">EXPRESS</span>
                  <span className="text-xs font-mono font-bold text-slate-400">ID: {activeOrder.orderId}</span>
                </div>
                <a href="tel:+50255551234" className="p-2 rounded-full bg-slate-800 text-orange-500 hover:bg-orange-500/10 transition-colors">
                  <Phone size={14} />
                </a>
              </div>

              {/* Route timeline */}
              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {/* Origin */}
                <div className="flex gap-4 relative">
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold z-10 ${['assigned', 'arrived_origin'].includes(activeOrder.status) ? "bg-orange-500 text-white border-orange-500" : "bg-slate-800 text-slate-400 border-slate-700"}`}>
                    A
                  </div>
                  <div>
                    <h4 className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Recolección (Origen)</h4>
                    <p className="text-sm font-bold mt-0.5 text-white">{activeOrder.origin.address}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Indicaciones: Recoger productos detallados</p>
                  </div>
                </div>

                {/* Destination */}
                <div className="flex gap-4 relative">
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold z-10 ${['in_transit', 'arrived_destination'].includes(activeOrder.status) ? "bg-orange-500 text-white border-orange-500" : "bg-slate-800 text-slate-400 border-slate-700"}`}>
                    B
                  </div>
                  <div>
                    <h4 className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Entrega (Destino)</h4>
                    <p className="text-sm font-bold mt-0.5 text-white">{activeOrder.destination.address}</p>
                    {activeOrder.cargo.instructions && (
                      <p className="text-xs text-slate-400 mt-0.5 italic">Instrucciones: "{activeOrder.cargo.instructions}"</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Details of items */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-slate-400">Productos:</span>
                <p className="text-slate-300 font-medium">{activeOrder.cargo?.description}</p>
              </div>

              {/* COD Indicator */}
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex justify-between items-center text-xs">
                <span className="font-semibold text-emerald-400">Cobro contra entrega (COD):</span>
                <span className="font-extrabold text-emerald-400">Q{activeOrder.payment?.codAmount?.toFixed(2)}</span>
              </div>

              {/* Stepper advancement Button */}
              <button 
                onClick={advanceTripProcess}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-orange-600/20"
              >
                {activeOrder.status === 'assigned' ? 'Llegué al Comercio' :
                 activeOrder.status === 'arrived_origin' ? 'Iniciar Ruta de Entrega' :
                 activeOrder.status === 'in_transit' ? 'Llegué al Destino' :
                 activeOrder.status === 'arrived_destination' ? `Entregar y Cobrar Q${activeOrder.payment?.codAmount?.toFixed(2)}` : 'Completar viaje'}
                <ArrowRight size={16} />
              </button>
            </div>
          </section>
        ) : pilot.status === 'offline' ? (
          <div className="p-8 border border-slate-800 rounded-2xl bg-slate-900 text-center space-y-3">
            <ThumbsDown className="w-10 h-10 mx-auto text-slate-500" />
            <h4 className="font-bold text-white text-base">Estás Desconectado</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">Activa tu estado operativo abajo para poder recibir y optar por viajes en tiempo real.</p>
          </div>
        ) : (
          /* Available Trips Offers Section */
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ofertas Disponibles ({availableOrders.length})</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {availableOrders.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-900/50 text-center text-xs text-slate-500">
                Esperando ofertas de reparto en Antigua Guatemala...
              </div>
            ) : (
              <div className="space-y-4">
                {availableOrders.map((order) => (
                  <div key={order.orderId} className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-orange-500">Q{order.payment?.codAmount?.toFixed(2)} COD</span>
                      <span className="font-mono text-slate-400 font-bold">{order.orderId}</span>
                    </div>
                    <div className="text-xs space-y-1">
                      <p><span className="font-semibold text-slate-500">Recogida:</span> <span className="font-bold text-slate-200">{order.origin.address}</span></p>
                      <p><span className="font-semibold text-slate-500">Entrega:</span> <span className="font-bold text-slate-200">{order.destination.address}</span></p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button 
                        onClick={() => rejectTrip(order.orderId)}
                        className="py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <ThumbsDown size={14} /> Rechazar
                      </button>
                      <button 
                        onClick={() => acceptTrip(order)}
                        className="py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                      >
                        Aceptar Viaje
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Rejected and stats summary footer */}
        <section className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <ThumbsDown size={16} className="text-red-500" />
            <span className="text-slate-400">Viajes Rechazados Hoy:</span>
          </div>
          <span className="font-bold text-red-500 font-mono">{rejectedOrders.size}</span>
        </section>

        {/* Completed Trips History */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Historial de Viajes</h2>
          {completedOrders.length === 0 ? (
            <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/40 text-center text-xs text-slate-500">
              No tienes viajes finalizados el día de hoy.
            </div>
          ) : (
            <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
              {completedOrders.map((order) => (
                <div key={order.orderId} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono text-[10px] text-slate-400 font-bold block">{order.orderId}</span>
                    <span className="text-slate-300 font-medium block truncate max-w-[200px]">{order.destination.address}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-500 font-bold block">+Q{(order.payment?.driverCommission || 10.00).toFixed(2)}</span>
                    <span className="text-[9px] text-slate-400 font-bold">Completado</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Driver status switcher footer */}
      <footer className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center sticky bottom-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Estado Operativo:</span>
          <span className="text-xs font-bold text-slate-200">
            {pilot.status === 'offline' ? 'Desconectado' :
             pilot.status === 'busy' ? 'Ocupado en Viaje' : 'Listo para Recibir Pedidos'}
          </span>
        </div>
        <button 
          onClick={toggleOnlineStatus}
          disabled={pilot.status === 'busy'}
          className={`transition-colors focus:outline-none ${pilot.status === 'busy' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer text-orange-500'}`}
        >
          {pilot.status === 'offline' ? (
            <ToggleLeft size={38} className="stroke-[1.5]" />
          ) : (
            <ToggleRight size={38} className="stroke-[1.5]" />
          )}
        </button>
      </footer>
    </div>
  );
}
