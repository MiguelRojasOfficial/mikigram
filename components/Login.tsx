'use client'

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { auth, db } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { MessageSquare, ShieldCheck, Phone, Lock, Loader2, ArrowLeft, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function Login() {
    const [phoneNumber, setPhoneNumber] = useState<string | undefined>('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showQR, setShowQR] = useState(true);

    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
    const confirmationResultRef = useRef<ConfirmationResult | null>(null);
    const { loginWithGoogle } = useAuth();
    const router = useRouter();

    const qrSessionToken = "mikigram-auth-session-xyz123";

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

        if (!phoneNumber || phoneNumber.length < 8) {
            setError('Ingresa un número de celular válido.');
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
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear();
                recaptchaVerifierRef.current = null;
            }
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
                router.push('/profile');
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
            
            <style jsx global>{`
                .PhoneInput {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                }
                .PhoneInputCountry {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: rgba(243, 244, 246, 1);
                    padding: 12px;
                    border-radius: 12px;
                    border: 1px solid rgba(209, 213, 219, 1);
                }
                .dark .PhoneInputCountry {
                    background: #1a0724;
                    border-color: rgba(75, 85, 99, 1);
                }
                .PhoneInputCountrySelect {
                    background: transparent;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                }
                .PhoneInputInput {
                    width: 100%;
                    padding: 14px 16px;
                    border-radius: 12px;
                    border: 1px solid rgba(209, 213, 219, 1);
                    background-color: rgba(249, 250, 251, 1);
                    outline: none;
                }
                .dark .PhoneInputInput {
                    background-color: #1a0724;
                    border-color: rgba(75, 85, 99, 1);
                    color: white;
                }
            `}</style>

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
                
                <div className="h-20 w-20 bg-green-500 rounded-3xl flex items-center justify-center shadow-lg mb-6 rotate-3 flex-shrink-0">
                    <MessageSquare className="h-10 w-10 -rotate-3 text-white" />
                </div>

                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    {showQR ? 'Escanear QR' : (isCodeSent ? 'Verifica tu número' : 'Entrar a Mikigram')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-6 text-sm px-4">
                    {showQR 
                        ? 'Escanea este código desde la app móvil de Mikigram para iniciar sesión.' 
                        : (isCodeSent ? `Ingrese el código enviado a ${phoneNumber}` : 'Contactate con tu celular o cuenta de Google.')}
                </p>

                {error && (
                    <div className="w-full p-3 mb-4 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs text-center font-medium">
                        {error}
                    </div>
                )}

                {showQR ? (
                    <div className="w-full flex flex-col items-center gap-4 mb-6">
                        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-inner">
                            <QRCodeSVG value={qrSessionToken} size={180} />
                        </div>
                        <p className="text-xs text-gray-400 text-center">
                            Abre Mikigram en tu celular &gt; Dispositivos vinculados
                        </p>
                    </div>
                ) : (
                    <div className="w-full mb-6 space-y-4">
                        {!isCodeSent ? (
                            <form onSubmit={handleSendCode} className="space-y-3">
                                <div className="w-full">
                                    <PhoneInput
                                        defaultCountry="PE"
                                        placeholder="Número de celular"
                                        value={phoneNumber}
                                        onChange={setPhoneNumber}
                                        disabled={loading}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !phoneNumber}
                                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3.5 rounded-xl font-semibold transition active:scale-95 shadow"
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
                )}

                {!isCodeSent && (
                    <button
                        type="button"
                        onClick={() => {
                            setShowQR(!showQR);
                            setError('');
                        }}
                        className="w-full mb-4 flex items-center justify-center gap-2 text-xs font-semibold text-green-600 hover:text-green-500 transition"
                    >
                        {showQR ? (
                            <>
                                <Phone size={16} />
                                Ingresar con número celular
                            </>
                        ) : (
                            <>
                                <QrCode size={16} />
                                Ingresar con Código QR
                            </>
                        )}
                    </button>
                )}

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