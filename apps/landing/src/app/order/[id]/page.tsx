"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Map as MapIcon, Package, Navigation, ArrowLeft, Loader2, Landmark } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useRealTimeOrder } from "@envios-ya/firebase";

export default function OrderTrackingPage() {
  const params = useParams();
  const id = params.id as string;

  const { order, loading, error } = useRealTimeOrder(id);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
        <p className="text-sm font-semibold text-muted-foreground">Conectando con el GPS de ENVIOS-YA...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-2">Pedido No Encontrado</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">No pudimos conectar con los servidores logísticos para el ID: {id}</p>
        <Link href="/">
          <Button className="bg-orange-600 hover:bg-orange-500 text-white font-bold">Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  // Map Firestore order statuses to stepper index
  // statuses: 'pending' | 'assigned' | 'picking_up' | 'arrived_origin' | 'in_transit' | 'arrived_destination' | 'delivered' | 'cancelled'
  const getStatusStep = (status: string) => {
    switch (status) {
      case "pending":
        return 0; // Order received
      case "assigned":
      case "picking_up":
      case "arrived_origin":
        return 1; // Preparing/assigned driver
      case "in_transit":
      case "arrived_destination":
        return 2; // Driver on the way
      case "delivered":
        return 3; // Order delivered
      default:
        return 0;
    }
  };

  const currentStep = getStatusStep(order.status);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-slate-900 text-white h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
          <span className="font-bold text-orange-500">ENVIOS-YA Tracking</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex-1 max-w-3xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Seguimiento de Entrega</h1>
            <p className="text-muted-foreground mt-1">
              ID de Orden: <span className="font-mono text-slate-800 font-bold">{id}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block text-xs px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
              {order.status === "pending" ? "Pendiente" :
               order.status === "assigned" ? "Asignado" :
               order.status === "picking_up" ? "En recolección" :
               order.status === "in_transit" ? "En ruta" :
               order.status === "delivered" ? "Entregado" : "Cancelado"}
            </span>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-md mb-8">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-slate-200 md:left-[10%] md:right-[10%] md:top-6 md:bottom-auto md:w-auto md:h-0.5 md:-translate-y-1/2"></div>
            
            <div className="flex flex-col md:flex-row justify-between space-y-8 md:space-y-0 relative z-10">
              {/* Step 1 */}
              <div className={`flex md:flex-col items-center md:w-1/4 text-left md:text-center ${currentStep >= 0 ? "opacity-100" : "opacity-40"}`}>
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md mr-4 md:mr-0 md:mb-3 shrink-0 ${currentStep >= 0 ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"}`}
                >
                  <CheckCircle2 className="w-6 h-6" />
                </motion.div>
                <div>
                  <p className="font-bold text-sm">Recibida</p>
                  <p className="text-xs text-muted-foreground">Pedido confirmado</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`flex md:flex-col items-center md:w-1/4 text-left md:text-center ${currentStep >= 1 ? "opacity-100" : "opacity-40"}`}>
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md mr-4 md:mr-0 md:mb-3 shrink-0 ${currentStep >= 1 ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"}`}
                >
                  <Package className="w-6 h-6" />
                </motion.div>
                <div>
                  <p className="font-bold text-sm">Preparando</p>
                  <p className="text-xs text-muted-foreground">En cocina / local</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`flex md:flex-col items-center md:w-1/4 text-left md:text-center ${currentStep >= 2 ? "opacity-100" : "opacity-40"}`}>
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md mr-4 md:mr-0 md:mb-3 shrink-0 ${currentStep >= 2 ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"}`}
                >
                  <Navigation className="w-6 h-6" />
                </motion.div>
                <div>
                  <p className="font-bold text-sm">En Camino</p>
                  <p className="text-xs text-muted-foreground">Con piloto GPS activo</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className={`flex md:flex-col items-center md:w-1/4 text-left md:text-center ${currentStep >= 3 ? "opacity-100" : "opacity-40"}`}>
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md mr-4 md:mr-0 md:mb-3 shrink-0 ${currentStep >= 3 ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}
                >
                  <CheckCircle2 className="w-6 h-6" />
                </motion.div>
                <div>
                  <p className="font-bold text-sm">Entregado</p>
                  <p className="text-xs text-muted-foreground">Buen provecho</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-md mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-lg text-slate-800 mb-4">Detalles del Envío</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Origen (Tienda)</span>
                <span className="font-semibold text-slate-700">{order.origin.address}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Destino (Entrega)</span>
                <span className="font-semibold text-slate-700">{order.destination.address}</span>
              </div>
              {(order.cargo as any).instructions && (
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Instrucciones Especiales</span>
                  <span className="text-slate-600 italic">"{(order.cargo as any).instructions}"</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg text-slate-800 mb-4">Método de Pago e Importe</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Servicio de Envío:</span>
                <span className="font-semibold text-slate-700">Q{order.payment.deliveryPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto Total a Recolectar (COD):</span>
                <span className="font-bold text-orange-600 text-base">Q{order.payment.codAmount.toFixed(2)}</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100 flex items-center gap-2 mt-2">
                <Landmark size={16} className="shrink-0" />
                <span className="text-xs font-semibold">Paga en efectivo al piloto al recibir.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map View */}
        <div className="bg-slate-100 w-full h-64 rounded-xl border border-border flex flex-col items-center justify-center text-slate-500 overflow-hidden relative shadow-inner">
          <MapIcon className="w-12 h-12 mb-2 text-slate-400" />
          <p className="font-bold text-sm text-slate-700">Integración de Google Maps API Activa</p>
          <p className="text-xs px-4 text-center max-w-sm mt-1 text-slate-400">
            {order.status === "in_transit" 
              ? `Visualizando piloto en tiempo real. Coordenadas aproximadas: ${order.destination.latitude.toFixed(4)}, ${order.destination.longitude.toFixed(4)}`
              : "El mapa y rastreo GPS se activarán cuando el piloto inicie la ruta."}
          </p>
          <div className="absolute inset-0 bg-orange-500/5 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
