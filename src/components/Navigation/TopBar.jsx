import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Menu,
  Radio,
  Plus,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from '../Common/BrandLogo';
import { useToast } from '../../context/ToastContext';

export function TopBar({
  onToggleMobileSidebar,
  onOpenCreatePet,
  pets = [],
  onSelectPetForRescue,
}) {
  const [quickCode, setQuickCode] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (!quickCode.trim()) return;

    const normalized = quickCode.trim().toUpperCase();
    const match = pets.find((p) => {
      const code = p.nfcTag?.tagCode || p.tag?.codigoQR || p.tag?.token_publico;
      return code && code.toUpperCase() === normalized;
    });

    if (match) {
      showToast('Dije NFC Detectado', `Cargando ficha de rescate para ${match.nombre || match.name}`, 'success');
      onSelectPetForRescue(match);
      navigate('/simulador');
      setQuickCode('');
    } else {
      showToast('Código no encontrado', `El dije ${normalized} no está registrado en el sistema.`, 'warning');
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 glass-panel border-b border-slate-300/40 dark:border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Botón Móvil y Breadcrumbs con Logo en pantallas táctiles */}
      

      {/* Escáner NFC Rápido estilo Spotlight / HeroUI con Turquesa Funcional */}
      <div className="flex items-center gap-3">
        <form onSubmit={handleQuickSearch} className="relative">
          <div className="flex items-center bg-[#F1E8DC]/80 dark:bg-[#2A1B11]/80 rounded-2xl border border-primary/20 p-1 pl-3 gap-2 focus-within:ring-2 focus-within:ring-[#2A8C82]/30 transition">
            <Radio className="w-4 h-4 text-[#2A8C82] shrink-0 animate-pulse" />
            <input
              type="text"
              value={quickCode}
              onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
              placeholder="Escanear Dije (ENC-7842-NFC)..."
              className="text-xs font-mono font-bold bg-transparent border-none outline-none text-text w-40 sm:w-56 placeholder:text-textMuted/70"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded-xl bg-[#8D4925] hover:bg-[#5E2F17] dark:bg-[#E3B48F] dark:hover:bg-[#F3E6CF] text-[#FBF7F1] dark:text-[#1E130C] text-[11px] font-bold transition-all cursor-pointer"
            >
              Leer
            </button>
          </div>
        </form>

        {/* Botón "+ Registrar" en header */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenCreatePet}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-[#8D4925] hover:bg-[#5E2F17] dark:bg-[#E3B48F] dark:hover:bg-[#F3E6CF] text-[#FBF7F1] dark:text-[#1E130C] text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Alta Paciente</span>
        </motion.button>
      </div>
    </header>
  );
}

export default TopBar;

