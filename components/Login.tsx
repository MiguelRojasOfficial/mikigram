'use client'

import { useState, useEffect, useRef} from 'react';
import { useAuth } from '@/hooks/useAuth';
import { auth, db } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { MessageSquare, ShieldCheck, Phone, Lock, Loader2, ArrowLeft } from 'lucide-react';

export default function Login() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
    const confirmationResultRef = useRef<ConfirmationResult | null>(null);
    const { loginWithGoogle } = useAuth();

    useEffect(() => {
        if (!recaptchaVerifierRef.current && auth) {
            try {
                recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    'size': 'invisible',
                    'callback': () => {},
                    'expired-callback': () => {
                        setError('El reCAPTCHA expiró.');
                    }
                });
            } catch (err) {
                console.error("Error inicializando reCAPTCHA:", err);
            }
        }

        return () => {
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear();
                recaptchaVerifierRef.current = null;
            }
        };
    }, []);

    const handleSendCode = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);
     
        if (!phoneNumber.startsWith('+') || phoneNumber.length <10) {
            setError('Ingresa el número con formato internacional (ej: +51999...)');
            setLoading(false);
            return;
        }

        const appVerifier = recaptchaVerifierRef.current;
        if (!appVerifier) {
            setError('El verificado de seguridad no está listo.');
            setLoading(false);
            return;
        }

        try {
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            confirmationResultRef.current = confirmationResult;
            setIsCodeSent(true);
        } catch (err: any) {
            console.error(err);
            setError('Error al enviar SMS. Verifica el número o intenta más tarde.');
            appVerifier.clear();
            recaptchaVerifierRef.current = null;
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!confirmationResultRef.current) {
            setError('No hay una sesión de verificación activa.');
            setLoading(false);
            return;
        }

        try {
            const result = await confirmationResultRef.current.confirm(verificationCode);
            const user = result.user;

            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    await setDoc(userDocRef, {
                        uid: user.uid,
                        phoneNumber: user.phoneNumber,
                        displayName: `Usuario ${user.phoneNumber?.slice(-4)}`,
                        photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`,
                        createdAt: new Date().toISOString(),
                        loginMethod: 'phone'
                    });
                }
            }
        } catch (err: any) {
            console.error(err);
            setError('Codigo de verificación incorrecto o expirado.');
        } finally {
            setLoading(false);
        }
    };

    const resetPhoneFlow = () => {
        setIsCodeSent(false);
        setVerificationCode('');
        confirmationResultRef.current = null;
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f2f5] dark:bg-[#111b20] p-4 relative">
            
            <div id="recaptcha-container"></div>

            <div className="bg-white dark:bg-[#280e35] p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center border border-gray-200 dark:border-gray-700 transition-all duration-300">
                
                {isCodeSent && (
                    <button
                        onClick={resetPhoneFlow}
                        className="absolute top-6 left-6 text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center gap-2 text-sm"
                    >
                        <ArrowLeft size={16} />
                        Volver
                    </button>
                )}
                
                <div className="h-20 w-20 bg-blue-500 rounded-3xl flex items-center justify-center shadow-lg mb-6 rotate-3 flex-shrink-0">
                    <MessageSquare className="h-10 w-10 -rotate-3 text-white" />
                </div>

                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    {isCodeSent ? 'Verifica tu número' : 'Entrar a Mikigram'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-6 text-sm px-4">
                    {isCodeSent ? `Ingrese el código enviado a ${phoneNumber}` : 'Contactate con tu celular o cuenta de Google.'}
                </p>

                {error && (
                    <div className="w-full p-3 mb-4 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs text-center font-medium">
                        {error}
                    </div>
                )}

                <div className="w-full mb-6 space-y-4">
                    {!isCodeSent ? (
                        <form onSubmit={handleSendCode} className="space-y-3">
                            <div className="relative">
                                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="+51 999 888 777"
                                    disabled={loading}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#1a0724] text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none transition"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !phoneNumber}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3.5 rounded-xl font-semibold transition active:scale-95 shadow"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Recibir código SMS'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyCode} className="space-y-3">
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Código de 6 dígitos"
                                    maxLength={6}
                                    disabled={loading}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#1a0724] text-gray-800 dark:text-white text-center tracking-[0.5em] font-bold text-lg focus:ring-2 focus:ring-green-300 focus:border-green-400 outline-none transition"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || verificationCode.length !== 6}
                                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3.5 rounded-xl font-semibold transition active:scale-95 shadow"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin"/> : 'Verificar e ingresar'}
                            </button>
                        </form>
                    )}
                </div>

                {!isCodeSent && (
                    <div className="w-full flex items-center gap-3 mb-6">
                        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
                        <span className="text-xs text-gray-400 font-medium">o</span>
                        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                )}
                
                {!isCodeSent && (
                    <>
                        <div className="w-full space-y-3 mb-6">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#2a3942] border border-gray-100 dark:border-gray-700 shadow-inner">
                                <ShieldCheck size={20} className="text-green-500" />
                                <span className="text-xs font-medium dark:text-gray-200 truncate">Acceso seguro y verificado</span>
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
                    </>
                )}

                <footer className="mt-8 text-xs text-gray-400 text-center">
                    Al continuar, aceptas los términos de servicio de Mikigram.
                </footer>
            </div>
        </div>
    );
}
 /*
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
*/