"use client";

import { useState } from "react";
import { Search, MapPin, ShoppingCart, ChevronDown, User } from "lucide-react";
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
        background: "#1a1a1a",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 2px 20px rgba(0,0,0,0.4)",
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
              background: "#FF6B00",
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
          <span style={{ fontWeight: 800, fontSize: 20, color: "#fff", letterSpacing: "-0.02em" }}>Pedidos Ya</span>
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
            maxWidth: 480,
          }}
        >
          <Search size={16} color="rgba(255,255,255,0.4)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar restaurantes, productos…"
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

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto", flexShrink: 0 }}>
          {/* Profile */}
          <button
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <User size={18} color="#fff" />
          </button>

          {/* Cart */}
          <button
            onClick={onCartClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#FF6B00",
              border: "none",
              borderRadius: 999,
              padding: "0 16px",
              height: 40,
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(255,107,0,0.4)",
            }}
          >
            <ShoppingCart size={16} />
            {cartCount > 0 ? (
              <span>{cartCount} ítem{cartCount > 1 ? "s" : ""}, Q{cartTotal.toFixed(2)}</span>
            ) : (
              <span>Carrito</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
