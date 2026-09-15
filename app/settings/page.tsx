'use client'

import { useRouter } from 'next/navigation';
import { ArrowLeft, Laptop, Lock, Bell, User, ChevronRight } from 'lucide-react';

export default function SettingsMainPage() {
    const router = useRouter();

    const options = [
        {
            title: 'Dispositivos vinculados',
            subtitle: 'Escanea el código QR de la web en tu PC',
            icon: Laptop,
            path: '/settings/devices'
        },
        {
            title: 'Editar perfil',
            subtitle: 'Nombre, foto de perfil, biografía',
            icon: User,
            path: '/profile/edit'
        },
        {
            title: 'Privacidad y seguridad',
            subtitle: 'Contraseña, bloqueos y verificación',
            icon: Lock,
            path: '/settings/privacy'
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#111b20] text-gray-800 dark:text-gray-100 p-4 max-w-md mx-auto">
            {/* Cabecera */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold">Ajustes</h1>
            </div>

            {/* Opciones */}
            <div className="space-y-2">
                {options.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => router.push(item.path)}
                        className="w-full flex items-center justify-between p-4 bg-white dark:bg-[#1f2c34] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-[#2a3942] transition"
                    >
                        <div className="flex items-center gap-3">
                            <item.icon size={22} className="text-green-500" />
                            <div className="text-left">
                                <p className="text-sm font-semibold">{item.title}</p>
                                <p className="text-xs text-gray-400">{item.subtitle}</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-400" />
                    </button>
                ))}
            </div>
        </div>
    );
}