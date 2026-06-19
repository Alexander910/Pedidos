"use client";

import { useEffect, useState } from "react";
import { Heart, Star, Clock, Truck } from "lucide-react";
import { getBusinesses, Business } from "@/lib/database";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import type { ActiveFilters } from "./FilterSidebar";
import Link from "next/link";

function storeVisible(s: Business, filters: ActiveFilters): boolean {
  if (filters.cat.size && !filters.cat.has(s.sub)) return false;
  if (filters.price.size && !filters.price.has(String(s.price))) return false;
  if (filters.distance.size && !Array.from(filters.distance).some((d) => s.distance <= Number(d))) return false;
  if (filters.time.size && !Array.from(filters.time).some((t) => s.eta <= Number(t))) return false;
  if (filters.promo.size && !Array.from(filters.promo).some((p) => s.promo.includes(p))) return false;
  if (filters.rating.size && !Array.from(filters.rating).some((r) => s.rating >= Number(r))) return false;
  return true;
}

interface StoreGridProps {
  filters: ActiveFilters;
}

export function StoreGrid({ filters }: StoreGridProps) {
  const [stores, setStores] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<Set<number>>(new Set());

  useEffect(() => {
    getBusinesses().then((data) => {
      setStores(data);
      setLoading(false);
    });
  }, []);

  const visible = stores.filter((s) => storeVisible(s, filters));

  const toggleLike = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
          Cargando comercios...
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 18,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                height: 240,
                background: "#eee",
                borderRadius: 16,
                animation: "pulse 1.5s infinite",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", margin: 0, letterSpacing: "-0.01em" }}>
          Comercios Destacados
        </h2>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#E85D1B" }}>
          Guatemala
        </span>
      </div>

      {visible.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#9A9AA4", fontSize: 15 }}>
          No se encontraron comercios con esos filtros.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 18,
          }}
        >
          {visible.map((store) => (
            <Link
              key={store.id}
              href={`/business/${store.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1px solid #e8e8ec",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 28px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)";
                }}
              >
                {/* Image optimized via Cloudinary */}
                <div style={{ position: "relative", height: 148, background: "#f0f0f4" }}>
                  <img
                    src={getCloudinaryUrl(store.img)}
                    alt={store.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {/* Gradient overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.45))",
                    }}
                  />

                  {/* Badge */}
                  {store.badgeText && (
                    <div
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        background:
                          store.badge === "b-bestseller" ? "#1a1a1a" :
                          store.badge === "b-new" ? "#E85D1B" :
                          store.badge === "b-free" ? "#1FAA59" : "#7A4DFF",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "3px 9px",
                        borderRadius: 999,
                        letterSpacing: "0.02em",
                        textTransform: "uppercase",
                      }}
                    >
                      {store.badgeText}
                    </div>
                  )}

                  {/* Heart */}
                  <button
                    onClick={(e) => toggleLike(store.id, e)}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.9)",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    }}
                  >
                    <Heart
                      size={14}
                      color={liked.has(store.id) ? "#E85D1B" : "#9A9AA4"}
                      fill={liked.has(store.id) ? "#E85D1B" : "none"}
                    />
                  </button>

                  {/* Store logo */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: -16,
                      left: 12,
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "#fff",
                      border: "2px solid #fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 14,
                      color: "#E85D1B",
                    }}
                  >
                    {store.name.charAt(0)}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: "22px 12px 14px" }}>
                  <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>
                    {store.name}
                  </p>
                  <p style={{ margin: "0 0 10px", fontSize: 12, color: "#9A9AA4" }}>{store.category}</p>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#54545E" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#E85D1B", fontWeight: 700 }}>
                      <Star size={11} fill="#E85D1B" color="#E85D1B" /> {store.rating}
                    </span>
                    <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#d0d0d8", display: "inline-block" }} />
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Clock size={11} /> {store.eta} min
                    </span>
                    <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#d0d0d8", display: "inline-block" }} />
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Truck size={11} /> {store.promo.includes("envio_gratis") ? "Gratis" : `Q${(8 + store.price * 2).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
