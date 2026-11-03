import React from 'react';
import { PawPrint, Plus, RotateCcw, SearchX } from 'lucide-react';

export function EmptyState({
  isFiltering,
  onClearFilters,
  onAddNewPet,
  onRestoreDemo,
}) {
  if (isFiltering) {
    return (
      <div className="bg-surface rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-lg mx-auto shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-2">No se encontraron mascotas</h3>
        <p className="text-textMuted text-sm mb-6">
          Ninguna mascota coincide con los filtros aplicados (búsqueda, especie o estado).
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Limpiar filtros
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center max-w-md mx-auto shadow-sm">
      <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
        <PawPrint className="w-10 h-10" />
      </div>
      <h3 className="text-2xl font-bold mb-2">Aún no hay mascotas registradas</h3>
      <p className="text-textMuted text-sm mb-6 leading-relaxed">
        Comienza dando de alta a un paciente y vinculando su primer dije físico 3D con tecnología NFC.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onAddNewPet && (
          <button
            onClick={onAddNewPet}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-primary text-white hover:opacity-90 transition-opacity shadow-md shadow-primary/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Registrar Mascota
          </button>
        )}
        {onRestoreDemo && (
          <button
            onClick={onRestoreDemo}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Cargar Datos de Demostración
          </button>
        )}
      </div>
    </div>
  );
}

export default EmptyState;

