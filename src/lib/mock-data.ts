export interface Category { key: string; name: string; count: number; }
export interface FilterOption { key: string; label: string; options: [string, string][]; }
export interface Store { id: number; name: string; cat: string; sub: string; price: number; distance: number; eta: number; rating: number; promo: string[]; badge: string; badgeText: string; img: string; }
export interface MenuItem { id: string; name: string; desc: string; price: number; img: string; }
export interface Business { id: number; name: string; category: string; rating: number; img: string; image: string; deliveryTime: string; deliveryFee: number; tags: string[]; }

export const CATEGORIES: Category[] = [
  { key: 'restaurantes', name: 'Restaurantes', count: 412 },
  { key: 'cafeterias', name: 'Cafeterías', count: 96 },
  { key: 'supermercados', name: 'Supermercados', count: 58 },
  { key: 'farmacias', name: 'Farmacias', count: 74 },
  { key: 'panaderias', name: 'Panaderías', count: 63 },
  { key: 'conveniencia', name: 'Tiendas de conveniencia', count: 120 },
  { key: 'carnicerias', name: 'Carnicerías', count: 31 },
  { key: 'fruterias', name: 'Fruterías', count: 44 },
  { key: 'mascotas', name: 'Mascotas', count: 27 },
  { key: 'tecnologia', name: 'Tecnología', count: 19 },
  { key: 'licores', name: 'Licores', count: 38 },
  { key: 'postres', name: 'Postres', count: 52 },
];

export const FILTER_GROUPS: FilterOption[] = [
  { key: 'cat', label: 'Categoría', options: [
    ['comida_rapida', 'Comida rápida'],
    ['comida_italiana', 'Comida italiana'],
    ['comida_asiatica', 'Comida asiática'],
    ['comida_saludable', 'Comida saludable'],
    ['cafeterias', 'Cafeterías'],
    ['supermercados', 'Supermercados']
  ]},
  { key: 'price', label: 'Precio', options: [
    ['1', '$'], ['2', '$$'], ['3', '$$$'], ['4', '$$$$']
  ]},
  { key: 'distance', label: 'Distancia', options: [
    ['1', '< 1 km'], ['3', '< 3 km'], ['5', '< 5 km']
  ]},
  { key: 'time', label: 'Entrega', options: [
    ['15', '< 15 min'], ['30', '< 30 min'], ['45', '< 45 min']
  ]},
  { key: 'promo', label: 'Promos', options: [
    ['oferta', 'En oferta'], ['envio_gratis', 'Envío gratis'], ['descuento', 'Descuento especial']
  ]},
  { key: 'rating', label: 'Calificación', options: [
    ['4', '4★ +'], ['4.5', '4.5★ +'], ['5', '5★']
  ]},
];

export const STORES: Store[] = [
  { id:1, name:'La Brasa Dorada', cat:'Restaurantes', sub:'comida_rapida', price:2, distance:1.4, eta:18, rating:4.7, promo:[], badge:'b-bestseller', badgeText:'Más vendido', img:'https://picsum.photos/seed/brasa9/480/320' },
  { id:2, name:'Sushi Nami', cat:'Restaurantes · Asiática', sub:'comida_asiatica', price:3, distance:3.8, eta:25, rating:4.8, promo:['envio_gratis'], badge:'b-free', badgeText:'Envío gratis', img:'https://picsum.photos/seed/sushi9/480/320' },
  { id:3, name:'Café Andino', cat:'Cafetería', sub:'cafeterias', price:1, distance:0.6, eta:12, rating:4.6, promo:[], badge:'b-new', badgeText:'Nuevo', img:'https://picsum.photos/seed/cafe9/480/320' },
  { id:4, name:'Súper Central', cat:'Supermercado', sub:'supermercados', price:2, distance:2.9, eta:35, rating:4.5, promo:['envio_gratis'], badge:'b-free', badgeText:'Envío gratis', img:'https://picsum.photos/seed/super9/480/320' },
  { id:5, name:'Farmacia VidaPlus', cat:'Farmacia', sub:'', price:1, distance:0.9, eta:20, rating:4.9, promo:['descuento'], badge:'b-deal', badgeText:'Oferta especial', img:'https://picsum.photos/seed/farma9/480/320' },
  { id:6, name:'Panadería San José', cat:'Panadería', sub:'', price:1, distance:1.1, eta:15, rating:4.7, promo:['oferta'], badge:'b-deal', badgeText:'Oferta especial', img:'https://picsum.photos/seed/pan9/480/320' },
  { id:7, name:'Verde Fresco', cat:'Frutería', sub:'', price:2, distance:4.2, eta:22, rating:4.6, promo:[], badge:'', badgeText:'', img:'https://picsum.photos/seed/fruta9/480/320' },
  { id:8, name:'Trattoria Bella', cat:'Restaurantes · Italiana', sub:'comida_italiana', price:3, distance:3.1, eta:28, rating:4.8, promo:[], badge:'b-bestseller', badgeText:'Más vendido', img:'https://picsum.photos/seed/pasta9/480/320' }
];

