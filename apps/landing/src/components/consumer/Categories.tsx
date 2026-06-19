"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/mock-data";
import { getCloudinaryUrl } from "@/lib/cloudinary";

const CATEGORY_IMGS: Record<string, string> = {
  restaurantes: "https://picsum.photos/seed/rest-cat/80/80",
  cafeterias: "https://picsum.photos/seed/cafe-cat/80/80",
  supermercados: "https://picsum.photos/seed/super-cat/80/80",
  farmacias: "https://picsum.photos/seed/farma-cat/80/80",
  panaderias: "https://picsum.photos/seed/pan-cat/80/80",
  conveniencia: "https://picsum.photos/seed/conv-cat/80/80",
  carnicerias: "https://picsum.photos/seed/carn-cat/80/80",
  fruterias: "https://picsum.photos/seed/frut-cat/80/80",
  mascotas: "https://picsum.photos/seed/masc-cat/80/80",
  tecnologia: "https://picsum.photos/seed/tec-cat/80/80",
  licores: "https://picsum.photos/seed/lic-cat/80/80",
  postres: "https://picsum.photos/seed/postre-cat/80/80",
};

interface CategoriesProps {
  onSelect?: (key: string) => void;
}

export function Categories({ onSelect }: CategoriesProps) {
  const [active, setActive] = useState<string | null>(null);

  const handleSelect = (key: string) => {
    setActive(key === active ? null : key);
    onSelect?.(key === active ? "" : key);
  };

  return (
    <section style={{ padding: "32px 24px", background: "#f8f8fa" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#1a1a1a",
            margin: "0 0 20px",
            letterSpacing: "-0.01em",
          }}
        >
          Categorías Populares
        </h2>

        {/* Scrollable row */}
        <div
          style={{
            display: "flex",
            gap: 14,
            overflowX: "auto",
            paddingBottom: 6,
            scrollbarWidth: "none",
          }}
        >
          {CATEGORIES.slice(0, 6).map((cat) => {
            const isActive = active === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => handleSelect(cat.key)}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 18px",
                  borderRadius: 16,
                  border: isActive ? "2px solid #E85D1B" : "1.5px solid #e8e8ec",
                  background: isActive ? "#E85D1B" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  minWidth: 110,
                  boxShadow: isActive
                    ? "0 8px 24px rgba(232,93,27,0.25)"
                    : "0 2px 8px rgba(0,0,0,0.06)",
                  transform: isActive ? "translateY(-3px)" : "translateY(0)",
                }}
              >
                {/* Image */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    overflow: "hidden",
                    background: isActive ? "rgba(255,255,255,0.2)" : "#fff3ec",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <img
                    src={getCloudinaryUrl(CATEGORY_IMGS[cat.key])}
                    alt={cat.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {isActive && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(232,93,27,0.15)",
                        borderRadius: 12,
                      }}
                    />
                  )}
                  {isActive && (
                    <div
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        background: "#fff",
                        color: "#E85D1B",
                        borderRadius: 999,
                        fontSize: 9,
                        fontWeight: 800,
                        padding: "2px 5px",
                        border: "1.5px solid #E85D1B",
                      }}
                    >
                      {cat.count}+
                    </div>
                  )}
                </div>

                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: isActive ? "#fff" : "#1a1a1a",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {cat.name}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: isActive ? "rgba(255,255,255,0.75)" : "#9A9AA4",
                  }}
                >
                  {cat.count} locales
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
