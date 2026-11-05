import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Radio, X } from 'lucide-react';
import { useTags } from '../../context/TagContext';

export function NfcPairingModal({ isOpen, onClose, pet, onConfirmPair }) {
  const { tags, loading } = useTags();
  const [tagId, setTagId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const availableTags = tags.filter((tag) => tag.activo && tag.estado === 'disponible');

  if (!isOpen || !pet) return null;

  const close = () => {
    setTagId('');
    setError(null);
    onClose();
  };

  const handlePair = async (event) => {
    event.preventDefault();
    if (!tagId) {
      setError('Selecciona un tag disponible del inventario.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const selectedTag = availableTags.find((tag) => String(tag.id) === tagId);
      if (!selectedTag) throw new Error('El tag seleccionado ya no está disponible. Actualiza el inventario.');
      await onConfirmPair(pet.id, String(selectedTag.id));
      close();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <form onSubmit={handlePair} className="w-full max-w-md space-y-5 rounded-3xl bg-surface p-6 text-text shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-bold">Vincular tag NFC</h2>
              <p className="text-xs text-textMuted">Mascota: {pet.nombre || pet.name}</p>
            </div>
          </div>
          <button type="button" onClick={close} aria-label="Cerrar" className="rounded-xl p-2 text-textMuted"><X className="h-5 w-5" /></button>
        </div>
        {error && <p role="alert" className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}
        <label className="block text-sm font-semibold">Tag disponible
          <select required value={tagId} onChange={(event) => setTagId(event.target.value)} className="mt-1 w-full rounded-xl border border-primary/20 bg-surface px-3 py-2">
            <option value="">Selecciona un tag…</option>
            {availableTags.map((tag) => <option key={tag.id} value={tag.id}>{tag.codigoQR} · {tag.uidNFC}</option>)}
          </select>
        </label>
        {loading ? <p role="status" className="text-xs text-textMuted">Cargando inventario…</p> : availableTags.length === 0 && <p className="text-xs text-textMuted">No hay tags disponibles. Registra uno en Inventario de tags.</p>}
        <div className="flex justify-end gap-3 border-t border-primary/10 pt-4">
          <button type="button" onClick={close} className="rounded-xl px-4 py-2 text-sm text-textMuted">Cancelar</button>
          <button disabled={isSubmitting || loading || !availableTags.length} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
            <CheckCircle2 className="h-4 w-4" />{isSubmitting ? 'Vinculando…' : 'Confirmar vínculo'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NfcPairingModal;
