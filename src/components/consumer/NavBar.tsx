"use client";

import { useEffect, useState } from "react";
import { Search, MapPin, ShoppingCart, ChevronDown, User } from "lucide-react";
import { signInWithGoogle, auth } from "@/firebase/client";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface NavBarProps {
  cartCount?: number;
  cartTotal?: number;
  onCartClick?: () => void;
}

export function NavBar({ cartCount = 0, cartTotal = 0, onCartClick }: NavBarProps) {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

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

          {/* Grouped user controls (dropdown menu) */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  title={user.displayName || "Cuenta"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    height: 40,
                    padding: "0 10px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="avatar" style={{ width: 28, height: 28, borderRadius: "50%" }} />
                  ) : (
                    <User size={18} color="#fff" />
                  )}
                  <span style={{ fontSize: 13, fontWeight: 700 }}>
                    {user.displayName || "Mi cuenta"}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <div style={{ padding: "0.5rem 0.75rem", fontSize: 12, color: "rgba(255,255,255,0.72)", whiteSpace: "nowrap" }}>
                    {user.displayName || user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { /* navegar a perfil */ }}>Mi perfil</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { /* navegar a pedidos */ }}>Mis pedidos</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { /* navegar a ajustes */ }}>Ajustes</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => firebaseSignOut(auth)}>Cerrar sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={signInWithGoogle}
                title="Iniciar sesión"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  height: 40,
                  padding: "0 10px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <User size={18} color="#fff" />
                <span style={{ fontSize: 13, fontWeight: 700 }}>Iniciar sesión</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
