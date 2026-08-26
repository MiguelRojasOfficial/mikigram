'use client'

import { Camera, Image as ImageIcon } from 'lucide-react';

export default function CreatePage() {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-[#111b20]">
            <h2 className="text-xl font-bold dark:text-white mb-6">Crear Nuevo Estado</h2>
            
            <div className="flex gap-4">
                <button className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-green-600 text-white font-semibold shadow-lg hover:bg-green-700 transition active:scale-95">
                    <Camera size={28} />
                    <span className="text-sm">Tomar Foto / Video</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition active:scale-95">
                    <ImageIcon size={28} />
                    <span className="text-sm">Subir Galería</span>
                </button>
            </div>
        </div>
    );
}