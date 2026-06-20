"use client";

import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  CreditCard,
  Building,
  Bell,
  Loader2
} from 'lucide-react';
import { db } from '@envios-ya/firebase/src/client';
import { useAuth } from '@envios-ya/firebase';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ClientPortalHome() {
  const router = useRouter();
  const { user, profile, role, loading, logout } = useAuth();

  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [cargoDescription, setCargoDescription] = useState('');
  const [codAmount, setCodAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<Record<string, any>>({});
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Simulated session states
  const [simulatedUser, setSimulatedUser] = useState<any>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const sim = localStorage.getItem('envios_ya_sim_user');
    if (sim) {
      setSimulatedUser(JSON.parse(sim));
    }
    setAuthInitialized(true);
  }, []);

  useEffect(() => {
    if (!authInitialized || loading) return;

    // If no real session and no simulated session, redirect to login
    if (!user && !simulatedUser) {
      router.push('/login');
    }
  }, [user, simulatedUser, loading, authInitialized, router]);

  const activeUser = profile || simulatedUser || (user ? { name: user.displayName || user.email, email: user.email } : null);
  const activeCompanyId = profile?.companyId || simulatedUser?.companyId || (user ? 'hotel_santo_domingo' : '');
  const activeRole = role || simulatedUser?.role || 'client';

  const activeCompanyName = activeCompanyId === 'hotel_santo_domingo' ? 'Casa Santo Domingo' :
                             activeCompanyId === 'restaurante_antigua' ? 'Restaurante Antigua' :
                             activeCompanyId === 'envios_ya_corp' ? 'Envios-Ya Corp' : 
                             activeCompanyId === 'global' ? 'Acceso Global' :
                             activeCompanyId || 'Socio Comercial';

  // 1. Subscribe to drivers to translate driverId to driver name in real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'drivers'), (snap) => {
      const dMap: Record<string, any> = {};
      snap.forEach(docSnap => {
        dMap[docSnap.id] = docSnap.data();
      });
      setDrivers(dMap);
    });
    return () => unsub();
  }, []);

  // 2. Subscribe to orders created by activeCompanyId
  useEffect(() => {
    if (!authInitialized || loading) return;
    if (!user && !simulatedUser) return;

    setLoadingOrders(true);
    const unsub = onSnapshot(collection(db, 'orders'), (snap) => {
      let list = snap.docs.map(docSnap => ({ orderId: docSnap.id, ...docSnap.data() }));
      
      // If client or partner, filter by company
      if (activeRole !== 'super_admin' && activeRole !== 'admin') {
        list = list.filter((o: any) => o.clientId === activeCompanyId);
      }
      
      // Sort locally by createdAt desc
      list.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      
      setOrders(list);
      setLoadingOrders(false);
    }, (err) => {
      console.error("Error subscribing to client orders:", err);
      setLoadingOrders(false);
    });
    return () => unsub();
  }, [activeCompanyId, activeRole, authInitialized, loading, user, simulatedUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originAddress.trim() || !destinationAddress.trim() || !cargoDescription.trim()) {
      alert("Por favor completa los campos requeridos.");
      return;
    }

    setSubmitting(true);
    try {
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const deliveryCost = 15.00; // standard delivery cost in GTQ

      const newOrder = {
        orderId,
        clientId: activeCompanyId || "hotel_santo_domingo",
        driverId: null,
        status: "pending",
        origin: {
          address: originAddress,
          latitude: 14.5573,
          longitude: -90.7332,
        },
        destination: {
          address: destinationAddress,
          latitude: 14.56 + (Math.random() - 0.5) * 0.02,
          longitude: -90.73 + (Math.random() - 0.5) * 0.02,
        },
        cargo: {
          description: cargoDescription,
          instructions: "Entregar en puerta o recepción"
        },
        payment: {
          method: "cash_on_delivery",
          codAmount: Number(codAmount) || 0,
          deliveryPrice: deliveryCost,
          driverCommission: deliveryCost * 0.8, // 80% commission
          currency: "GTQ",
        },
        timeline: [
          {
            status: "pending",
            timestamp: new Date().toISOString(),
            userId: activeCompanyId || "hotel_santo_domingo",
          },
        ],
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "orders", orderId), newOrder);

      // Clear form fields
      setOriginAddress('');
      setDestinationAddress('');
      setCargoDescription('');
      setCodAmount('');

      alert(`Solicitud de envío ${orderId} creada con éxito.`);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Hubo un error al crear la solicitud. Por favor intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Buscando Piloto';
      case 'assigned': return 'Piloto Asignado';
      case 'picking_up': return 'Recolección';
      case 'arrived_origin': return 'Llegó a Origen';
      case 'in_transit': return 'En Ruta';
      case 'arrived_destination': return 'En Destino';
      case 'delivered': return 'Entregado';
      default: return status;
    }
  };

  const getETA = (status: string) => {
    if (status === 'pending') return 'Buscando...';
    if (status === 'delivered') return 'Entregado';
    return '15-20 min';
  };

  const handleLogout = async () => {
    localStorage.removeItem('envios_ya_sim_user');
    await logout();
    router.push('/login');
  };

  const activeOrders = orders.filter(o => o.status !== 'delivered');
  const pastOrders = orders.filter(o => o.status === 'delivered');

  if (!authInitialized || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-orange-500" size={32} />
        <p className="text-xs text-slate-400">Verificando sesión...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-primary">ENVIOS-YA</span>
            <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">Portal Clientes</span>
            <Link href="/rbac" className="text-xs font-bold text-orange-500 hover:text-orange-400 border border-orange-500/20 bg-orange-500/5 px-2.5 py-0.5 rounded-full transition-all">
              Gestionar Roles (RBAC) y Empresas
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <Bell size={18} />
              {activeOrders.length > 0 && (
                <div className="w-2 h-2 rounded-full bg-primary absolute top-1.5 right-1.5" />
              )}
            </button>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-3 bg-secondary/10 px-3 py-1.5 rounded-xl border border-border/40">
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{activeUser?.name || 'Invitado'}</p>
                <p className="text-[10px] text-muted-foreground">
                  {activeCompanyName} ({activeRole === 'super_admin' ? 'Super Admin' :
                   activeRole === 'admin' ? 'Admin' :
                   activeRole === 'pilot' ? 'Piloto' :
                   activeRole === 'partner' ? 'Socio' : 'Cliente'})
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className="ml-1.5 px-2 py-0.5 text-[10px] font-bold text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/30 bg-red-500/5 hover:bg-red-500/10 rounded-lg transition-all"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Form and Active Orders */}
        <div className="lg:col-span-2 space-y-8">
          {/* Create Order Form */}
          <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus size={20} className="text-primary" />
              Solicitar Nuevo Envío / Mandado
            </h2>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dirección de Origen</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3 text-muted-foreground" />
                    <input 
                      type="text" 
                      required
                      placeholder="Calle del Arco #4, Antigua Guatemala" 
                      value={originAddress}
                      onChange={(e) => setOriginAddress(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dirección de Destino</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3 text-muted-foreground" />
                    <input 
                      type="text" 
                      required
                      placeholder="Apartamento 3B, Airbnb Casa Santo Domingo" 
                      value={destinationAddress}
                      onChange={(e) => setDestinationAddress(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detalles del Paquete o Mandado</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Desayuno típico, llaves, documentos..." 
                    value={cargoDescription}
                    onChange={(e) => setCargoDescription(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monto a Cobrar (COD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-sm text-muted-foreground font-semibold">Q</span>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={codAmount}
                      onChange={(e) => setCodAmount(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="text-xs text-muted-foreground">
                  Descuento corporate de <span className="text-emerald-500 font-bold">15%</span> aplicado automáticamente.
                </div>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/95 transition-all shadow-md text-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  Confirmar Envío Express
                </button>
              </div>
            </form>
          </section>

          {/* Active Orders List */}
          <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              Tus Envíos Activos ({activeOrders.length})
            </h2>
            
            {loadingOrders ? (
              <div className="py-8 flex justify-center items-center">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
                No tienes solicitudes de envío activas en este momento.
              </div>
            ) : (
              <div className="space-y-3">
                {activeOrders.map((order) => {
                  const pilotName = order.driverId ? (drivers[order.driverId]?.name || 'Asignado') : 'Asignando piloto...';
                  return (
                    <div key={order.orderId} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors gap-3">
                      <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                          <Clock size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary font-mono">{order.orderId}</span>
                            <span className="text-sm font-bold text-foreground">{order.cargo?.description}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            <span className="font-semibold">Origen:</span> {order.origin?.address}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-semibold">Destino:</span> {order.destination?.address}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-semibold">Piloto:</span> {pilotName}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-secondary font-semibold text-foreground">
                          {getStatusLabel(order.status)}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1 font-medium text-emerald-500">
                          ETA: {getETA(order.status)}
                        </p>
                        {order.payment?.codAmount > 0 && (
                          <p className="text-xs font-bold text-orange-500 mt-0.5">
                            Cobro COD: Q{order.payment.codAmount.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Historial de Envíos */}
          {pastOrders.length > 0 && (
            <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" />
                Historial Reciente (Entregados)
              </h2>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {pastOrders.slice(0, 10).map((order) => (
                  <div key={order.orderId} className="flex justify-between items-center p-3 rounded-lg bg-background border border-border text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-primary">{order.orderId}</span>
                        <span className="font-semibold text-foreground">{order.cargo?.description}</span>
                      </div>
                      <p className="text-slate-400 mt-0.5 truncate max-w-[300px]">{order.destination?.address}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-500 font-semibold">Entregado</span>
                      <p className="text-slate-500 font-mono mt-0.5">
                        {order.completedAt ? new Date(order.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Col: Stats and Billing */}
        <div className="space-y-8">
          {/* Account Tier Info */}
          <div className="p-6 bg-card border border-border rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Estado Cuenta</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Plan Comercial:</span>
                <span className="text-sm font-bold text-primary">Socio Hotelero</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tarifa Fija Km:</span>
                <span className="text-sm font-bold">Q3.50</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Envíos este mes:</span>
                <span className="text-sm font-bold">{orders.length}</span>
              </div>
            </div>
          </div>

          {/* Billing / Invoice balance summary */}
          <div className="p-6 bg-gradient-to-br from-card to-secondary/30 border border-border rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <CreditCard size={16} />
              Balance de Facturación
            </h3>
            <div>
              <span className="text-xs text-muted-foreground">Pendiente de Pago (Corte mensual):</span>
              <p className="text-3xl font-extrabold text-foreground mt-1">
                Q{(orders.length * 15 * 0.85).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg border border-border flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Fecha de corte:</span>
              <span className="font-semibold text-foreground">30 Jun, 2026</span>
            </div>
            <button className="w-full py-2.5 rounded-lg bg-secondary text-foreground font-bold hover:bg-secondary/80 transition-colors text-xs">
              Descargar Detalle CSV
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
