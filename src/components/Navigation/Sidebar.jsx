import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PawPrint,
  Radio,
  AlertTriangle,
  ScanLine,
  Globe,
  Plus,
  Sun,
  Moon,
  Building2,
  ChevronRight,
  RotateCcw,
  UserPlus,
} from 'lucide-react';
import { BrandLogo } from '../Common/BrandLogo';
import { useVeterinaria } from '../../context/VeterinariaContext';

export function Sidebar({
  metrics,
  onOpenCreatePet,
  onOpenPairTag,
  onOpenCreateUser,
  onOpenCreateVeterinaria,
  onResetDemo,
}) {
  const { currentVeterinaria } = useVeterinaria();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nfc-pets-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('nfc-pets-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const navItems = [
    {
      to: '/',
      label: 'Dashboard Clínico',
      icon: PawPrint,
      badge: metrics?.totalPets ? `${metrics.totalPets}` : undefined,
    },
    {
      to: '/dijes',
      label: 'Dijes 3D NFC',
      icon: Radio,
      badge: metrics?.activeNfcTags ? `${metrics.activeNfcTags}` : undefined,
    },
    {
      to: '/alertas',
      label: 'Alertas SOS',
      icon: AlertTriangle,
      badge: metrics?.lostPetsCount && metrics.lostPetsCount > 0 ? `${metrics.lostPetsCount}` : undefined,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
    },
 
 
  ];

  return (
    <aside className="w-72 h-screen sticky top-0 flex flex-col justify-between p-4 glass-panel border-r border-slate-300/40 dark:border-white/10 shrink-0 z-30 select-none">
      <div className="space-y-6">

        <div className="px-2 pt-1">
          <div className="flex items-center justify-between gap-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer py-0.5"
            >
              <BrandLogo className="h-7 w-auto" showBadge badgeLabel="NFC" />
            </motion.div>
          </div>
          <p className="text-[11px] font-medium text-textMuted mt-1 flex items-center gap-1.5 pl-0.5">
            {currentVeterinaria?.nombre || 'Veterinaria San Roque'} · Panel Clínico
          </p>
        </div>

        <div className="px-2 space-y-2">
          <motion.button
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenCreatePet}
            className="w-full py-2.5 px-3.5 rounded-2xl bg-[#8D4925] hover:bg-[#5E2F17] dark:bg-[#E3B48F] dark:hover:bg-[#F3E6CF] text-[#FBF7F1] dark:text-[#1E130C] text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#8D4925]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Mascota</span>
          </motion.button>

         

          <motion.button
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenPairTag}
            className="w-full py-2 px-3.5 rounded-2xl bg-[#F1E8DC]/90 hover:bg-[#F1E8DC] dark:bg-[#2A1B11]/90 dark:hover:bg-[#2A1B11] text-text border border-primary/20 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-[#2A8C82]" />
            <span>Vincular Dije Rápido</span>
          </motion.button>
        </div>

        {/* Router Navigation Links (Glassmorphism Navlinks) */}
        <nav className="space-y-1.5 px-1">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-textMuted mb-2">
            Navegación Principal
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#F1E8DC] dark:bg-[#2A1B11] text-primary shadow-sm border border-primary/25'
                      : 'text-textMuted hover:text-text hover:bg-[#F1E8DC]/50 dark:hover:bg-[#2A1B11]/50 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-xl transition-colors ${
                          isActive
                            ? 'bg-[#8D4925] dark:bg-[#E3B48F] text-[#F3E6CF] dark:text-[#1E130C]'
                            : 'bg-surface/50 text-textMuted group-hover:text-primary'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="tracking-tight">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            item.badgeColor ||
                            (isActive
                              ? 'bg-primary/15 text-primary'
                              : 'bg-surface/60 text-textMuted')
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight
                        className={`w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${
                          isActive ? 'opacity-100 translate-x-0 text-primary' : 'text-textMuted'
                        }`}
                      />
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer del Sidebar con Switcher de Tema y Perfil Clínico */}
      <div className="space-y-3 pt-4 border-t border-slate-300/30 dark:border-white/10 px-1">
        {/* Toggle Dark/Light Mode estilo macOS */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-[#F1E8DC]/70 dark:bg-[#2A1B11]/70 border border-primary/10">
          <div className="flex items-center gap-2 text-xs font-bold text-text">
            {theme === 'light' ? (
              <>
                <Sun className="w-4 h-4 text-amber-600" />
                <span>Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#E3B48F]" />
                <span>Modo Oscuro</span>
              </>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-1.5 rounded-xl bg-surface shadow-sm border border-primary/15 text-text hover:text-primary transition-colors cursor-pointer"
            title="Alternar Modo Claro / Oscuro"
          >
            {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </motion.button>
        </div>

        {/* Card Perfil de la Veterinaria */}
        <div className="p-2.5 rounded-2xl glass-card flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-text truncate">
                {currentVeterinaria?.nombre || 'San Roque Central'}
              </p>
              <p className="text-[10px] text-textMuted truncate">
                {currentVeterinaria?.telefono || 'Punto Oficial'}
              </p>
            </div>
          </div>

          <button
            onClick={onResetDemo}
            title="Restablecer datos de prueba en LocalStorage"
            className="p-1.5 rounded-lg text-textMuted hover:text-text hover:bg-surface/50 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

