"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { FILTER_GROUPS } from "@/lib/mock-data";

export interface ActiveFilters {
  cat: Set<string>;
  price: Set<string>;
  distance: Set<string>;
  time: Set<string>;
  promo: Set<string>;
  rating: Set<string>;
}

interface FilterSidebarProps {
  onChange: (filters: ActiveFilters) => void;
}

export function FilterSidebar({ onChange }: FilterSidebarProps) {
  const [filters, setFilters] = useState<ActiveFilters>({
    cat: new Set(),
    price: new Set(),
    distance: new Set(),
    time: new Set(),
    promo: new Set(),
    rating: new Set(),
  });
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (groupKey: string, val: string) => {
    setFilters((prev) => {
      const newFilters = {
        cat: new Set(prev.cat),
        price: new Set(prev.price),
        distance: new Set(prev.distance),
        time: new Set(prev.time),
        promo: new Set(prev.promo),
        rating: new Set(prev.rating),
      };
      const set = newFilters[groupKey as keyof ActiveFilters];
      if (set.has(val)) set.delete(val);
      else set.add(val);
      onChange(newFilters);
      return newFilters;
    });
  };

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const clearAll = () => {
    const empty: ActiveFilters = {
      cat: new Set(), price: new Set(), distance: new Set(),
      time: new Set(), promo: new Set(), rating: new Set(),
    };
    setFilters(empty);
    onChange(empty);
  };

  const hasActive = Object.values(filters).some((s) => s.size > 0);

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #e8e8ec",
        padding: "18px 16px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        alignSelf: "start",
        position: "sticky",
        top: 80,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>Filtros</span>
        {hasActive && (
          <button
            onClick={clearAll}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#E85D1B",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Limpiar
          </button>
        )}
      </div>

      {FILTER_GROUPS.map((group) => {
        const isCollapsed = collapsed[group.key];
        const activeSet = filters[group.key as keyof ActiveFilters];

        return (
          <div key={group.key} style={{ marginBottom: 16 }}>
            {/* Group header */}
            <button
              onClick={() => toggleCollapse(group.key)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "none",
                border: "none",
                padding: "0 0 8px",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", textAlign: "left" }}>
                {group.label}
              </span>
              {isCollapsed ? <ChevronDown size={14} color="#9A9AA4" /> : <ChevronUp size={14} color="#9A9AA4" />}
            </button>

            {/* Options */}
            {!isCollapsed && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {group.options.map(([val, label]) => {
                  const isOn = activeSet.has(val);
                  return (
                    <button
                      key={val}
                      onClick={() => toggle(group.key, val)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        border: isOn ? "1.5px solid #E85D1B" : "1.5px solid #e8e8ec",
                        background: isOn ? "#E85D1B" : "#f8f8fa",
                        color: isOn ? "#fff" : "#54545E",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Divider */}
            <div style={{ borderBottom: "1px solid #f0f0f4", marginTop: 12 }} />
          </div>
        );
      })}
    </aside>
  );
}
