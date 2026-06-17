"use client";

import { motion } from "framer-motion";
import { SearchFilterBar } from "./SearchFilterBar";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-background pt-24 pb-32">
      {/* Fondo degradado animado */}
      <motion.div
        className="absolute inset-0 z-0 opacity-30"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          duration: 20,
        }}
        style={{
          background: "linear-gradient(45deg, var(--primary), var(--secondary), transparent)",
          backgroundSize: "200% 200%",
        }}
      />
      
      <div className="container relative z-10 mx-auto px-4 md:px-6 flex flex-col items-center text-center">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Lo que quieras, <br className="hidden md:block" />
          <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            donde estés.
          </span>
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          Descubre los mejores restaurantes, supermercados y farmacias con entregas rápidas a tu puerta.
        </motion.p>
        
        <motion.div 
          className="w-full max-w-3xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        >
          <SearchFilterBar />
        </motion.div>
      </div>
    </section>
  );
}
