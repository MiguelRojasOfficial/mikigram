'use client'

import { useRouter } from 'next/navigation';
import { ArrowLeft, Laptop, QrCode, Smartphone, ShieldCheck, ChevronRight } from 'lucide-react';

export default function DevicesSettingsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#111b20] text-gray-800 dark:text-gray-100 p-4 max-w-md mx-auto">
            {/* Cabecera con botón de retroceso */}
            <div className="flex items-center gap-3 mb-6">
                <button 
                    onClick={() => router.back()} 
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                    aria-label="Volver"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold">Dispositivos vinculados</h1>
            </div>

            {/* Tarjeta Informativa / Banner Principal */}
            <div className="bg-white dark:bg-[#1f2c34] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 text-green-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <Laptop size={32} />
                </div>
                
                <h2 className="font-bold text-lg mb-1">Usa Mikigram en tu computadora</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                    Abre la página web de Mikigram en tu PC y escanea el código QR para iniciar sesión al instante sin contraseñas.
                </p>

                {/* BOTÓN PARA ABRIR LA CÁMARA */}
                <button
                    onClick={() => router.push('/scan-qr')}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg active:scale-95 transition-all duration-200"
                >
                    <QrCode size={20} />
                    Vincular un dispositivo
                </button>
            </div>

            {/* Pasos rápidos */}
            <div className="bg-white dark:bg-[#1f2c34] rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm mb-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Instrucciones de uso
                </h3>

                <ol className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
                    <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-5 h-5 bg-gray-100 dark:bg-gray-700 font-bold rounded-full flex-shrink-0 text-gray-800 dark:text-gray-200">1</span>
                        <span>Ingresa a la versión Web en tu computadora.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-5 h-5 bg-gray-100 dark:bg-gray-700 font-bold rounded-full flex-shrink-0 text-gray-800 dark:text-gray-200">2</span>
                        <span>Presiona el botón de arriba <b>"Vincular un dispositivo"</b> para abrir tu cámara.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-5 h-5 bg-gray-100 dark:bg-gray-700 font-bold rounded-full flex-shrink-0 text-gray-800 dark:text-gray-200">3</span>
                        <span>Apunta con la cámara al código QR en la pantalla de la computadora.</span>
                    </li>
                </ol>
            </div>

            {/* Estado del Dispositivo Actual */}
            <div className="bg-white dark:bg-[#1f2c34] rounded-2xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
                    Dispositivo actual
                </h3>
                
                <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-green-500">
                            <Smartphone size={22} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Este teléfono</p>
                            <p className="text-xs text-gray-400">Sesión principal activa</p>
                        </div>
                    </div>
                    <span className="text-xs bg-green-500/10 text-green-500 px-3 py-1 rounded-full font-medium">
                        En línea
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-8 text-xs text-gray-400">
                <ShieldCheck size={16} className="text-green-500" />
                <span>Tus mensajes y sesiones están cifrados de extremo a extremo</span>
            </div>
        </div>
    );
}