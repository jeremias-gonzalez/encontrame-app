import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../api/config';
import { useUser } from '../context/UserContext';
import { normalizePet } from '../hooks/usePets';
import { PublicRescueView } from '../components/PublicRescue/PublicRescueView';

export function PublicScanPage() {
  const { identificador } = useParams();
  const location = useLocation();
  const { isAuthenticated } = useUser();
  const [scanState, setScanState] = useState({ identifier: null, result: null, error: null });
  const [actionError, setActionError] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [form, setForm] = useState({ nombre_mascota: '', especie: 'Perro', raza: '' });

  const loadScan = useCallback(async () => {
    try {
      const response = await api.get(`/scan/${encodeURIComponent(identificador)}`);
      setScanState({ identifier: identificador, result: response, error: null });
    } catch (requestError) {
      setScanState({ identifier: identificador, result: null, error: requestError.message });
    }
  }, [identificador]);

  useEffect(() => {
    void loadScan();
  }, [loadScan]);

  const loading = scanState.identifier !== identificador;
  const result = loading ? null : scanState.result;
  const error = actionError?.identifier === identificador
    ? actionError.message
    : loading ? null : scanState.error;

  const handleClaim = async (event) => {
    event.preventDefault();
    setActionError(null);
    setClaiming(true);
    try {
      await api.post('/scan/reclamar', {
        token_o_codigo: identificador,
        nombre_mascota: form.nombre_mascota.trim(),
        especie: form.especie,
        raza: form.raza.trim() || 'Mestizo',
        mostrar_telefono: true,
      });
      await loadScan();
    } catch (requestError) {
      setActionError({ identifier: identificador, message: requestError.message });
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white" role="status">Consultando la chapita…</main>;
  }

  if (error && !result) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 p-6 text-center text-white">
        <h1 className="text-2xl font-bold">No se pudo consultar la chapita</h1>
        <p role="alert" className="max-w-md text-rose-300">{error}</p>
        <button onClick={loadScan} className="rounded-xl bg-primary px-4 py-2 font-bold">Reintentar</button>
      </main>
    );
  }

  if (result?.reclamado && result.mascota) {
    const contact = result.mascota.contacto;
    const pet = normalizePet({
      ...result.mascota,
      usuario: contact ? {
        nombre: contact.nombre,
        telefono: contact.telefono,
        telefono_secundario: contact.telefono_secundario,
      } : null,
      tag: { codigoQR: result.codigoQR, token_publico: result.token_publico },
    });
    return <PublicRescueView pet={pet} scanIdentifier={identificador} />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
      <section className="w-full max-w-lg space-y-5 rounded-3xl border border-slate-700 bg-slate-900 p-7">
        <Link to="/" className="text-sm font-bold text-emerald-300">Encontrame</Link>
        <h1 className="text-2xl font-black">Chapita disponible para reclamar</h1>
        <p className="text-sm text-slate-300">{result?.mensaje}</p>
        {error && <p role="alert" className="rounded-xl bg-rose-900/50 p-3 text-sm text-rose-200">{error}</p>}
        {!isAuthenticated ? (
          <Link
            to={`/iniciar-sesion?next=${encodeURIComponent(location.pathname)}`}
            className="inline-flex rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white"
          >
            Iniciar sesión para reclamar
          </Link>
        ) : (
          <form onSubmit={handleClaim} className="space-y-4">
            <label className="block text-sm font-semibold">Nombre de la mascota *
              <input required value={form.nombre_mascota} onChange={(event) => setForm((current) => ({ ...current, nombre_mascota: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-white" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">Especie
                <input value={form.especie} onChange={(event) => setForm((current) => ({ ...current, especie: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-white" />
              </label>
              <label className="block text-sm font-semibold">Raza
                <input value={form.raza} onChange={(event) => setForm((current) => ({ ...current, raza: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-white" />
              </label>
            </div>
            <button disabled={claiming} className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-bold disabled:opacity-50">
              {claiming ? 'Reclamando…' : 'Reclamar tag y registrar mascota'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
