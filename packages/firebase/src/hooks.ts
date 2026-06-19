"use client";

import { useEffect, useState } from 'react';
import { doc, onSnapshot, collection, query, where, updateDoc } from 'firebase/firestore';
import { db } from './client';
import { Order, OrderStatus } from '@envios-ya/shared';

export function useRealTimeOrder(orderId: string | undefined) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'orders', orderId);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setOrder({ orderId: docSnap.id, ...docSnap.data() } as Order);
        } else {
          setOrder(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching order in real time:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  return { order, loading, error };
}

export function useActiveOrders(role: 'driver' | 'client' | 'dispatcher', uid: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    let q = query(collection(db, 'orders'));

    if (role === 'driver') {
      q = query(
        collection(db, 'orders'),
        where('driverId', '==', uid),
        where('status', 'in', ['assigned', 'picking_up', 'arrived_origin', 'in_transit', 'arrived_destination'])
      );
    } else if (role === 'client') {
      q = query(
        collection(db, 'orders'),
        where('clientId', '==', uid),
        where('status', 'not-in', ['delivered', 'cancelled'])
      );
    } else if (role === 'dispatcher') {
      q = query(
        collection(db, 'orders'),
        where('status', 'in', ['pending', 'assigned', 'picking_up', 'in_transit'])
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const orderList: Order[] = [];
        querySnapshot.forEach((docSnap) => {
          orderList.push({ orderId: docSnap.id, ...docSnap.data() } as Order);
        });
        setOrders(orderList);
        setLoading(false);
      },
      (err) => {
        console.error("Error query active orders:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [role, uid]);

  return { orders, loading };
}

export async function updateDriverGPS(driverId: string, latitude: number, longitude: number) {
  const driverDocRef = doc(db, 'drivers', driverId);
  await updateDoc(driverDocRef, {
    'currentLocation.latitude': latitude,
    'currentLocation.longitude': longitude,
    'currentLocation.updatedAt': new Date(),
  });
}
