import React, { useState, useEffect } from 'react';
import { PawPrint, Radio, Globe, Plus, RotateCcw } from 'lucide-react';
import { BrandLogo } from './Common/BrandLogo';

export function Navbar({
  activeView,
  onSelectView,
  onOpenCreatePet,
  onResetDemo,
}) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nfc-pets-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('nfc-pets-theme', theme);
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('nfc-pets-theme', newTheme);
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo Oficial Adaptativo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectView('dashboard')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <BrandLogo className="h-7 w-auto"  />
          </button>
        </div>

        {/* Selector de Vistas / Pestañas Principales */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => onSelectView('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeView === 'dashboard'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-textMuted hover:text-text'
            }`}
          >
            <PawPrint className="w-4 h-4" />
            Dashboard Clínico
          </button>

          <button
            onClick={() => onSelectView('rescue_preview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeView === 'rescue_preview'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-textMuted hover:text-text'
            }`}
          >
            <Radio className="w-4 h-4" />
            Simulador NFC Rescate
          </button>

          <button
            onClick={() => onSelectView('landing')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeView === 'landing'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-textMuted hover:text-text'
            }`}
          >
            <Globe className="w-4 h-4" />
            Landing Comercial
          </button>
        </nav>

        {/* Acciones Rápidas y Selector de Tema */}
        <div className="flex items-center gap-2.5">
          {/* Selector de Temas */}
          <select
            value={theme}
            onChange={(e) => changeTheme(e.target.value)}
            className="text-xs font-semibold bg-background text-text border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 outline-none focus:border-primary cursor-pointer transition shadow-sm"
            aria-label="Selector de Tema"
          >
            <option value="light">☀️ Claro</option>
            <option value="dark">🌙 Oscuro</option>
            <option value="nature">🌿 Naturaleza</option>
            <option value="ocean">🌊 Océano</option>
          </select>

          {/* Botón Restaurar Demo */}
          <button
            onClick={onResetDemo}
            title="Reiniciar datos semilla en LocalStorage"
            className="hidden sm:inline-flex items-center gap-1.5 p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-textMuted hover:text-text text-xs font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Botón Nuevo Paciente */}
          <button
            onClick={onOpenCreatePet}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#8D4925] hover:bg-[#5E2F17] dark:bg-[#E3B48F] dark:hover:bg-[#F3E6CF] text-[#FBF7F1] dark:text-[#1E130C] transition shadow-md shadow-[#8D4925]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Mascota</span>
          </button>
        </div>
      </div>

      {/* Navegación móvil para pantallas reducidas */}
      <div className="flex md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-2 gap-2 overflow-x-auto text-xs font-bold bg-surface">
        <button
          onClick={() => onSelectView('dashboard')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center whitespace-nowrap transition cursor-pointer ${
            activeView === 'dashboard'
              ? 'bg-primary text-white'
              : 'text-textMuted hover:text-text'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectView('rescue_preview')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center whitespace-nowrap transition cursor-pointer ${
            activeView === 'rescue_preview'
              ? 'bg-primary text-white'
              : 'text-textMuted hover:text-text'
          }`}
        >
          Simulador NFC
        </button>
        <button
          onClick={() => onSelectView('landing')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center whitespace-nowrap transition cursor-pointer ${
            activeView === 'landing'
              ? 'bg-primary text-white'
              : 'text-textMuted hover:text-text'
          }`}
        >
          Web Comercial
        </button>
      </div>
    </header>
  );
}

export default Navbar;

