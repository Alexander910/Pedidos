"use client";

import React, { useState } from "react";
import { NavBar } from "@/components/consumer/NavBar";
import { HeroSection } from "@/components/consumer/HeroSection";
import { Categories } from "@/components/consumer/Categories";
import { FilterSidebar } from "@/components/consumer/FilterSidebar";
import { StoreGrid } from "@/components/consumer/StoreGrid";
import type { ActiveFilters } from "@/components/consumer/FilterSidebar";
import { useCartStore } from "@/lib/store/cart-store";
import { 
  Layers, 
  Map, 
  ShieldCheck, 
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const EMPTY_FILTERS: ActiveFilters = {
  cat: new Set(),
  price: new Set(),
  distance: new Set(),
  time: new Set(),
  promo: new Set(),
  rating: new Set(),
};

export default function Home() {
  const [filters, setFilters] = useState<ActiveFilters>(EMPTY_FILTERS);
  const { totalItems, totalPrice } = useCartStore();

  const scrollToStores = () => {
    document.getElementById("stores-section")?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToCategories = () => {
    document.getElementById("categories-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCategorySelect = (categoryKey: string) => {
    setFilters(prev => {
      const nextCat = new Set<string>();
      if (categoryKey) {
        // Map top category key to sub/tag filter value if needed
        nextCat.add(categoryKey);
      }
      return {
        ...prev,
        cat: nextCat
      };
    });
    scrollToStores();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f8fa", display: "flex", flexDirection: "column" }}>
      {/* Dynamic Header connected to Zustand Cart */}
      <NavBar 
        cartCount={totalItems()} 
        cartTotal={totalPrice()} 
        onCartClick={scrollToStores} 
      />

      {/* Hero */}
      <HeroSection onOrderNow={scrollToStores} onExplore={scrollToCategories} />

      {/* Categories Row */}
      <div id="categories-section">
        <Categories onSelect={handleCategorySelect} />
      </div>

      {/* Main content: sidebar + store grid */}
      <div
        id="stores-section"
        style={{
          flex: 1,
          maxWidth: 1280,
          margin: "0 auto",
          width: "100%",
          padding: "32px 24px 64px",
          display: "flex",
          gap: 28,
          alignItems: "flex-start",
        }}
      >
        {/* Left: Filters */}
        <FilterSidebar onChange={setFilters} />

        {/* Right: Store grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <StoreGrid filters={filters} />
        </div>
      </div>

      {/* Integrated B2B Features (Our ideas and branding) */}
      <section className="py-20 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-primary border border-primary/20 text-xs font-semibold">
              <Sparkles size={12} className="text-orange-500" />
              Infraestructura Logística en Guatemala
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Arquitectura Modular SaaS</h2>
            <p className="text-slate-400">¿Eres un comercio? Gestiona tus entregas con nuestra consola interna conectada con GPS en tiempo real y pilotos liquidados de forma transparente.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-slate-800/50 border border-slate-800 rounded-xl space-y-4 hover:border-orange-500/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <Layers size={20} />
              </div>
              <h3 className="text-lg font-bold">ERP Operativo</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Control de pedidos de inicio a fin: Entrada, asignación de pilotos, tracking, entrega y liquidación física de caja.
              </p>
            </div>

            <div className="p-6 bg-slate-800/50 border border-slate-800 rounded-xl space-y-4 hover:border-orange-500/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Map size={20} />
              </div>
              <h3 className="text-lg font-bold">GPS Real-time</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Conexión instantánea de ubicación con mapas (Google Maps / Mapbox) para un rastreo preciso de la carga.
              </p>
            </div>

            <div className="p-6 bg-slate-800/50 border border-slate-800 rounded-xl space-y-4 hover:border-orange-500/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-lg font-bold">Billetera Financiera</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Liquidaciones automáticas de efectivo recolectado (COD). Evita pérdidas cruzando cobros con cuentas de pilotos.
              </p>
            </div>

            <div className="p-6 bg-slate-800/50 border border-slate-800 rounded-xl space-y-4 hover:border-orange-500/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <MessageSquare size={20} />
              </div>
              <h3 className="text-lg font-bold">Social Middleware</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Centralización de pedidos originados en canales como WhatsApp, Facebook Messenger e Instagram de forma asistida.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <a href="http://localhost:3002" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm transition-all shadow-lg shadow-orange-600/20">
              Registrar mi Comercio (Socio)
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "24px",
          color: "#9A9AA4",
          fontSize: 12.5,
          borderTop: "1px solid #e8e8ec",
          background: "#fff",
        }}
      >
        © 2026 ENVIOS-YA Core Platform — Plataforma de pedidos y delivery express en Guatemala.
      </footer>
    </div>
  );
}
