'use client';

import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Loader2, X, RefreshCw } from 'lucide-react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function CreatePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [modoCamara, setModoCamara] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const abrirCamaraEnVivo = async () => {
    try {
      setModoCamara(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('No se pudo acceder a la cámara:', error);
      alert('No se pudo acceder a la cámara. Asegúrate de otorgar los permisos en tu navegador.');
      cerrarCamara();
    }
  };

  const capturarFoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const fotoDataUrl = canvas.toDataURL('image/jpeg');
      setPreview(fotoDataUrl);
    }

    cerrarCamara();
  };

  const cerrarCamara = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setModoCamara(false);
  };

  const manejarGaleria = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      {/* Input de Galería Oculto */}
      <input
        type="file"
        accept="image/*"
        ref={galleryInputRef}
        onChange={manejarGaleria}
        className="hidden"
      />

      {modoCamara ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <div className="relative w-full h-80 bg-black rounded-2xl overflow-hidden shadow-xl border-2 border-emerald-500">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <button
              onClick={cerrarCamara}
              className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black/80"
            >
              <X size={20} />
            </button>
          </div>

          <button
            onClick={capturarFoto}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
          >
            <Camera size={20} />
            <span>Capturar Foto</span>
          </button>
        </div>
      ) : preview ? (
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
            onClick={abrirCamaraEnVivo}
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