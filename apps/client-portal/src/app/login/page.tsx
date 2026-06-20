"use client";

import React, { useState, useEffect } from 'react';
import { 
  auth, 
  db 
} from '@envios-ya/firebase/src/client';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  Lock, 
  Mail, 
  Chrome, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  // Auth views
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only for registration
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sincronizar si ya está logueado o si hay un usuario simulado
  useEffect(() => {
    // Si ya existe sesión simulada o real en localStorage/auth, podemos sugerir ir al home.
    const simUser = localStorage.getItem('envios_ya_sim_user');
    if (simUser) {
      router.push('/');
    }
  }, [router]);

  const handleFirebaseError = (err: any) => {
    console.error("Auth error details:", err);
    if (err.code === 'auth/invalid-api-key' || err.message?.includes('API key')) {
      return "Error de Configuración: Firebase no está configurado con una API key válida. Por favor, usa el 'Modo Simulación' para probar el sistema sin conexión.";
    }
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      return "Credenciales inválidas. Por favor, verifica tu correo y contraseña.";
    }
    if (err.code === 'auth/email-already-in-use') {
      return "Este correo ya está registrado. Intenta iniciar sesión.";
    }
    if (err.code === 'auth/weak-password') {
      return "La contraseña debe tener al menos 6 caracteres.";
    }
    return err.message || "Ocurrió un error inesperado al procesar la solicitud.";
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (isRegister && !name.trim())) return;

    setLoading(true);
    setErrorMessage('');
    try {
      if (isRegister) {
        // Register flow
        const credentials = await createUserWithEmailAndPassword(auth, email, password);
        const user = credentials.user;

        // Create Firestore profile doc
        await setDoc(doc(db, 'users', user.uid), {
          name: name,
          email: email,
          role: 'client', // Default role
          createdAt: new Date().toISOString()
        });

        // Limpiar cualquier sesión simulada previa para no confundir
        localStorage.removeItem('envios_ya_sim_user');
        alert("Usuario registrado con éxito. Redirigiendo...");
        router.push('/');
      } else {
        // Login flow
        const credentials = await signInWithEmailAndPassword(auth, email, password);
        // Verify Firestore profile
        const userDoc = await getDoc(doc(db, 'users', credentials.user.uid));
        if (!userDoc.exists()) {
          // Fallback registration
          await setDoc(doc(db, 'users', credentials.user.uid), {
            name: credentials.user.displayName || email.split('@')[0],
            email: email,
            role: 'client',
            createdAt: new Date().toISOString()
          });
        }
        localStorage.removeItem('envios_ya_sim_user');
        router.push('/');
      }
    } catch (err: any) {
      setErrorMessage(handleFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const provider = new GoogleAuthProvider();
      const credentials = await signInWithPopup(auth, provider);
      const user = credentials.user;

      // Check if user has profile doc
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        // Register Google user automatically with default role 'client'
        await setDoc(userDocRef, {
          name: user.displayName || 'Google User',
          email: user.email || '',
          role: 'client',
          createdAt: new Date().toISOString()
        });
      }

      localStorage.removeItem('envios_ya_sim_user');
      router.push('/');
    } catch (err: any) {
      setErrorMessage(handleFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  // Mock roles for Simulation Mode
  const demoUsers = [
    { id: 'client-1', name: 'Huésped Casa Santo Domingo', role: 'client', companyId: 'hotel_santo_domingo', desc: 'Cliente corporativo' },
    { id: 'super-1', name: 'Aldo SuperAdmin', role: 'super_admin', companyId: 'global', desc: 'Control total de la plataforma' },
    { id: 'admin-1', name: 'Carlos Dispatcher', role: 'admin', companyId: 'envios_ya_corp', desc: 'Coordinador de envíos' },
    { id: 'partner-1', name: 'Gerente La Merced', role: 'partner', companyId: 'restaurante_antigua', desc: 'Socio comercial' },
    { id: 'pilot-1', name: 'Mario Ponce', role: 'pilot', companyId: 'pilot-fleet', desc: 'Conductor express' }
  ];

  const handleDemoLogin = (user: typeof demoUsers[0]) => {
    setLoading(true);
    // Guardamos la sesión simulada en localStorage
    localStorage.setItem('envios_ya_sim_user', JSON.stringify({
      id: user.id,
      name: user.name,
      role: user.role,
      companyId: user.companyId
    }));
    // Deslogueamos Firebase real para que no colisionen
    auth.signOut().catch(() => {});
    
    setTimeout(() => {
      setLoading(false);
      router.push('/');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden antialiased">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md space-y-6 z-10">
        
        {/* Logo and Subtitle */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold text-orange-500 uppercase tracking-wider">
            <ShieldCheck size={12} />
            Módulo SaaS / Clientes
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            ENVIOS<span className="text-orange-500">-YA</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Logística express y coordinación de pedidos para hoteles, socios y repartidores de Antigua Guatemala.
          </p>
        </div>

        {/* Auth Box */}
        <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-md rounded-2xl p-6 shadow-xl space-y-5">
          
          {/* Tabs for Login / Register */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800/60">
            <button
              onClick={() => { setIsRegister(false); setErrorMessage(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${!isRegister ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setIsRegister(true); setErrorMessage(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${isRegister ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Registrarse
            </button>
          </div>

          {/* Configuration alert message */}
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex gap-2 items-start leading-relaxed">
              <AlertTriangle className="shrink-0 mt-0.5" size={14} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {isRegister && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 text-slate-500" size={14} />
                <input
                  type="email"
                  required
                  placeholder="usuario@comercio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 text-slate-500" size={14} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-orange-600/10"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <>
                  {isRegister ? 'Registrar Cuenta' : 'Iniciar Sesión'}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
            <div className="h-px bg-slate-800 flex-1" />
            <span>O continuar con</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {/* Third-Party Logins */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 hover:text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Chrome size={14} className="text-orange-500" />
            Ingresar con Google
          </button>
        </div>

        {/* Simulation / Demo Box */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-3.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Entrada Rápida (Modo Simulación)</h3>
          </div>
          
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Haga clic en cualquiera de estos perfiles precargados para omitir Firebase Auth e iniciar de forma inmediata en modo desarrollo.
          </p>

          <div className="grid grid-cols-1 gap-2 pt-1">
            {demoUsers.map(u => (
              <button
                key={u.id}
                onClick={() => handleDemoLogin(u)}
                disabled={loading}
                className="flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850/80 hover:border-slate-800 rounded-xl transition-all group text-left"
              >
                <div>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-orange-500 transition-colors block">{u.name}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">{u.desc}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-slate-900 rounded text-[9px] font-mono text-slate-400 border border-slate-800">
                    {u.role}
                  </span>
                  <Play size={10} className="text-slate-600 group-hover:text-orange-500 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
