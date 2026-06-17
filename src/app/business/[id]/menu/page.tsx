"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_BUSINESSES } from "@/lib/mock-data";
import { useCartStore } from "@/lib/store/cart-store";
import Link from "next/link";

// Mock products
const PRODUCTS = [
  { id: "p1", name: "Producto Especial 1", price: 12.99, description: "Deliciosa opción preparada con los mejores ingredientes.", category: "Principales" },
  { id: "p2", name: "Producto Clásico 2", price: 9.50, description: "Nuestra receta tradicional que todos aman.", category: "Principales" },
  { id: "p3", name: "Acompañamiento Extra", price: 4.99, description: "Perfecto para acompañar tu orden.", category: "Extras" },
  { id: "p4", name: "Bebida Refrescante", price: 2.50, description: "Bebida fría de 500ml.", category: "Bebidas" },
];

export default function MenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const business = MOCK_BUSINESSES.find(b => b.id === id);
  const { addItem, totalItems, totalPrice } = useCartStore();

  if (!business) {
    notFound();
  }

  const handleAddToCart = (product: typeof PRODUCTS[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      businessId: id
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Menú de {business.name}</h1>
        <p className="text-muted-foreground">Explora y agrega a tu carrito lo que más te guste.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
        {PRODUCTS.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="h-full flex flex-col justify-between hover:shadow-[var(--shadow-soft-glow)] transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <span className="font-semibold text-primary">${product.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                <div className="text-xs bg-secondary/20 w-fit px-2 py-1 rounded text-secondary-foreground mb-4">
                  {product.category}
                </div>
                <Button 
                  onClick={() => handleAddToCart(product)}
                  className="w-full flex items-center justify-center font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" /> Agregar
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Floating Cart Summary */}
      {totalItems() > 0 && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
        >
          <div className="bg-primary text-primary-foreground rounded-2xl p-4 shadow-[var(--shadow-deep-shadow)] flex items-center justify-between w-full max-w-2xl pointer-events-auto">
            <div className="flex items-center">
              <div className="bg-primary-foreground/20 rounded-full w-10 h-10 flex items-center justify-center mr-3 font-bold">
                {totalItems()}
              </div>
              <div>
                <p className="text-sm opacity-90">Total de tu orden</p>
                <p className="font-bold text-lg">${totalPrice().toFixed(2)}</p>
              </div>
            </div>
            <Button asChild variant="secondary" className="font-bold rounded-xl px-6">
              <Link href="/checkout/step1">
                <ShoppingCart className="w-4 h-4 mr-2" /> Ir a Pagar
              </Link>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
