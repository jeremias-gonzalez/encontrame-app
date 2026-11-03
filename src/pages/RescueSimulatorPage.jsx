import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Sparkles } from 'lucide-react';
import { usePets } from '../hooks/usePets';
import { PublicRescueView } from '../components/PublicRescue/PublicRescueView';

export function RescueSimulatorPage({
  selectedPet,
  onSelectPet,
}) {
  const { pets } = usePets();
  const [isSimulatingTap, setIsSimulatingTap] = useState(false);

  const activePet = selectedPet || pets.find((p) => p.isLost) || pets[0];

  const handleSimulateTap = () => {
    setIsSimulatingTap(true);
    setTimeout(() => {
      setIsSimulatingTap(false);
    }, 700);
  };

  if (!activePet) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center text-textMuted text-xs">
        No hay mascotas registradas para simular el escaneo NFC.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header y Selector de Mascota */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Experiencia del Rescatista (Mobile-First)
          </div>
          <h2 className="text-3xl font-black text-[#92553A] dark:text-[#E3B48F] tracking-tight">
            Simulador de Escaneo NFC
          </h2>
          <p className="text-xs text-textMuted mt-0.5">
            Vista exacta que se abre en cualquier smartphone al aproximarlo al dije 3D.
          </p>
        </div>

        {/* Selector de Mascota para la demo */}
        <div className="flex items-center gap-2 bg-[#F1E8DC]/80 dark:bg-[#2A1B11]/80 p-1.5 rounded-2xl border border-primary/15">
          <span className="text-xs font-bold text-textMuted pl-2">Probar con:</span>
          <select
            value={activePet.id}
            onChange={(e) => {
              const found = pets.find((p) => String(p.id) === String(e.target.value));
              if (found) onSelectPet(found);
            }}
            className="text-xs font-bold bg-surface text-text px-3 py-1.5 rounded-xl border border-primary/20 outline-none cursor-pointer"
          >
            {pets.map((p) => {
              const name = p.nombre || p.name;
              return (
                <option key={p.id} value={p.id}>
                  {name} {p.isLost ? '🚨 (Perdido)' : (p.nfcTag || p.tag_id) ? '🟢 (Con Dije)' : '⚪ (Sin Dije)'}
                </option>
              );
            })}
          </select>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSimulateTap}
            className="px-3 py-1.5 rounded-xl bg-[#8D4925] hover:bg-[#5E2F17] dark:bg-[#E3B48F] dark:hover:bg-[#F3E6CF] text-[#FBF7F1] dark:text-[#1E130C] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Radio className={`w-3.5 h-3.5 ${isSimulatingTap ? 'animate-ping' : ''}`} />
            <span>Simular Toque</span>
          </motion.button>
        </div>
      </div>

      {/* Frame de Teléfono Centrado */}
      <div className="flex justify-center py-2">
        <motion.div
          animate={isSimulatingTap ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md shadow-2xl rounded-3xl overflow-hidden border border-primary/20"
        >
          <PublicRescueView pet={activePet} />
        </motion.div>
      </div>
    </div>
  );
}

export default RescueSimulatorPage;

