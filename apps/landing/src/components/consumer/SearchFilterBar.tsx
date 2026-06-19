"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchFilterBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Redirigir a la página de búsqueda con los parámetros
    router.push(`/search?q=${encodeURIComponent(query)}&loc=${encodeURIComponent(location)}`);
  };

  return (
    <form 
      onSubmit={handleSearch}
      className="flex flex-col md:flex-row bg-background rounded-xl p-2 shadow-[var(--shadow-deep-shadow)] border border-border w-full transition-all duration-300 hover:shadow-[var(--shadow-soft-glow)]"
    >
      <div className="flex-1 flex items-center px-4 py-2 md:border-r border-border mb-2 md:mb-0">
        <MapPin className="text-primary w-5 h-5 mr-3 shrink-0" />
        <Input 
          type="text" 
          placeholder="Ingresa tu dirección..." 
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto text-base shadow-none"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      
      <div className="flex-2 flex items-center px-4 py-2 mb-2 md:mb-0">
        <Search className="text-primary w-5 h-5 mr-3 shrink-0" />
        <Input 
          type="text" 
          placeholder="¿Qué se te antoja hoy? (ej. Pizza, Sushi)" 
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto text-base shadow-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      
      <Button 
        type="submit" 
        size="lg" 
        className="rounded-lg font-semibold text-primary-foreground md:px-8 py-6 h-auto w-full md:w-auto"
      >
        Buscar
      </Button>
    </form>
  );
}
