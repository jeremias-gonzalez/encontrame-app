import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Plus, ExternalLink, Unlink, Sparkles, AlertCircle } from 'lucide-react';
import { usePets } from '../hooks/usePets';
import { useToast } from '../context/ToastContext';
import { NfcPairingModal } from '../components/Dashboard/NfcPairingModal';

export function TagsPage({ onPreviewNfc }) {
  const { pets, metrics, unpairTag, pairTag } = usePets();
  const { showToast } = useToast();
  const [pairingPet, setPairingPet] = useState(null);

  const pairedPets = pets.filter((p) => !!p.nfcTag || !!p.tag_id);
  const unpairedPets = pets.filter((p) => !p.nfcTag && !p.tag_id);

  const handleUnpair = async (petId, name) => {
    await unpairTag(petId);
    showToast('Dije Desvinculado', `Se liberó el chip NFC asignado a ${name}.`, 'info');
  };

  const handleConfirmPair = async (petId, tagCode, filamentColor) => {
    await pairTag(petId, tagCode, filamentColor);
    showToast('Dije Vinculado', `Dije ${tagCode} (${filamentColor}) asignado exitosamente.`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
        
          <h2 className="text-3xl font-black text-[#92553A] dark:text-[#E3B48F] tracking-tight">
            Gestión de Dijes 3D NFC
          </h2>
          <p className="text-xs text-textMuted mt-0.5">
            Inventario, estado de chips en collar y vinculación de dijes impresos en 3D.
          </p>
        </div>

        {unpairedPets.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPairingPet(unpairedPets[0])}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#8D4925] hover:bg-[#5E2F17] dark:bg-[#E3B48F] dark:hover:bg-[#F3E6CF] text-[#FBF7F1] dark:text-[#1E130C] text-xs font-bold shadow-md shadow-[#8D4925]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Vincular Dije a {unpairedPets[0].nombre || unpairedPets[0].name}
          </motion.button>
        )}
      </div>

      {/* KPI Cards de Dijes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-3xl p-5">
          <p className="text-xs font-bold text-textMuted">Dijes Activos</p>
          <h4 className="text-3xl font-black text-primary mt-1">{metrics.activeNfcTags}</h4>
          <p className="text-[11px] text-textMuted mt-1">En mascotas registradas</p>
        </div>

        <div className="glass-card rounded-3xl p-5">
          <p className="text-xs font-bold text-textMuted">Pacientes Sin Dije</p>
          <h4 className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {unpairedPets.length}
          </h4>
          <p className="text-[11px] text-textMuted mt-1">Listos para adquirir un dije</p>
        </div>

        <div className="glass-card rounded-3xl p-5">
          <p className="text-xs font-bold text-textMuted">Escaneos Registrados</p>
          <h4 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.totalScans}
          </h4>
          <p className="text-[11px] text-textMuted mt-1">Interacciones de rescate</p>
        </div>
      </div>

      {/* Lista de Dijes Asignados */}
      <div className="glass-panel rounded-3xl p-6 space-y-4">
        <h3 className="text-base font-black text-text flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#2A8C82]" />
          Dijes NFC en Funcionamiento ({pairedPets.length})
        </h3>

        {pairedPets.length === 0 ? (
          <p className="text-xs text-textMuted py-4">No hay dijes NFC vinculados actualmente.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pairedPets.map((pet) => {
              const petName = pet.nombre || pet.name;
              return (
                <div
                  key={pet.id}
                  className="glass-card rounded-2xl p-4 flex items-center justify-between gap-3 border border-primary/10"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={pet.photoUrl || pet.foto_url}
                      alt={petName}
                      className="w-12 h-12 rounded-xl object-cover border border-primary/15 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-primary">
                          {pet.nfcTag?.tagCode || `TAG #${pet.tag_id}`}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface/80 border border-primary/10">
                          {pet.nfcTag?.filamentColor || 'Azul Cobalto'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-text truncate mt-0.5">
                        {petName} ({pet.breed || pet.raza})
                      </p>
                      <p className="text-[11px] text-textMuted truncate">
                        Tutor: {pet.guardian?.name || pet.usuario?.nombre || 'Tutor'} • {pet.nfcTag?.scanCount || 0} lecturas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onPreviewNfc(pet)}
                      className="p-2 rounded-xl bg-surface hover:bg-surface/80 text-primary border border-primary/15 transition shadow-sm cursor-pointer"
                      title="Simular escaneo de rescate"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleUnpair(pet.id, petName)}
                      className="p-2 rounded-xl hover:bg-rose-500/10 text-textMuted hover:text-rose-600 transition cursor-pointer"
                      title="Desvincular dije"
                    >
                      <Unlink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pacientes Pendientes de Dije */}
      {unpairedPets.length > 0 && (
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-black text-text flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Pacientes sin Dije NFC ({unpairedPets.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unpairedPets.map((pet) => {
              const petName = pet.nombre || pet.name;
              return (
                <div
                  key={pet.id}
                  className="glass-card rounded-2xl p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-text truncate">{petName}</h4>
                    <p className="text-[11px] text-textMuted truncate">
                      {pet.breed || pet.raza} • {pet.guardian?.name || pet.usuario?.nombre || 'Tutor'}
                    </p>
                  </div>
                  <button
                    onClick={() => setPairingPet(pet)}
                    className="px-3 py-1.5 rounded-xl bg-primary text-white text-[11px] font-bold hover:opacity-90 transition shadow-sm shrink-0 cursor-pointer"
                  >
                    Vincular
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <NfcPairingModal
        isOpen={!!pairingPet}
        onClose={() => setPairingPet(null)}
        pet={pairingPet}
        onConfirmPair={handleConfirmPair}
      />
    </div>
  );
}

export default TagsPage;

