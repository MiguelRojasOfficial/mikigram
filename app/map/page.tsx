'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase'; 
import { useAuth } from '@/context/AuthContext'; // Tu contexto de autenticación real

const MapContent = dynamic(() => import('@/components/MapContent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-64px)] bg-gray-900 flex items-center justify-center text-emerald-500">
      Cargando tus contactos de chat reales...
    </div>
  ),
});

export default function MapPage() {
  const { user } = useAuth();
  const [contactosChat, setContactosChat] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contactos: any[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const otroUsuario = data.participantDetails?.find(
          (p: any) => p.id !== user.uid
        );

        if (otroUsuario) {
          contactos.push({
            id: otroUsuario.id,
            nombre: otroUsuario.nombre || otroUsuario.displayName,
            fotoPerfil: otroUsuario.fotoPerfil || otroUsuario.photoURL,
            lat: otroUsuario.lat ?? -12.0463,
            lng: otroUsuario.lng ?? -77.0427,
          });
        }
      });

      setContactosChat(contactos);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return <MapContent contactos={contactosChat} />;
}