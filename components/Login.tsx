'use client'

import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, ShieldCheck, Zap } from 'lucide-react';

export default function Login() {
    const { loginWithGoogle } = useAuth();

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f2f5] dark:bg-[#111b20] p-4">
            <div className="bg-white dark:bg-[#280e35] p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center border border-gray-200 dark:border-gray-700">
                <div className="h-20 w-20 bg-blue-500 rounded-3xl flex items-center justify-center shadow-lg mb-6 rotate-3">
                    <MessageSquare className="h-10 w-10 -rotate-3" />
                </div>

                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    Mikigram
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm px-4">
                    La potencia de Mikigram para comunicarse con el mundo.
                </p>

                <div className="w-full space-y-3 mb-8">
                    <div className="flex items-center gap-3 mb-8">
                        <Zap size={20} className="text-yellow-400" />
                        <span className="text-xs font-medium dark:text-gray-200">Sincronización instantánea</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#2a3942] border border-gray-100 dark:border-gray-700">
                        <ShieldCheck size={20} className="text-green-500" />
                        <span className="text-xs font-medium dark:text-gray-200">Acceso seguro con Google</span>
                    </div>
                </div>

                <button
                    onClick={loginWithGoogle}
                    className="w-full flex items-center justify-center gap-3 bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2a3942] transition-all duration-200 shadow-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                    <img 
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                        alt="Google" 
                        className="w-5 h-5"
                    />
                    Continuar con Google
                </button>

                <footer className="mt-8 text-xs text-gray-400 text-center">
                    Al continuar, aceptas los términos de servicio de Mikigram.
                </footer>
            </div>
        </div>
    );
}