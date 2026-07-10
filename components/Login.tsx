/*'use client'

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
'use client';

import { useState, useEffect, useRef } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
    RecaptchaVerifier, 
    signInWithPhoneNumber, 
    ConfirmationResult,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Phone, Lock, Loader2, MessageSquare, Mail, User } from 'lucide-react';

export default function LoginPage() {
    const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);  
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
    const confirmationResultRef = useRef<ConfirmationResult | null>(null);

    useEffect(() => {
        if (!recaptchaVerifierRef.current && loginMethod === 'phone') {
            try {
                recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    size: 'invisible',
                    'expired-callback': () => {
                        setError('El reCAPTCHA expiró. Por favor, intenta de nuevo.');
                    }
                });
            } catch (err) {
                console.error('Error al inicializar reCAPTCHA:', err);
            }
        }

        return () => {
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear();
                recaptchaVerifierRef.current = null;
            }
        };
    }, [loginMethod]);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let userCredential;
            if (isRegistering) {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    email: user.email,
                    displayName: displayName || email.split('@')[0],
                    photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`,
                    createdAt: new Date().toISOString(),
                });
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }

            if (userCredential.user) router.push('/');
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Credenciales incorrectas.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Este correo ya está registrado.');
            } else {
                setError('Ocurrió un error al intentar autenticar.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSendSMS = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!phoneNumber.startsWith('+')) {
            setError('Incluye el código de país (Ej: +51987654321)');
            setLoading(false);
            return;
        }

        try {
            const appVerifier = recaptchaVerifierRef.current;
            if (!appVerifier) throw new Error('Verificador de seguridad no listo.');

            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            confirmationResultRef.current = confirmationResult;
            setIsCodeSent(true);
        } catch (err: any) {
            console.error(err);
            setError('Error al enviar el SMS. Verifica el formato del número.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySMSCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!confirmationResultRef.current) {
            setError('Sesión expirada. Envía el código de nuevo.');
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
                        displayName: `User ${user.phoneNumber?.slice(-4)}`,
                        photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`,
                        createdAt: new Date().toISOString(),
                    });
                }
                router.push('/');
            }
        } catch (err) {
            setError('Código de verificación incorrecto.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b141a] flex items-center justify-center p-4">
            <div id="recaptcha-container"></div>

            <div className="w-full max-w-md bg-[#111b20] rounded-2xl p-8 border border-gray-800 shadow-xl text-gray-200">
                
               
                <div className="flex flex-col items-center mb-6 text-center">
                    <div className="p-4 bg-[#202c35] rounded-full text-blue-500 mb-3">
                        <MessageSquare size={36} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Mikigram</h1>
                    <p className="text-xs text-gray-400 mt-1">Elige tu método de ingreso favorito</p>
                </div>

                
                {!isCodeSent && (
                    <div className="flex bg-[#202c35] p-1 rounded-xl mb-6 border border-gray-700">
                        <button
                            type="button"
                            onClick={() => { setLoginMethod('email'); setError(''); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === 'email' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            Correo Electrónico
                        </button>
                        <button
                            type="button"
                            onClick={() => { setLoginMethod('phone'); setError(''); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === 'phone' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            Número de Celular
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-900/40 border border-red-500 text-red-200 text-sm rounded-lg text-center">
                        {error}
                    </div>
                )}

             
                {loginMethod === 'email' && (
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        {isRegistering && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Nombre Completo</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"><User size={16} /></span>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Tu nombre"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-[#202c35] rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 text-white text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Correo Electrónico</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"><Mail size={16} /></span>
                                <input
                                    type="email"
                                    required
                                    placeholder="ejemplo@correo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-[#202c35] rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 text-white text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Contraseña</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"><Lock size={16} /></span>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-[#202c35] rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 text-white text-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : (isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión')}
                        </button>

                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => setIsRegistering(!isRegistering)}
                                className="text-xs text-blue-400 hover:underline"
                            >
                                {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
                            </button>
                        </div>
                    </form>
                )}

               
                {loginMethod === 'phone' && (
                    <div className="space-y-4">
                        {!isCodeSent ? (
                            <form onSubmit={handleSendSMS} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Número de Celular</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"><Phone size={16} /></span>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="+51987654321"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-[#202c35] rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 text-white text-sm"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Enviar código por SMS'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifySMSCode} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Código de Verificación</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"><Lock size={16} /></span>
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            placeholder="000000"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                            className="w-full pl-10 pr-4 py-2.5 bg-[#202c35] rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 text-white tracking-[0.4em] text-center font-bold text-sm"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Verificar e Ingresar'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsCodeSent(false)}
                                    className="w-full text-center text-xs text-gray-500 hover:text-gray-300 block"
                                >
                                    Cambiar número telefónico
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}