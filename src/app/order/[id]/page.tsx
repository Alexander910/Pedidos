"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Map as MapIcon, Package, Navigation, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="container mx-auto px-4 py-8 flex-1 max-w-3xl">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 -ml-4 text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Orden Confirmada</h1>
        <p className="text-muted-foreground mt-1">ID de Orden: <span className="font-mono text-foreground">{id}</span></p>
      </div>

      {/* Progress Tracker */}
      <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-[var(--shadow-deep-shadow)] mb-8">
        <div className="relative">
          <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-muted md:left-1/2 md:top-6 md:bottom-auto md:w-full md:h-0.5 md:-translate-y-1/2 md:-ml-0"></div>
          
          <div className="flex flex-col md:flex-row justify-between space-y-8 md:space-y-0 relative z-10">
            {/* Step 1 */}
            <div className="flex md:flex-col items-center md:w-1/3 text-left md:text-center">
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg mr-4 md:mr-0 md:mb-3 shrink-0"
              >
                <CheckCircle2 className="w-6 h-6" />
              </motion.div>
              <div>
                <p className="font-bold">Orden Recibida</p>
                <p className="text-xs text-muted-foreground">12:30 PM</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex md:flex-col items-center md:w-1/3 text-left md:text-center">
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                transition={{ delay: 0.3 }}
                className="w-12 h-12 rounded-full bg-primary/20 text-primary border-2 border-primary flex items-center justify-center shadow-lg mr-4 md:mr-0 md:mb-3 shrink-0"
              >
                <Package className="w-6 h-6" />
              </motion.div>
              <div>
                <p className="font-bold">Preparando</p>
                <p className="text-xs text-muted-foreground">En cocina</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex md:flex-col items-center md:w-1/3 text-left md:text-center opacity-50">
              <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center mr-4 md:mr-0 md:mb-3 shrink-0">
                <Navigation className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold">En Camino</p>
                <p className="text-xs text-muted-foreground">Esperando repartidor</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-muted w-full h-64 rounded-xl border border-border flex flex-col items-center justify-center text-muted-foreground overflow-hidden relative shadow-inner">
        <MapIcon className="w-12 h-12 mb-2 opacity-50" />
        <p className="font-medium">Integración de Google Maps API</p>
        <p className="text-sm px-4 text-center max-w-sm mt-2 opacity-80">El mapa se mostrará aquí cuando el pedido esté en camino.</p>
        <div className="absolute inset-0 bg-primary/5 pattern-grid-lg" />
      </div>
    </div>
  );
}
