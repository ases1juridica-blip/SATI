import React, { useState } from 'react';
import { Language } from '../types';
import { 
  MenuIcon, 
  SearchIcon, 
  BellIcon, 
  SunIcon, 
  MoonIcon, 
  SparklesIcon, 
  ShieldCheckIcon,
  ChevronDownIcon
} from './Icons';

interface HeaderProps {
  title: string;
  lang: Language;
  setLang: (lang: Language) => void;
  selectedCampus: string;
  setSelectedCampus: (campus: string) => void;
  campuses: string[];
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onToggleSidebar: () => void;
  onOpenUpload: () => void;
  onToggleAIDrawer: () => void;
  criticalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  lang,
  setLang,
  selectedCampus,
  setSelectedCampus,
  campuses,
  isDarkMode,
  setIsDarkMode,
  onToggleSidebar,
  onOpenUpload,
  onToggleAIDrawer,
  criticalCount
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const isRtl = lang === Language.AR;

  const LanguageButton: React.FC<{ targetLang: Language; label: string }> = ({ targetLang, label }) => {
    const isActive = lang === targetLang;
    return (
      <button
        onClick={() => setLang(targetLang)}
        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
          isActive
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-50 h-16 glass-panel dark:bg-slate-900/90 dark:border-slate-800 border-slate-200 px-4 transition-colors flex items-center justify-between gap-4">
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Left Side: Sidebar Toggle & Search */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Menu"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          <img 
            src="assets/cropped-jgrouptech-logo.png" 
            alt="JGroupTech Logo" 
            className="h-8 w-auto object-contain md:hidden"
          />

          {/* Quick Search */}
          <div className="relative hidden md:block w-64 lg:w-80">
            <SearchIcon className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={lang === Language.ES ? '⌘K Buscar docentes, documentos...' : '⌘K Quick search...'}
              onClick={onToggleAIDrawer}
              readOnly
              className="w-full pl-9 rtl:pr-9 rtl:pl-3 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
          {/* Campus Selector */}
          <div className="relative hidden sm:block">
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-1.5 pr-8 rtl:pl-8 rtl:pr-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              {campuses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="w-4 h-4 absolute right-2.5 rtl:left-2.5 rtl:right-auto top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* AI Upload Quick Action */}
          <button
            onClick={onOpenUpload}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-transform transform hover:scale-105"
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>{lang === Language.ES ? 'Escanear IA' : 'AI Scan'}</span>
          </button>

          {/* Notifications Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <BellIcon className="w-5 h-5" />
              {criticalCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-bounce">
                  {criticalCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    {lang === Language.ES ? 'Alertas Tempranas KHDA' : 'Early Warning Alerts'}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                    {criticalCount} Activas
                  </span>
                </div>
                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs">
                    <p className="font-bold text-rose-800 dark:text-rose-300">Elena Rostova (Permiso de Trabajo)</p>
                    <p className="text-rose-600 dark:text-rose-400 text-[11px]">Vence en 5 días • Campus 03 Jumeirah</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs">
                    <p className="font-bold text-amber-800 dark:text-amber-300">Tariq Al-Mansoor (Salud Médica)</p>
                    <p className="text-amber-600 dark:text-amber-400 text-[11px]">Vence en 6 días • Campus 02 Al Barsha</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5 text-slate-700" />}
          </button>

          {/* Language Selector */}
          <div className="flex items-center space-x-1 rtl:space-x-reverse bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <LanguageButton targetLang={Language.EN} label="EN" />
            <LanguageButton targetLang={Language.ES} label="ES" />
            <LanguageButton targetLang={Language.AR} label="العربية" />
          </div>
        </div>
      </div>
    </header>
  );
};
