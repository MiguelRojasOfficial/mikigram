'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Loader2, Upload, Camera } from 'lucide-react';

export default function CreatePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Manejar selección de imagen
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // Subir la imagen e insertar el post en Firestore
  const handleUpload = async () => {
    if (!file || !user) {
      alert('Selecciona una imagen e inicia sesión para publicar.');
      return;
    }

    setUploading(true);

    try {
      let downloadURL = '';

      // Opción A: Subida a Firebase Storage (Recomendada)
      try {
        const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        downloadURL = await getDownloadURL(snapshot.ref);
      } catch (storageError) {
        console.warn('Firebase Storage no disponible o con permisos restringidos. Usando respaldo Base64...', storageError);

        // Opción B: Respaldo rápido con Base64 (si Storage no está configurado)
        downloadURL = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      }

      // Guardar el registro en la colección 'posts'
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        userName: user.displayName || `Usuario_${user.uid.slice(0, 5)}`,
        userPhoto: user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`,
        mediaUrl: downloadURL,
        createdAt: serverTimestamp(),
      });

      // Redirigir al Feed tras publicar exitosamente
      router.push('/feed');
    } catch (error) {
      console.error('Error al subir el estado:', error);
      alert('Hubo un problema al publicar. Revisa la consola del navegador para más detalles.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-xl">
        <h2 className="text-lg font-bold">Crear nuevo estado</h2>

        {/* Vista previa de la imagen */}
        <div className="w-full aspect-[3/4] bg-gray-950 rounded-xl border border-dashed border-gray-700 flex flex-col items-center justify-center overflow-hidden relative">
          {preview ? (
            <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
          ) : (
            <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-gray-300">
              <Camera size={40} />
              <span className="text-xs">Toca para seleccionar una foto</span>
            </label>
          )}
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Botón de subida */}
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95"
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Publicando...</span>
            </>
          ) : (
            <>
              <Upload size={20} />
              <span>Subir a Mikigram</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}