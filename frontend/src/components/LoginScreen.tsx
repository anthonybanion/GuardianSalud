import { useState } from 'react';
import { Shield, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useApp } from '@/store';

export function LoginScreen() {
  const { login, authLoading } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Por favor complete todos los campos.');
      return;
    }

    try {
      await login(email.trim(), password);
    } catch (err) {
      // El mensaje ya viene normalizado desde el store / ApiError
      const message =
        err instanceof Error ? err.message : 'Credenciales inválidas. Verifique e intente de nuevo.';

      // Mensajes más amigables para errores comunes del backend
      if (message.toLowerCase().includes('400') || message.toLowerCase().includes('credencial')) {
        setError('Correo o contraseña incorrectos.');
      } else if (message.toLowerCase().includes('403') || message.toLowerCase().includes('deshabilitad')) {
        setError('Su cuenta está deshabilitada. Contacte al administrador.');
      } else if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch')) {
        setError('No se pudo conectar con el servidor. Verifique su conexión.');
      } else {
        setError(message);
      }
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-brand-50 to-slate-100 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Fondo decorativo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand-200/30 blur-3xl dark:bg-brand-900/20" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-900/20" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            GuardiánSalud
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gestión Operativa y Adherencia de Medicamentos
          </p>
        </div>

        {/* Card de login */}
        <div className="card p-6 sm:p-8">
          <h2 className="mb-5 text-base font-semibold text-slate-700 dark:text-slate-200">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="label-base" htmlFor="login-email">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@guardiansalud.app"
                  className="input-base pl-10"
                  autoComplete="email"
                  disabled={authLoading}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="label-base" htmlFor="login-password">
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base pl-10"
                  autoComplete="current-password"
                  disabled={authLoading}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20">
                <AlertCircle
                  size={16}
                  className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
                />
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={authLoading}
              className="btn-primary w-full py-3 text-base disabled:opacity-60"
            >
              {authLoading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          Sistema GuardiánSalud · Acceso restringido a personal autorizado
        </p>
      </div>
    </div>
  );
}
