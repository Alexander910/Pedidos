"use client";

import { useCartStore } from "@/lib/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutStep1() {
  const { items, totalPrice, totalItems, clearCart } = useCartStore();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center flex-1">
        <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mb-8">Agrega algunos productos antes de proceder al pago.</p>
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    );
  }

  const handlePaymentSimulation = () => {
    // Simular un procesamiento de pago exitoso y crear orden
    const orderId = `ORD-${Math.floor(Math.random() * 100000)}`;
    clearCart();
    router.push(`/order/${orderId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Completar Orden</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Formulario de entrega y pago */}
        <div className="space-y-8">
          <section className="bg-card p-6 rounded-xl border border-border shadow-[var(--shadow-deep-shadow)]">
            <h2 className="text-xl font-bold flex items-center mb-4">
              <MapPin className="w-5 h-5 mr-2 text-primary" /> Detalles de Entrega
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Dirección completa</label>
                <Input placeholder="Ej. Calle Principal 123, Depto 4B" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Instrucciones para el repartidor (Opcional)</label>
                <Input placeholder="Ej. Tocar timbre, dejar en portería..." />
              </div>
            </div>
          </section>

          <section className="bg-card p-6 rounded-xl border border-border shadow-[var(--shadow-deep-shadow)]">
            <h2 className="text-xl font-bold flex items-center mb-4">
              <CreditCard className="w-5 h-5 mr-2 text-primary" /> Método de Pago
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Aquí se integraría el elemento de Stripe (`Elements`) de forma segura.
            </p>
            <div className="h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground bg-muted/50">
              [Stripe Card Element Simulation]
            </div>
          </section>
        </div>

        {/* Resumen de Orden */}
        <div>
          <div className="bg-card p-6 rounded-xl border border-border sticky top-24 shadow-[var(--shadow-soft-glow)]">
            <h2 className="text-xl font-bold mb-6">Resumen de tu Orden</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-center">
                    <span className="font-semibold w-6 text-primary">{item.quantity}x</span>
                    <span className="truncate max-w-[150px]">{item.name}</span>
                  </div>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 mb-8 space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({totalItems()} items)</span>
                <span>${totalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Costo de envío (Aprox)</span>
                <span>$2.99</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border mt-2">
                <span>Total a Pagar</span>
                <span className="text-primary">${(totalPrice() + 2.99).toFixed(2)}</span>
              </div>
            </div>

            <Button 
              className="w-full text-lg h-14 rounded-xl shadow-lg" 
              onClick={handlePaymentSimulation}
            >
              Confirmar y Pagar <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
