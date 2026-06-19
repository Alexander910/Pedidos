import { db } from '@envios-ya/firebase/src/client';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { STORES, MOCK_BUSINESSES, MENU } from './mock-data';

export interface Business {
  id: number;
  name: string;
  category: string;
  sub: string;
  price: number;
  distance: number;
  eta: number;
  rating: number;
  promo: string[];
  badge: string;
  badgeText: string;
  img: string;
  image: string;
  deliveryTime: string;
  deliveryFee: number;
  tags: string[];
}

export interface MenuItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  img: string;
  category: string;
}

// Get all businesses from Firestore (falls back to mock data if empty or on error)
export async function getBusinesses(): Promise<Business[]> {
  try {
    const colRef = collection(db, 'businesses');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      await seedDatabaseIfEmpty();
      // Return combined mock data
      return getCombinedMockBusinesses();
    }
    return snapshot.docs.map(doc => ({ id: Number(doc.id), ...doc.data() } as Business));
  } catch (error) {
    console.error('Error fetching businesses from Firestore, falling back to mock data:', error);
    return getCombinedMockBusinesses();
  }
}

// Get a single business by ID
export async function getBusinessById(id: string): Promise<Business | null> {
  try {
    const businesses = await getBusinesses();
    return businesses.find(b => b.id === Number(id)) || null;
  } catch (error) {
    console.error(`Error fetching business ${id}:`, error);
    const mock = getCombinedMockBusinesses().find(b => b.id === Number(id));
    return mock || null;
  }
}

// Get menu items for a specific business (falls back to mock menu if empty or on error)
export async function getMenuItems(businessId: string): Promise<MenuItem[]> {
  try {
    const colRef = collection(db, 'businesses', businessId, 'menu');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      return getMockMenu(businessId);
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
  } catch (error) {
    console.error(`Error fetching menu for business ${businessId}, falling back to mock:`, error);
    return getMockMenu(businessId);
  }
}

function getCombinedMockBusinesses(): Business[] {
  return MOCK_BUSINESSES.map(b => {
    const s = STORES.find(store => store.id === b.id) || {
      sub: '',
      price: 1,
      distance: 1.0,
      eta: 15,
      promo: [],
      badge: '',
      badgeText: ''
    };
    return {
      ...b,
      sub: s.sub,
      price: s.price,
      distance: s.distance,
      eta: s.eta,
      promo: s.promo,
      badge: s.badge,
      badgeText: s.badgeText
    } as Business;
  });
}

function getMockMenu(businessId: string): MenuItem[] {
  // Try to load custom menu if business exists, otherwise flat mock menu
  return Object.entries(MENU).flatMap(([category, items]) => 
    items.map(item => ({ ...item, category }))
  );
}

// Seed function to auto-populate Firestore with mock data if it's currently empty
export async function seedDatabaseIfEmpty() {
  try {
    const colRef = collection(db, 'businesses');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log('Firestore is empty. Seeding businesses and menus...');
      const combined = getCombinedMockBusinesses();
      for (const biz of combined) {
        const bizDocRef = doc(db, 'businesses', String(biz.id));
        await setDoc(bizDocRef, {
          name: biz.name,
          category: biz.category,
          sub: biz.sub,
          price: biz.price,
          distance: biz.distance,
          eta: biz.eta,
          rating: biz.rating,
          promo: biz.promo,
          badge: biz.badge,
          badgeText: biz.badgeText,
          img: biz.img,
          image: biz.image,
          deliveryTime: biz.deliveryTime,
          deliveryFee: biz.deliveryFee,
          tags: biz.tags
        });

        // Seed menu items as subcollection 'menu'
        const menuColRef = collection(bizDocRef, 'menu');
        for (const [category, items] of Object.entries(MENU)) {
          for (const item of items) {
            const itemDocRef = doc(menuColRef, item.id);
            await setDoc(itemDocRef, {
              name: item.name,
              desc: item.desc,
              price: item.price,
              img: item.img,
              category: category
            });
          }
        }
      }
      console.log('Database seeded successfully!');
    }
  } catch (error) {
    console.warn('Error seeding database (check Firebase credentials):', error);
  }
}
