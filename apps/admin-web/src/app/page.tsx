"use client";

import React, { useEffect, useState } from 'react';
import { 
  Truck, 
  Users, 
  TrendingUp, 
  Layers, 
  MapPin, 
  DollarSign, 
  UserPlus,
  Clock,
  CheckCircle2,
  Navigation,
  Loader2,
  Building
} from 'lucide-react';
import { useActiveOrders } from '@envios-ya/firebase';
import { db } from '@envios-ya/firebase/src/client';
import { collection, getDocs, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

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

export default function AdminDashboard() {
  const { orders, loading: ordersLoading } = useActiveOrders('dispatcher', 'dispatcher_admin');
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(true);

  const fetchDrivers = () => {
    getDocs(collection(db, 'drivers'))
      .then(snap => {
        setDrivers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
        setLoadingDrivers(false);
      })
      .catch(err => {
        console.error("Error loading drivers:", err);
        setLoadingDrivers(false);
      });
  };

  useEffect(() => {
    seedDriversIfEmpty().then(() => {
      fetchDrivers();
    });
  }, []);

  const handleAssignDriver = async (driverId: string, driverName: string) => {
    if (!selectedOrder) return;
    try {
      const orderRef = doc(db, 'orders', selectedOrder.orderId);
      await updateDoc(orderRef, {
        driverId: driverId,
        status: 'assigned',
        timeline: arrayUnion({
          status: 'assigned',
          timestamp: new Date().toISOString(),
          userId: 'dispatcher_admin'
        })
      });

      // Update driver status to busy
      const driverRef = doc(db, 'drivers', driverId);
      await updateDoc(driverRef, {
        status: 'busy',
        activeOrderId: selectedOrder.orderId
      });

      fetchDrivers();
      setAssignModalOpen(false);
      setSelectedOrder(null);
    } catch (e) {
      console.error("Error assigning driver:", e);
      alert("Error al asignar piloto.");
    }
  };

  const advanceOrderStatus = async (orderId: string, currentStatus: string, driverId: string | null) => {
    try {
      let nextStatus = '';
      if (currentStatus === 'assigned') nextStatus = 'picking_up';
      else if (currentStatus === 'picking_up') nextStatus = 'in_transit';
      else if (currentStatus === 'in_transit') nextStatus = 'delivered';

      if (!nextStatus) return;

      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: nextStatus,
        timeline: arrayUnion({
          status: nextStatus,
          timestamp: new Date().toISOString(),
          userId: 'dispatcher_admin'
        }),
        // If delivered, mark completedAt
        ...(nextStatus === 'delivered' ? { completedAt: new Date().toISOString() } : {})
      });

      // If delivered, release driver
      if (nextStatus === 'delivered' && driverId) {
        const driverRef = doc(db, 'drivers', driverId);
        await updateDoc(driverRef, {
          status: 'idle',
          activeOrderId: null
        });
      }

      fetchDrivers();
    } catch (e) {
      console.error("Error advancing order status:", e);
    }
  };

  // Stats calculation
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeDeliveries = orders.filter(o => ['assigned', 'picking_up', 'in_transit'].includes(o.status));
  const activeDrivers = drivers.filter(d => d.status === 'busy').length;
  const idleDrivers = drivers.filter(d => d.status === 'idle').length;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white">
            EY
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white block">ENVIOS-YA</span>
            <span className="text-[10px] block text-orange-500 font-bold tracking-wider">CONSOLA DESPACHO</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-orange-600/10 text-orange-500 font-bold transition-colors">
            <Layers size={18} />
            Coordinación
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors">
            <MapPin size={18} />
            Monitoreo GPS
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors">
            <Truck size={18} />
            Conductores ({drivers.length})
          </a>
        </nav>
        <div className="p-4 border-t border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center font-bold text-sm text-white">
            A
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Admin Central</p>
            <p className="text-xs text-slate-500">Antigua GT Dispatch</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-8 flex flex-col">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Control de Distribución</h1>
            <p className="text-sm text-slate-400">Coordinación de pedidos y asignación manual de pilotos en tiempo real.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Servicio logístico conectado</span>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-slate-400">Órdenes sin Asignar</span>
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                <Clock size={20} />
              </div>
            </div>
            <span className="text-3xl font-extrabold text-white">{pendingOrders.length}</span>
            <span className="text-xs block text-slate-500 mt-2">Esperando piloto express</span>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-slate-400">En Ruta / En Tránsito</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Truck size={20} />
              </div>
            </div>
            <span className="text-3xl font-extrabold text-white">{activeDeliveries.length}</span>
            <span className="text-xs block text-emerald-400 mt-2 font-semibold">
              {orders.filter(o => o.status === 'in_transit').length} volando a destino
            </span>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-slate-400">Pilotos Activos</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <Users size={20} />
              </div>
            </div>
            <span className="text-3xl font-extrabold text-white">{activeDrivers} / {drivers.length}</span>
            <span className="text-xs block text-slate-500 mt-2">{idleDrivers} libres para asignar</span>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-slate-400">Efectivo (COD) en Ruta</span>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                <DollarSign size={20} />
              </div>
            </div>
            <span className="text-3xl font-extrabold text-white">
              Q{orders.filter(o => o.status !== 'delivered').reduce((acc, o) => acc + (o.payment?.codAmount || 0), 0).toFixed(2)}
            </span>
            <span className="text-xs block text-yellow-500 mt-2 font-semibold">Por liquidar en base física</span>
          </div>
        </div>

        {/* Queues and Drivers List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
          {/* Active Orders List */}
          <div className="lg:col-span-2 p-6 rounded-xl border border-slate-800 bg-slate-900 flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-white">Cola de Pedidos</h2>

            {ordersLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
                <span>Cargando órdenes desde Firestore...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-20 border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
                No hay órdenes pendientes en este momento.
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
                {orders.map((order) => {
                  const driver = drivers.find(d => d.uid === order.driverId);
                  return (
                    <div key={order.orderId} className="p-4 rounded-lg bg-slate-950 border border-slate-800 hover:border-orange-500/50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-orange-500">{order.orderId}</span>
                          <span className="text-xs text-slate-400">• {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-200 mt-1">{order.cargo?.description || "Paquete Express"}</h3>
                        <div className="space-y-1 mt-2 text-xs text-slate-400">
                          <p><span className="font-semibold text-slate-500">De:</span> {order.origin?.address}</p>
                          <p><span className="font-semibold text-slate-500">A:</span> {order.destination?.address}</p>
                          <p><span className="font-semibold text-slate-500">Cobro COD:</span> <span className="font-bold text-orange-500">Q{order.payment?.codAmount?.toFixed(2)}</span></p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 shrink-0 w-full sm:w-auto">
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-slate-800 text-slate-300">
                          {order.status === 'pending' ? 'Pendiente' :
                           order.status === 'assigned' ? 'Asignado' :
                           order.status === 'picking_up' ? 'Recolectando' :
                           order.status === 'in_transit' ? 'En camino' : order.status}
                        </span>

                        {order.status === 'pending' ? (
                          <button
                            onClick={() => { setSelectedOrder(order); setAssignModalOpen(true); }}
                            className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all"
                          >
                            Asignar Piloto
                          </button>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] text-slate-500">Piloto: <span className="font-semibold text-slate-300">{driver?.name || "Asignado"}</span></span>
                            {order.status !== 'delivered' && (
                              <button
                                onClick={() => advanceOrderStatus(order.orderId, order.status, order.driverId)}
                                className="px-3 py-1 rounded bg-slate-800 hover:bg-orange-500/20 hover:text-orange-500 border border-slate-700 hover:border-orange-500/30 text-slate-300 font-bold text-[10px] transition-all"
                              >
                                {order.status === 'assigned' ? 'Iniciar Recolección' :
                                 order.status === 'picking_up' ? 'Despachar (En Camino)' :
                                 order.status === 'in_transit' ? 'Confirmar Entrega' : ''}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Drivers List */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-white">Monitoreo de Pilotos</h2>
            
            {loadingDrivers ? (
              <div className="flex-grow flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4 flex-grow overflow-y-auto max-h-[500px]">
                {drivers.map((driver) => (
                  <div key={driver.uid} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm text-slate-200">{driver.name}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${driver.status === 'idle' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {driver.status === 'idle' ? 'Libre' : 'Ocupado'}
                      </span>
                    </div>
                    <p className="text-slate-400">Vehículo: <span className="font-medium text-slate-300">{driver.vehicleType === 'motorcycle' ? 'Moto Express' : 'Camión/Pickup'}</span></p>
                    <p className="text-slate-400 mt-1">Contacto: <span className="font-mono text-slate-300">{driver.phone}</span></p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Assignment Modal */}
      {assignModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-white mb-2">Asignar Piloto Express</h3>
            <p className="text-xs text-slate-400 mb-4">
              Selecciona uno de los pilotos libres para llevar el pedido <span className="font-mono text-orange-500 font-bold">{selectedOrder.orderId}</span> a {selectedOrder.destination?.address}.
            </p>

            <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-1">
              {drivers.filter(d => d.status === 'idle').length === 0 ? (
                <p className="text-xs text-center text-yellow-500 py-4 font-semibold">No hay pilotos libres en este momento.</p>
              ) : (
                drivers
                  .filter(d => d.status === 'idle')
                  .map(d => (
                    <button
                      key={d.uid}
                      onClick={() => handleAssignDriver(d.uid, d.name)}
                      className="w-full text-left p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-orange-500/50 hover:bg-slate-900 transition-all flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-xs text-slate-200 block">{d.name}</span>
                        <span className="text-[10px] text-slate-400">{d.vehicleType === 'motorcycle' ? 'MOTO' : 'PICKUP'} • {d.phone}</span>
                      </div>
                      <span className="text-[10px] bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded font-bold">Asignar</span>
                    </button>
                  ))
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setAssignModalOpen(false); setSelectedOrder(null); }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
