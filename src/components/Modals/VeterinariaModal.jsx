import React, { useState, useEffect } from 'react';
import { X, Building2, Check, AlertCircle } from 'lucide-react';
import { useVeterinaria } from '../../context/VeterinariaContext';

export function VeterinariaModal({ isOpen, onClose, editingVeterinaria = null, onSuccess }) {
  const { createVeterinaria, updateVeterinaria } = useVeterinaria();

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [activo, setActivo] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    if (editingVeterinaria) {
      setNombre(editingVeterinaria.nombre || '');
      setTelefono(editingVeterinaria.telefono || '');
      setActivo(editingVeterinaria.activo ?? true);
    } else {
      setNombre('');
      setTelefono('');
      setActivo(true);
    }
    setError(null);
  }, [isOpen, editingVeterinaria]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim() || !telefono.trim()) {
      setError('Nombre y Teléfono son obligatorios según FastAPI.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        activo,
      };

      if (!editingVeterinaria) {
        await createVeterinaria(payload);
      } else {
        await updateVeterinaria(editingVeterinaria.id, payload);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar veterinaria en FastAPI.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text">
                {editingVeterinaria ? 'Editar Veterinaria' : 'Nueva Veterinaria'}
              </h3>
              <p className="text-xs text-textMuted">
                Endpoint FastAPI: /veterinarias/
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-textMuted hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
              Nombre de la Clínica / Veterinaria *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Veterinaria San Roque"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-surface text-text text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-textMuted mb-1 uppercase tracking-wider">
              Teléfono de Contacto *
            </label>
            <input
              type="tel"
              required
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej. 0351-4889900"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-surface text-text text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs text-text cursor-pointer">
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              Punto de distribución / Veterinaria activa
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-textMuted hover:text-text transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-[#8D4925] hover:bg-[#5E2F17] dark:bg-[#E3B48F] dark:hover:bg-[#F3E6CF] text-[#FBF7F1] dark:text-[#1E130C] transition shadow-md shadow-[#8D4925]/20 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Guardando...' : (editingVeterinaria ? 'Guardar Cambios' : 'Registrar Veterinaria')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VeterinariaModal;

