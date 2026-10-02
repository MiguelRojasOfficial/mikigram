'use client';

import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function CreatePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [subiendo, setSubiendo] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Convertir imagen a Base64 para guardarla directamente en Firestore
  const manejarSeleccionImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const publicarEstado = async () => {
    if (!preview || !user?.uid) return;

    setSubiendo(true);
    try {
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        userName: user.displayName || 'Usuario Mikigram',
        userPhoto: user.photoURL || '/default-avatar.png',
        mediaUrl: preview,
        createdAt: serverTimestamp(),
      });

      router.push('/');
    } catch (error) {
      console.error('Error al subir el estado:', error);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-[#111b20]">
      <h2 className="text-xl font-bold dark:text-white mb-6">Crear Nuevo Estado</h2>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={manejarSeleccionImagen}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        ref={galleryInputRef}
        onChange={manejarSeleccionImagen}
        className="hidden"
      />

      {preview ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <div className="w-full h-64 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md relative">
            <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => setPreview(null)}
              disabled={subiendo}
              className="flex-1 py-3 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={publicarEstado}
              disabled={subiendo}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              {subiendo ? <Loader2 className="animate-spin" size={20} /> : 'Publicar'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-4">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-emerald-600 text-white font-semibold shadow-lg hover:bg-emerald-700 transition active:scale-95"
          >
            <Camera size={28} />
            <span className="text-sm">Tomar Foto / Video</span>
          </button>

          <button
            onClick={() => galleryInputRef.current?.click()}
            className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition active:scale-95"
          >
            <ImageIcon size={28} />
            <span className="text-sm">Subir Galería</span>
          </button>
        </div>
      )}
    </div>
  );
}