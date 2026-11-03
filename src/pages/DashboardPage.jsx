import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  Sparkles,
} from 'lucide-react';
import { usePets } from '../hooks/usePets';
import { useToast } from '../context/ToastContext';
import { MetricCards } from '../components/Dashboard/MetricCards';
import { PetCard } from '../components/Dashboard/PetCard';
import { PetModal } from '../components/Dashboard/PetModal';
import { NfcPairingModal } from '../components/Dashboard/NfcPairingModal';
import { LoadingSkeleton } from '../components/Common/LoadingSkeleton';
import { EmptyState } from '../components/Common/EmptyState';
import { ErrorAlert } from '../components/Common/ErrorAlert';

export function DashboardPage({
  onPreviewNfc,
  isCreateModalOpen: propIsCreateModalOpen,
  setIsCreateModalOpen: propSetIsCreateModalOpen,
}) {
  const {
    pets,
    allPetsCount,
    metrics,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    speciesFilter,
    setSpeciesFilter,
    statusFilter,
    setStatusFilter,
    refresh,
    createPet,
    updatePet,
    deletePet,
    toggleLost,
    pairTag,
    unpairTag,
    resetToSeeds,
  } = usePets();

  const { showToast } = useToast();

  const [localModalOpen, setLocalModalOpen] = useState(false);
  const isCreateOpen = propIsCreateModalOpen !== undefined ? propIsCreateModalOpen : localModalOpen;
  const setCreateOpen = propSetIsCreateModalOpen || setLocalModalOpen;

  const [editingPet, setEditingPet] = useState(null);
  const [pairingPet, setPairingPet] = useState(null);

  const handleEdit = (pet) => {
    setEditingPet(pet);
    setCreateOpen(true);
  };

  const handleCloseModal = () => {
    setCreateOpen(false);
    setEditingPet(null);
  };

  const handleSavePet = async (data) => {
    const petName = data.nombre || data.name;
    if (editingPet) {
      await updatePet(editingPet.id, data);
      showToast('Paciente Actualizado', `Ficha de ${petName} modificada con éxito.`, 'success');
    } else {
      await createPet(data);
      showToast('Nueva Mascota Registrada', `${petName} guardado/a en el sistema.`, 'success');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Encabezado del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Sistema de Identificación Inteligente NFC
          </div>
          <h2 className="text-3xl font-black text-[#92553A] dark:text-[#E3B48F] tracking-tight">
            Dashboard Veterinario
          </h2>
          <p className="text-xs text-textMuted mt-0.5">
            Gestión clínica de pacientes, tutores y vinculación de dijes 3D con tecnología NFC.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#8D4925] hover:bg-[#5E2F17] dark:bg-[#E3B48F] dark:hover:bg-[#F3E6CF] text-[#FBF7F1] dark:text-[#1E130C] text-xs font-bold shadow-md shadow-[#8D4925]/20 transition-opacity cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Paciente</span>
        </motion.button>
      </div>

      {/* 2. Métricas del Sistema (DoD: Skeletons durante carga) */}
      {loading ? <LoadingSkeleton /> : <MetricCards metrics={metrics} />}

      {/* 3. Barra de Búsqueda y Filtros con Glassmorphism */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Input de Búsqueda */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por mascota, tutor, teléfono o NFC..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-primary/20 bg-surface/80 text-text text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition placeholder:text-textMuted/70"
            />
          </div>

          {/* Filtros de Especie estilo iOS Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs font-bold">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'perro', label: '🐶 Perros' },
              { id: 'gato', label: '🐱 Gatos' },
              { id: 'conejo', label: '🐰 Conejos' },
              { id: 'otro', label: '🐾 Otros' },
            ].map((sp) => (
              <button
                key={sp.id}
                onClick={() => setSpeciesFilter(sp.id)}
                className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                  speciesFilter === sp.id
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-primary/15 text-textMuted hover:text-text bg-surface/60'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>

          {/* Filtro de Estado del Dije */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-textMuted hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-auto text-xs font-bold bg-surface/80 text-text border border-primary/20 rounded-2xl px-3 py-2 outline-none focus:border-primary cursor-pointer transition"
            >
              <option value="all">Todos los estados</option>
              <option value="paired">🟢 Con Dije NFC Activo</option>
              <option value="unpaired">🟡 Sin Dije NFC (Pendiente)</option>
              <option value="lost">🚨 ¡Alerta de Extravío (SOS)!</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Grilla de Mascotas con los 4 Estados UI */}
      {error ? (
        <ErrorAlert message={error} onRetry={refresh} />
      ) : loading ? (
        <LoadingSkeleton />
      ) : pets.length === 0 ? (
        <EmptyState
          isFiltering={allPetsCount > 0}
          onClearFilters={() => {
            setSearchTerm('');
            setSpeciesFilter('all');
            setStatusFilter('all');
          }}
          onAddNewPet={() => setCreateOpen(true)}
          onRestoreDemo={resetToSeeds}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-textMuted font-bold px-1">
            <span>
              Mostrando <strong className="text-text">{pets.length}</strong> de{' '}
              <strong className="text-text">{allPetsCount}</strong> pacientes
            </span>
            <button
              onClick={() => setCreateOpen(true)}
              className="text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo registro
            </button>
          </div>

          {/* Grilla de Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onEdit={handleEdit}
                onDelete={deletePet}
                onToggleLost={toggleLost}
                onPairTag={(p) => setPairingPet(p)}
                onUnpairTag={unpairTag}
                onPreviewNfc={onPreviewNfc}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modales */}
      <PetModal
        isOpen={isCreateOpen}
        onClose={handleCloseModal}
        onSave={handleSavePet}
        editingPet={editingPet}
      />

      <NfcPairingModal
        isOpen={!!pairingPet}
        onClose={() => setPairingPet(null)}
        pet={pairingPet}
        onConfirmPair={async (petId, tagCode, filamentColor) => {
          await pairTag(petId, tagCode, filamentColor);
          showToast('Dije Vinculado', `Dije ${tagCode} (${filamentColor}) asignado exitosamente.`, 'success');
        }}
      />
    </div>
  );
}

export default DashboardPage;

