"use client";

import { useState } from "react";
import { NavBar } from "@/components/consumer/NavBar";
import { HeroSection } from "@/components/consumer/HeroSection";
import { Categories } from "@/components/consumer/Categories";
import { FilterSidebar } from "@/components/consumer/FilterSidebar";
import { StoreGrid } from "@/components/consumer/StoreGrid";
import type { ActiveFilters } from "@/components/consumer/FilterSidebar";

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

  const scrollToStores = () => {
    document.getElementById("stores-section")?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToCategories = () => {
    document.getElementById("categories-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f8fa", display: "flex", flexDirection: "column" }}>
      <NavBar />

      <HeroSection onOrderNow={scrollToStores} onExplore={scrollToCategories} />

      <div id="categories-section">
        <Categories />
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
        © 2026 Pedidos Ya — Plataforma de pedidos y delivery
      </footer>
    </div>
  );
}
