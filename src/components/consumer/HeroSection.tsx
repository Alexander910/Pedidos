"use client";

import Image from "next/image";
import { Search } from "lucide-react";

interface HeroSectionProps {
  onOrderNow?: () => void;
  onExplore?: () => void;
}

export function HeroSection({ onOrderNow, onExplore }: HeroSectionProps) {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, #1a1a1a 0%, #2a1a0a 50%, #1a1a1a 100%)",
        position: "relative",
        overflow: "hidden",
        minHeight: 340,
      }}
    >
      {/* subtle glow blobs */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(255,107,0,0.18) 0%, transparent 70%)",
          top: -100,
          left: "calc(50% - 250px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          background: "radial-gradient(circle, rgba(255,140,66,0.12) 0%, transparent 70%)",
          bottom: -50,
          left: 100,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "64px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-geist-sans), sans-serif",
            fontSize: "clamp(28px, 4.5vw, 56px)",
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.15,
            margin: "0 0 16px",
            letterSpacing: "-0.02em",
            maxWidth: 800,
          }}
        >
          Pide comida, supermercado
          <br />y mucho más en minutos.
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "clamp(15px, 1.8vw, 18px)",
            margin: "0 0 32px",
            lineHeight: 1.55,
            maxWidth: 600,
          }}
        >
          Explora restaurantes, tiendas y entregas rápidas en (Tu Ubicación).
        </p>

        {/* Search bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(255,255,255,0.07)",
            border: "1.5px solid rgba(255,255,255,0.12)",
            borderRadius: 999,
            padding: "12px 20px",
            marginBottom: 24,
            width: "100%",
            maxWidth: 540,
          }}
        >
          <Search size={18} color="rgba(255,255,255,0.4)" />
          <input
            type="text"
            placeholder="¿Qué se te antoja hoy?"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: 15,
            }}
          />
        </div>

        {/* CTA Buttons */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={onOrderNow}
            style={{
              background: "#FF6B00",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              padding: "14px 32px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(255,107,0,0.45)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 10px 28px rgba(255,107,0,0.55)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(255,107,0,0.45)";
            }}
          >
            Ordenar ahora
          </button>
          <button
            onClick={onExplore}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "1.5px solid rgba(255,255,255,0.2)",
              borderRadius: 999,
              padding: "14px 32px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              backdropFilter: "blur(8px)",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.16)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
            }}
          >
            Explorar categorías
          </button>
        </div>
      </div>
    </section>
  );
}
