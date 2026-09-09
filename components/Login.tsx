'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function LoginPage() {
  const [method, setMethod] = useState<'qr' | 'email' | 'phone'>('qr');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Token dinámico para la sesión vía QR
  const qrSessionToken = "mikigram-auth-session-12345";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (method === 'email') {
      console.log('Login con correo:', email, password);
    } else if (method === 'phone') {
      console.log('Login con celular:', phone, password);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-[#0c1317] p-4 select-none">
      <div className="w-full max-w-md bg-white dark:bg-[#111b20] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center">
        
        {/* Encabezado */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Mikigram</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          {method === 'qr'
            ? 'Escanea el código con tu app móvil para ingresar'
            : 'Inicia sesión con tus credenciales'}
        </p>

        {/* MÉTODOS DE AUTENTICACIÓN */}

        {/* 1. Opciones por Código QR */}
        {method === 'qr' && (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="p-4 bg-white rounded-2xl shadow-inner border border-gray-100">
              <QRCodeSVG value={qrSessionToken} size={190} />
            </div>
            <p className="text-xs text-gray-400 max-w-xs">
              Abre Mikigram en tu celular &gt; Ajustes &gt; Escanear código QR
            </p>
          </div>
        )}

        {/* 2 y 3. Formulario (Correo o Número de Celular) */}
        {(method === 'email' || method === 'phone') && (
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
            
            {/* Selector secundario entre Correo y Celular */}
            <div className="flex bg-gray-100 dark:bg-[#202c35] p-1 rounded-xl mb-1">
              <button
                type="button"
                onClick={() => setMethod('email')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  method === 'email'
                    ? 'bg-white dark:bg-[#111b20] text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Correo
              </button>
              <button
                type="button"
                onClick={() => setMethod('phone')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  method === 'phone'
                    ? 'bg-white dark:bg-[#111b20] text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Celular
              </button>
            </div>

            {/* Input dinámico según selección */}
            {method === 'email' ? (
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm rounded-xl bg-gray-50 dark:bg-[#202c35] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <input
                type="tel"
                placeholder="Número de celular (+51 ...)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm rounded-xl bg-gray-50 dark:bg-[#202c35] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 text-sm rounded-xl bg-gray-50 dark:bg-[#202c35] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              Iniciar Sesión
            </button>
          </form>
        )}

        {/* Alternar a QR si está en formulario, o a Formulario si está en QR */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 w-full">
          {method === 'qr' ? (
            <button
              type="button"
              onClick={() => setMethod('email')}
              className="text-xs text-blue-500 hover:underline font-medium"
            >
              Ingresar con correo o número de celular
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMethod('qr')}
              className="text-xs text-blue-500 hover:underline font-medium"
            >
              Ingresar escaneando código QR
            </button>
          )}
        </div>

      </div>
    </div>
  );
}