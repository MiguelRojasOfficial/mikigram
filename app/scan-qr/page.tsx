'use client'

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function WebQRScannerPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Inicializar el escáner HTML5 en el navegador móvil
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render(
            async (scannedSessionId) => {
                // Al detectar el QR, detener la cámara temporalmente
                scanner.clear();
                setStatus('loading');

                const currentUser = auth.currentUser;

                if (!currentUser) {
                    setStatus('error');
                    setErrorMessage('Debes iniciar sesión en este navegador móvil primero.');
                    return;
                }

                try {
                    // Actualizar Firestore con la sesión leída del QR
                    const sessionRef = doc(db, 'qr_sessions', scannedSessionId);
                    await updateDoc(sessionRef, {
                        status: 'completed',
                        uid: currentUser.uid,
                        authorizedAt: new Date().toISOString()
                    });

                    setStatus('success');
                    setTimeout(() => {
                        router.push('/profile');
                    }, 2000);

                } catch (err) {
                    console.error("Error al autorizar QR:", err);
                    setStatus('error');
                    setErrorMessage('El código QR expiró o es inválido.');
                }
            },
            (error) => {
                // Errores de lectura continua (se pueden ignorar)
            }
        );

        return () => {
            scanner.clear().catch(() => {});
        };
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
            <h1 className="text-xl font-bold mb-4">Vincular dispositivo web</h1>

            {status === 'idle' && (
                <div className="w-full max-w-sm bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-700">
                    <p className="text-xs text-gray-400 mb-4 text-center">
                        Apunta la cámara del celular al código QR mostrado en la computadora.
                    </p>
                    <div id="reader" className="overflow-hidden rounded-xl"></div>
                </div>
            )}

            {status === 'loading' && (
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-green-400" />
                    <p className="text-sm font-medium">Iniciando sesión en la PC...</p>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center gap-3 text-green-400">
                    <CheckCircle2 className="h-12 w-12" />
                    <p className="text-base font-semibold">¡Dispositivo vinculado con éxito!</p>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center gap-3 text-red-400 max-w-xs text-center">
                    <AlertCircle className="h-12 w-12" />
                    <p className="text-sm">{errorMessage}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-2 text-xs bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                    >
                        Reintentar
                    </button>
                </div>
            )}
        </div>
    );
}