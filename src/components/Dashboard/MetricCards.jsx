import React from 'react';
import { motion } from 'framer-motion';
import { PawPrint, Radio, AlertOctagon, Sparkles, ScanLine } from 'lucide-react';

export function MetricCards({ metrics }) {
  const safeMetrics = metrics || {
    totalPets: 0,
    activeNfcTags: 0,
    lostPetsCount: 0,
    totalScans: 0,
  };

  const cards = [
    {
      title: 'Mascotas en Base',
      value: safeMetrics.totalPets,
      desc: 'Pacientes registrados',
      icon: PawPrint,
      badge: 'Total',
      gradient: 'from-[#8D4925]/15 to-[#92553A]/10',
      iconColor: 'text-[#8D4925] dark:text-[#E3B48F]',
    },
    {
      title: 'Dijes 3D Activos',
      value: safeMetrics.activeNfcTags,
      desc: `${Math.round((safeMetrics.activeNfcTags / (safeMetrics.totalPets || 1)) * 100)}% protegidos`,
      icon: Radio,
      badge: 'En collar',
      gradient: 'from-[#2A8C82]/20 to-[#2A8C82]/5',
      iconColor: 'text-[#2A8C82]',
    },
    {
      title: 'Alertas SOS Activas',
      value: safeMetrics.lostPetsCount,
      desc: safeMetrics.lostPetsCount > 0 ? '¡Reporte de extravío!' : 'Mascotas a salvo',
      icon: AlertOctagon,
      badge: safeMetrics.lostPetsCount > 0 ? 'Urgente' : 'Normal',
      gradient: safeMetrics.lostPetsCount > 0
        ? 'from-rose-500/20 to-rose-500/10'
        : 'from-[#F1E8DC]/80 to-transparent',
      iconColor: safeMetrics.lostPetsCount > 0
        ? 'text-rose-600 dark:text-rose-400 animate-pulse'
        : 'text-textMuted',
    },
    {
      title: 'Lecturas NFC',
      value: safeMetrics.totalScans,
      desc: 'Escaneos de rescate',
      icon: ScanLine,
      badge: 'Historial',
      gradient: 'from-[#92553A]/15 to-[#8D4925]/5',
      iconColor: 'text-[#92553A] dark:text-[#E3B48F]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 24,
              delay: idx * 0.05,
            }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="glass-card rounded-3xl p-5 relative overflow-hidden group select-none"
          >
            {/* Ambient subtle glow */}
            <div
              className={`absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-br ${card.gradient} blur-2xl pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity`}
            />

            <div className="flex justify-between items-start mb-3 relative z-10">
              <div className="p-3 rounded-2xl bg-surface/80 dark:bg-surface/50 shadow-sm border border-primary/10">
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-surface/70 dark:bg-surface/40 text-textMuted border border-primary/10">
                {card.badge}
              </span>
            </div>

            <div className="relative z-10">
              <p className="text-xs font-semibold text-textMuted">{card.title}</p>
              <h4 className="text-3xl font-black tracking-tight text-text mt-1">
                {card.value}
              </h4>
              <p className="text-[11px] text-textMuted mt-1 flex items-center gap-1 font-medium">
                {card.desc.includes('%') && <Sparkles className="w-3 h-3 text-[#2A8C82]" />}
                {card.desc}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default MetricCards;

