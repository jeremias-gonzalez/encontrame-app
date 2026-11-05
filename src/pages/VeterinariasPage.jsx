import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { VeterinariaModal } from '../components/Modals/VeterinariaModal';
import { useToast } from '../context/ToastContext';
import { useVeterinaria } from '../context/VeterinariaContext';

export function VeterinariasPage() {
  const { veterinarias, loading, error, fetchVeterinarias, getVeterinaria, deleteVeterinaria } = useVeterinaria();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVeterinaria, setEditingVeterinaria] = useState(null);
  const [selectedVeterinaria, setSelectedVeterinaria] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    fetchVeterinarias().catch(() => {});
  }, [fetchVeterinarias]);

  const showDetails = async (veterinaria) => {
    setActionError(null);
    try {
      setSelectedVeterinaria(await getVeterinaria(veterinaria.id));
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  const handleDelete = async (veterinaria) => {
    if (!window.confirm(`¿Desactivar ${veterinaria.nombre}?`)) return;
    setActionError(null);
    try {
      await deleteVeterinaria(veterinaria.id, true);
      showToast('Veterinaria desactivada', `${veterinaria.nombre} quedó inactiva.`, 'success');
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-[#92553A] dark:text-[#E3B48F]">Veterinarias</h1>
          <p className="text-sm text-textMuted">Puntos de distribución y tags asignados.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchVeterinarias().catch(() => {})} className="inline-flex items-center gap-2 rounded-xl border border-primary/20 px-3 py-2 text-sm"><RefreshCw className="h-4 w-4" />Actualizar</button>
          <button onClick={() => { setEditingVeterinaria(null); setModalOpen(true); }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-white"><Plus className="h-4 w-4" />Nueva veterinaria</button>
        </div>
      </header>
      {(actionError || error) && <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700">{actionError || error}</p>}
      {loading ? <p role="status" className="rounded-2xl bg-surface p-6 text-sm text-textMuted">Cargando veterinarias…</p> : (
        <div className="overflow-x-auto rounded-2xl bg-surface shadow-sm">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b border-primary/10 text-xs uppercase text-textMuted">
              <tr><th className="p-4">Nombre</th><th className="p-4">Teléfono</th><th className="p-4">Estado</th><th className="p-4">Acciones</th></tr>
            </thead>
            <tbody>
              {veterinarias.map((veterinaria) => (
                <tr key={veterinaria.id} className="border-b border-primary/5">
                  <td className="p-4 font-semibold">{veterinaria.nombre}</td><td className="p-4">{veterinaria.telefono}</td><td className="p-4">{veterinaria.activo ? 'Activa' : 'Inactiva'}</td>
                  <td className="p-4"><div className="flex gap-3">
                    <button onClick={() => showDetails(veterinaria)} className="text-primary hover:underline">Detalle</button>
                    <button onClick={() => { setEditingVeterinaria(veterinaria); setModalOpen(true); }} className="text-primary hover:underline">Editar</button>
                    {veterinaria.activo && <button onClick={() => handleDelete(veterinaria)} className="text-rose-600 hover:underline">Desactivar</button>}
                  </div></td>
                </tr>
              ))}
              {veterinarias.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-textMuted">No hay veterinarias registradas.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {selectedVeterinaria && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4" onClick={() => setSelectedVeterinaria(null)}>
          <div className="w-full max-w-lg space-y-3 rounded-2xl bg-surface p-6 text-sm" onClick={(event) => event.stopPropagation()}>
            <h2 className="text-lg font-bold">{selectedVeterinaria.nombre}</h2><p>{selectedVeterinaria.telefono}</p>
            <h3 className="font-bold">Tags asignados ({selectedVeterinaria.tags?.length || 0})</h3>
            {selectedVeterinaria.tags?.map((tag) => <p key={tag.id}>{tag.codigoQR} · {tag.estado}</p>)}
            <button onClick={() => setSelectedVeterinaria(null)} className="rounded-xl bg-primary px-4 py-2 text-white">Cerrar</button>
          </div>
        </div>
      )}
      <VeterinariaModal
        isOpen={modalOpen}
        editingVeterinaria={editingVeterinaria}
        onClose={() => setModalOpen(false)}
        onSuccess={() => showToast('Veterinaria guardada', 'Los datos se sincronizaron con la API.', 'success')}
      />
    </section>
  );
}
