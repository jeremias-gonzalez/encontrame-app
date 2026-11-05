import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export function AuthPage() {
  const { login, register, loading } = useUser();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', contraseña: '' });
  const [error, setError] = useState(null);

  const setField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      if (isRegistering) {
        await register({
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          contraseña: form.contraseña,
          rol: 'dueno',
          activo: true,
        });
      }
      await login(form.email.trim(), form.contraseña);
      navigate(params.get('next') || '/', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 text-text">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5 rounded-3xl bg-surface p-7 shadow-xl">
        <div>
          <Link to="/" className="text-sm font-bold text-primary">← Encontrame</Link>
          <h1 className="mt-4 text-2xl font-black">{isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
          <p className="mt-1 text-sm text-textMuted">Autenticación segura mediante FastAPI.</p>
        </div>
        {error && <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700">{error}</p>}
        {isRegistering && (
          <label className="block text-sm font-semibold">Nombre
            <input required name="nombre" value={form.nombre} onChange={setField} className="mt-1 w-full rounded-xl border border-primary/20 bg-surface px-3 py-2" />
          </label>
        )}
        <label className="block text-sm font-semibold">Email
          <input required type="email" name="email" value={form.email} onChange={setField} className="mt-1 w-full rounded-xl border border-primary/20 bg-surface px-3 py-2" />
        </label>
        <label className="block text-sm font-semibold">Contraseña
          <input required minLength={isRegistering ? 6 : undefined} type="password" name="contraseña" value={form.contraseña} onChange={setField} className="mt-1 w-full rounded-xl border border-primary/20 bg-surface px-3 py-2" />
        </label>
        <button disabled={loading} className="w-full rounded-xl bg-primary px-4 py-3 font-bold text-white disabled:opacity-50">
          {loading ? 'Conectando…' : isRegistering ? 'Registrarme' : 'Ingresar'}
        </button>
        <button type="button" onClick={() => { setIsRegistering((value) => !value); setError(null); }} className="w-full text-sm text-primary hover:underline">
          {isRegistering ? 'Ya tengo una cuenta' : 'Crear una cuenta'}
        </button>
      </form>
    </main>
  );
}
