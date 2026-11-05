import React, { useState } from 'react';
import { AlertCircle, Check, X } from 'lucide-react';
import { useTags } from '../../context/TagContext';
import { useVeterinaria } from '../../context/VeterinariaContext';

function initialForm(tag) {
  return tag ? {
    codigoQR: tag.codigoQR || '',
    uidNFC: tag.uidNFC || '',
    token_publico: tag.token_publico || '',
    precio: tag.precio ?? 5000,
    activo: tag.activo ?? true,
    estado: tag.estado || 'disponible',
    veterinaria_id: tag.veterinaria_id ? String(tag.veterinaria_id) : '',
  } : {
    codigoQR: '',
    uidNFC: '',
    token_publico: '',
    precio: 5000,
    activo: true,
    estado: 'disponible',
    veterinaria_id: '',
  };
}

export function TagModal({ isOpen, onClose, editingTag = null, onSuccess }) {
  const { createTag, updateTag } = useTags();
  const { veterinarias } = useVeterinaria();
  const [form, setForm] = useState(() => initialForm(editingTag));
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const setField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload = {
      ...form,
      codigoQR: form.codigoQR.trim(),
      uidNFC: form.uidNFC.trim(),
      token_publico: form.token_publico.trim() || undefined,
      precio: Number(form.precio),
      veterinaria_id: form.veterinaria_id ? Number(form.veterinaria_id) : null,
    };

    try {
      if (editingTag) await updateTag(editingTag.id, payload);
      else await createTag(payload);
      onSuccess?.();
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4 rounded-3xl bg-surface p-6 text-text shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{editingTag ? 'Editar tag NFC' : 'Registrar tag NFC'}</h2>
            <p className="text-xs text-textMuted">Los campos con * son obligatorios.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-xl p-2 text-textMuted hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <p role="alert" className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </p>
        )}

        <label className="block text-xs font-semibold">
          Código QR *
          <input required name="codigoQR" value={form.codigoQR} onChange={setField} className="mt-1 w-full rounded-xl border border-primary/20 bg-surface px-3 py-2" />
        </label>
        <label className="block text-xs font-semibold">
          UID NFC *
          <input required name="uidNFC" value={form.uidNFC} onChange={setField} className="mt-1 w-full rounded-xl border border-primary/20 bg-surface px-3 py-2" />
        </label>
        <label className="block text-xs font-semibold">
          Token público (opcional; se genera automáticamente si queda vacío)
          <input name="token_publico" value={form.token_publico} onChange={setField} className="mt-1 w-full rounded-xl border border-primary/20 bg-surface px-3 py-2" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold">
            Precio
            <input type="number" min="0" name="precio" value={form.precio} onChange={setField} className="mt-1 w-full rounded-xl border border-primary/20 bg-surface px-3 py-2" />
          </label>
          <label className="block text-xs font-semibold">
            Estado
            <select name="estado" value={form.estado} onChange={setField} className="mt-1 w-full rounded-xl border border-primary/20 bg-surface px-3 py-2">
              <option value="disponible">Disponible</option>
              <option value="reclamado">Reclamado</option>
              <option value="extraviado">Extraviado</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </label>
        </div>
        <label className="block text-xs font-semibold">
          Veterinaria asignada
          <select name="veterinaria_id" value={form.veterinaria_id} onChange={setField} className="mt-1 w-full rounded-xl border border-primary/20 bg-surface px-3 py-2">
            <option value="">Sin asignar</option>
            {veterinarias.map((veterinaria) => (
              <option key={veterinaria.id} value={veterinaria.id}>{veterinaria.nombre}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" name="activo" checked={form.activo} onChange={setField} />
          Tag activo
        </label>
        <div className="flex justify-end gap-3 border-t border-primary/10 pt-4">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-textMuted">Cancelar</button>
          <button disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
            <Check className="h-4 w-4" />{submitting ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
