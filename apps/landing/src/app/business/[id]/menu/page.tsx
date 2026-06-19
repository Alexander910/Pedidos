"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBusinessById, getMenuItems, Business, MenuItem } from "@/lib/database";
import { useCartStore } from "@/lib/store/cart-store";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import Link from "next/link";

export default function MenuPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [business, setBusiness] = useState<Business | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, totalItems, totalPrice } = useCartStore();

  useEffect(() => {
    Promise.all([
      getBusinessById(id),
      getMenuItems(id)
    ]).then(([biz, items]) => {
      setBusiness(biz);
      setMenuItems(items);
      setLoading(false);
    }).catch(err => {
      console.error("Error loading menu:", err);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground font-semibold">
        Cargando menú de la tienda...
      </div>
    );
  }

  if (!business) {
    notFound();
  }

  const handleAddToCart = (product: MenuItem) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      businessId: id
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 relative max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Menú de {business.name}</h1>
        <p className="text-muted-foreground">Explora y agrega a tu carrito lo que más te guste de forma express.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
        {menuItems.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.05, 0.5) }}
          >
            <Card className="h-full flex flex-col justify-between hover:shadow-lg transition-shadow border border-border">
              {product.img && (
                <div className="h-40 w-full overflow-hidden relative bg-muted">
                  <img 
                    src={getCloudinaryUrl(product.img)} 
                    alt={product.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
              <CardContent className="pt-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-bold text-base line-clamp-1">{product.name}</h3>
                    <span className="font-bold text-orange-600 shrink-0">Q{product.price.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{product.desc}</p>
                </div>
                <div>
                  <div className="text-[10px] bg-orange-500/10 text-orange-600 w-fit px-2.5 py-0.5 rounded font-bold mb-4 uppercase tracking-wider">
                    {product.category || "Principal"}
                  </div>
                  <Button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full flex items-center justify-center font-bold bg-orange-600 hover:bg-orange-500 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Agregar
                  </Button>
                </div>
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
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl flex items-center justify-between w-full max-w-2xl pointer-events-auto border border-slate-800">
            <div className="flex items-center">
              <div className="bg-orange-500 rounded-full w-10 h-10 flex items-center justify-center mr-3 font-extrabold text-white">
                {totalItems()}
              </div>
              <div>
                <p className="text-xs text-slate-400">Total de tu orden</p>
                <p className="font-bold text-lg text-orange-500">Q{totalPrice().toFixed(2)}</p>
              </div>
            </div>
            <Link href="/checkout/step1">
              <Button className="font-bold rounded-xl px-6 bg-orange-600 hover:bg-orange-500 text-white">
                <ShoppingCart className="w-4 h-4 mr-2" /> Ir a Pagar
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
