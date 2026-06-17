"use client";

import { motion } from "framer-motion";
import { Star, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export interface BusinessData {
  id: string;
  name: string;
  category: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  image: string;
  tags: string[];
}

export function BusinessCard({ business }: { business: BusinessData }) {
  return (
    <Link href={`/business/${business.id}`}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="h-full"
      >
        <Card className="h-full overflow-hidden border-border bg-card hover:shadow-[var(--shadow-soft-glow)] transition-shadow duration-300 cursor-pointer">
          <div className="relative h-48 w-full bg-muted overflow-hidden">
            {/* Placeholder para la imagen real, usando color sólido para la demo si no hay src real */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${business.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop'})` }}
            />
            {/* Gradiente en la parte inferior de la imagen para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
              {business.category}
            </Badge>
          </div>
          
          <CardContent className="pt-4 pb-2">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-xl line-clamp-1">{business.name}</h3>
              <div className="flex items-center bg-secondary/20 px-2 py-1 rounded-md">
                <Star className="w-4 h-4 text-primary fill-primary mr-1" />
                <span className="text-sm font-semibold">{business.rating}</span>
              </div>
            </div>
            
            <div className="flex items-center text-muted-foreground text-sm space-x-4 mt-3">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 shrink-0" />
                <span>{business.deliveryTime}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1 shrink-0" />
                <span>Envío: ${business.deliveryFee.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="pt-2">
            <div className="flex flex-wrap gap-2">
              {business.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  );
}