export const MENU: Record<string, MenuItem[]> = {
  Entradas: [
    { id:'e1', name:'Tostones con guacamole', desc:'Plátano verde frito con guacamole casero.', price:28, img:'https://picsum.photos/seed/tostones/200/200' },
    { id:'e2', name:'Sopa del día', desc:'Receta casera, varía según temporada.', price:24, img:'https://picsum.photos/seed/sopa/200/200' }
  ],
  'Platos fuertes': [
    { id:'p1', name:'Pollo a la brasa', desc:'Medio pollo marinado, papas y ensalada.', price:62, img:'https://picsum.photos/seed/pollo/200/200' },
    { id:'p2', name:'Lomito en salsa de hongos', desc:'Con puré de papa y vegetales salteados.', price:78, img:'https://picsum.photos/seed/lomito/200/200' },
    { id:'p3', name:'Tacos de carne asada (3)', desc:'Tortilla de maíz, cebolla y cilantro.', price:45, img:'https://picsum.photos/seed/tacos/200/200' }
  ],
  Bebidas: [
    { id:'b1', name:'Limonada con menta', desc:'Refrescante, hecha al momento.', price:14, img:'https://picsum.photos/seed/limonada/200/200' },
    { id:'b2', name:'Horchata artesanal', desc:'Receta tradicional con canela.', price:16, img:'https://picsum.photos/seed/horchata/200/200' }
  ],
  Postres: [
    { id:'d1', name:'Tres leches', desc:'Porción individual, receta de la casa.', price:22, img:'https://picsum.photos/seed/tresleches/200/200' },
    { id:'d2', name:'Brownie con helado', desc:'Brownie tibio con bola de vainilla.', price:26, img:'https://picsum.photos/seed/brownie/200/200' }
  ]
};

export const MOCK_BUSINESSES: Business[] = [
  { id:1, name:'La Brasa Dorada', category:'Restaurantes', rating:4.7, img:'https://picsum.photos/seed/brasa9/200/200', image:'https://picsum.photos/seed/brasa9/480/320', deliveryTime:'15-25 min', deliveryFee:2.50, tags:['Pollo', 'Comida Rápida', 'Papas'] },
  { id:2, name:'Sushi Nami', category:'Restaurantes · Asiática', rating:4.8, img:'https://picsum.photos/seed/sushi9/200/200', image:'https://picsum.photos/seed/sushi9/480/320', deliveryTime:'20-30 min', deliveryFee:3.00, tags:['Sushi', 'Japonesa', 'Asiática'] },
  { id:3, name:'Café Andino', category:'Cafetería', rating:4.6, img:'https://picsum.photos/seed/cafe9/200/200', image:'https://picsum.photos/seed/cafe9/480/320', deliveryTime:'10-20 min', deliveryFee:1.50, tags:['Café', 'Bebidas', 'Postres'] },
  { id:4, name:'Súper Central', category:'Supermercado', rating:4.5, img:'https://picsum.photos/seed/super9/200/200', image:'https://picsum.photos/seed/super9/480/320', deliveryTime:'30-40 min', deliveryFee:4.00, tags:['Abarrotes', 'Supermercado', 'Bebidas'] },
  { id:5, name:'Farmacia VidaPlus', category:'Farmacia', rating:4.9, img:'https://picsum.photos/seed/farma9/200/200', image:'https://picsum.photos/seed/farma9/480/320', deliveryTime:'15-20 min', deliveryFee:2.00, tags:['Medicamentos', 'Farmacia', 'Cuidado Personal'] },
  { id:6, name:'Panadería San José', category:'Panadería', rating:4.7, img:'https://picsum.photos/seed/pan9/200/200', image:'https://picsum.photos/seed/pan9/480/320', deliveryTime:'10-15 min', deliveryFee:1.00, tags:['Pan', 'Postres', 'Cafetería'] },
  { id:7, name:'Verde Fresco', category:'Frutería', rating:4.6, img:'https://picsum.photos/seed/fruta9/200/200', image:'https://picsum.photos/seed/fruta9/480/320', deliveryTime:'20-25 min', deliveryFee:2.50, tags:['Frutas', 'Verduras', 'Saludable'] },
  { id:8, name:'Trattoria Bella', category:'Restaurantes · Italiana', rating:4.8, img:'https://picsum.photos/seed/pasta9/200/200', image:'https://picsum.photos/seed/pasta9/480/320', deliveryTime:'25-35 min', deliveryFee:3.50, tags:['Pasta', 'Pizza', 'Italiana'] }
];
