import { BusinessData } from "@/components/consumer/BusinessCard";

export const MOCK_BUSINESSES: BusinessData[] = [
  {
    id: "1",
    name: "Burger Joint",
    category: "Restaurantes",
    rating: 4.8,
    deliveryTime: "20-30 min",
    deliveryFee: 2.99,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
    tags: ["Hamburguesas", "Comida Rápida", "Americana"]
  },
  {
    id: "2",
    name: "Sushi Master",
    category: "Restaurantes",
    rating: 4.9,
    deliveryTime: "35-45 min",
    deliveryFee: 4.50,
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop",
    tags: ["Japonesa", "Sushi", "Premium"]
  },
  {
    id: "3",
    name: "Supermercado Express",
    category: "Supermercados",
    rating: 4.6,
    deliveryTime: "15-25 min",
    deliveryFee: 1.50,
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop",
    tags: ["Abarrotes", "Bebidas", "Snacks"]
  },
  {
    id: "4",
    name: "Farmacia Salud",
    category: "Farmacias",
    rating: 4.5,
    deliveryTime: "10-20 min",
    deliveryFee: 0.00,
    image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=800&auto=format&fit=crop",
    tags: ["Medicamentos", "Cuidado Personal"]
  }
];
