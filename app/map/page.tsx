'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

const MapContent = dynamic(() => import('@/components/MapContent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-64px)] bg-gray-900 flex items-center justify-center text-emerald-500 font-medium">
      Cargando contactos de Mikigram...
    </div>
  ),
});

export interface ContactoReal {
  id: string;
  nombre: string;
  fotoPerfil: string;
  lat: number;
  lng: number;
}

export default function MapPage() {
  const { user, loading } = useAuth();
  const [contactosReales, setContactosReales] = useState<ContactoReal[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usuarios: ContactoReal[] = [];

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();

        if (data.uid !== user.uid) {
          usuarios.push({
            id: data.uid,
            nombre: data.displayName || 'Usuario de Mikigram',
            fotoPerfil: data.photoURL,
            lat: data.lat ?? -12.0463,
            lng: data.lng ?? -77.0427,
          });
        }
      });

      setContactosReales(usuarios);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-64px)] bg-gray-900 flex items-center justify-center text-white">
        Autenticando usuario...
      </div>
    );
  }

  return <MapContent contactos={contactosReales} />;
}