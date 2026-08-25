'use client'

import { MapPin } from 'lucide-react';

export default function MapPage() {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-[#111b20]">
            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-500 mb-4">
                <MapPin size={32} />
            </div>
            <h2 className="text-xl font-bold dark:text-white mb-2">Mapa de Amigos y Eventos</h2>
            <p className="text-gray-500 text-sm max-w-sm">
                Aquí podrás ver la ubicación en tiempo real de tus contactos y confirmar asistencia a eventos locales.
            </p>
        </div>
    );
}