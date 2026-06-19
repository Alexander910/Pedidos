"use client";

import React from 'react';
import { 
  Plus, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  CreditCard,
  Building,
  Bell
} from 'lucide-react';

export default function ClientPortalHome() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-primary">ENVIOS-YA</span>
            <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">Portal Clientes</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <Bell size={18} />
              <div className="w-2 h-2 rounded-full bg-primary absolute top-1.5 right-1.5" />
            </button>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold">Casa Santo Domingo</p>
                <p className="text-[10px] text-muted-foreground">Premium Partner (Guatemala)</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <Building size={16} className="text-primary" />
              </div>
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
              Solicitar Nuevo Envío
            </h2>
            
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dirección de Origen</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="Calle del Arco #4, Antigua Guatemala" 
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
                      placeholder="Apartamento 3B, Airbnb Casa Santo Domingo" 
                      className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detalles del Paquete</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Desayuno típico, llaves, documentos..." 
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cobrar en Destino (COD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-sm text-muted-foreground font-semibold">Q</span>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      className="w-full bg-background border border-border rounded-lg pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="text-xs text-muted-foreground">
                  Descuento corporate de <span className="text-emerald-500 font-bold">15%</span> aplicado automáticamente.
                </div>
                <button className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/95 transition-all shadow-md text-sm">
                  Confirmar Envío Express
                </button>
              </div>
            </form>
          </section>

          {/* Active Orders List */}
          <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              Tus Envíos Activos
            </h2>
            <div className="space-y-3">
              {[
                { id: 'ORD-9833', desc: 'Comida + Llaves', dest: 'Santo Domingo Apto 3B', status: 'En ruta', eta: '10 min', pilot: 'Carlos M.' },
                { id: 'ORD-9830', desc: 'Maletas de Huésped', dest: 'Aeropuerto La Aurora', status: 'Asignado', eta: '35 min', pilot: 'Jorge L.' }
              ].map((order) => (
                <div key={order.id} className="flex justify-between items-center p-4 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Clock size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary">{order.id}</span>
                        <span className="text-sm font-semibold">{order.desc}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Destino: {order.dest} | Piloto: {order.pilot}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-secondary font-semibold text-foreground">{order.status}</span>
                    <p className="text-xs text-muted-foreground mt-1 font-medium text-emerald-500">ETA: {order.eta}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
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
                <span className="text-sm font-bold">142</span>
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
              <p className="text-3xl font-extrabold text-foreground mt-1">Q2,410.50</p>
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
