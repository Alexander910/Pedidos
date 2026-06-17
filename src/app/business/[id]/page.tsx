import { MOCK_BUSINESSES } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock, Info } from "lucide-react";

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = MOCK_BUSINESSES.find(b => b.id === Number(id));
  
  if (!business) {
    notFound();
  }

  return (
    <div>
      {/* Banner del Negocio */}
      <div 
        className="h-64 md:h-80 w-full bg-cover bg-center relative"
        style={{ backgroundImage: `url(${business.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 container mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">{business.name}</h1>
          <p className="text-xl text-muted-foreground">{business.category}</p>
        </div>
      </div>
      
      {/* Información principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center bg-secondary/10 px-3 py-2 rounded-lg">
                <Star className="w-5 h-5 text-primary fill-primary mr-2" />
                <span className="font-bold text-lg">{business.rating}</span>
                <span className="text-muted-foreground ml-1">(+100 reseñas)</span>
              </div>
              <div className="flex items-center bg-muted px-3 py-2 rounded-lg">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-medium">{business.deliveryTime}</span>
              </div>
              <div className="flex items-center bg-muted px-3 py-2 rounded-lg">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="font-medium">Envío: ${business.deliveryFee.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Acerca de nosotros</h2>
              <p className="text-muted-foreground leading-relaxed">
                Bienvenido a {business.name}, ofrecemos los mejores productos en la categoría de {business.category.toLowerCase()}. 
                Nuestro compromiso es entregarte calidad y rapidez en cada orden. ¡Revisa nuestro menú y pide ahora!
              </p>
            </div>
            
            <div className="flex gap-4">
              <Link href={`/business/${id}/menu`}>
                <Button size="lg" className="w-full md:w-auto px-8 text-lg font-semibold">
                  Ver Menú Completo
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6 h-fit shadow-[var(--shadow-deep-shadow)]">
            <h3 className="font-bold text-lg flex items-center mb-4">
              <Info className="w-5 h-5 mr-2 text-primary" />
              Información de Tienda
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Horario</span>
                <span className="font-medium">09:00 - 22:00</span>
              </li>
              <li className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Dirección</span>
                <span className="font-medium text-right max-w-[150px]">Av. Principal 123, Ciudad</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
