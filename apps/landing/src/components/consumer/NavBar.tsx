"use client";

import { useState } from "react";
import { Search, ShoppingCart, User, Building } from "lucide-react";
import Link from "next/link";

interface NavBarProps {
  cartCount?: number;
  cartTotal?: number;
  onCartClick?: () => void;
}

export function NavBar({ cartCount = 0, cartTotal = 0, onCartClick }: NavBarProps) {
  const [search, setSearch] = useState("");

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 60,
        background: "#121824", // Sleek dark slate
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          height: 64,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "#E85D1B", // Brand Orange
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17h2m-2 0a2 2 0 104 0m-4 0V9l2-5h7l3 5h3v8m-3 0a2 2 0 104 0m-4 0H9" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: "-0.02em" }}>ENVIOS-YA</span>
            <span style={{ fontSize: 9, color: "#E85D1B", fontWeight: 700, letterSpacing: "0.1em" }}>PEDIDOS GT</span>
          </div>
        </Link>

        {/* Search */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(255,255,255,0.07)",
            border: "1.5px solid rgba(255,255,255,0.12)",
            borderRadius: 999,
            padding: "0 16px",
            height: 42,
            maxWidth: 400,
          }}
        >
          <Search size={16} color="rgba(255,255,255,0.4)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar restaurantes, supermercados…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: 14,
            }}
          />
        </div>

        {/* Navigation Portals */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginLeft: "auto", flexShrink: 0 }}>
          <a 
            href="http://localhost:3002" 
            style={{ 
              color: "rgba(255,255,255,0.8)", 
              fontSize: 13, 
              fontWeight: 600, 
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#E85D1B"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
          >
            <Building size={14} />
            <span className="hidden md:inline">Portal Corporativo</span>
          </a>

          {/* Cart */}
          <button
            onClick={onCartClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#E85D1B",
              border: "none",
              borderRadius: 999,
              padding: "0 16px",
              height: 40,
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(232,93,27,0.3)",
            }}
          >
            <ShoppingCart size={16} />
            {cartCount > 0 ? (
              <span>{cartCount} | Q{cartTotal.toFixed(2)}</span>
            ) : (
              <span>Carrito</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
