import React from 'react';
import { Language } from '../types';
import { translations } from '../constants';
import { 
  ShieldCheckIcon, 
  UserGroupIcon, 
  AlertTriangleIcon, 
  SchoolIcon, 
  ActivityIcon,
  SparklesIcon
} from './Icons';

interface StockTickerStatsProps {
  lang: Language;
  criticalCount: number;
  totalEmployees: number;
  complianceScore?: string;
  activeTransfers?: number;
  onSelectTab?: (tab: string) => void;
  onAskAI?: (query: string) => void;
}

export const StockTickerStats: React.FC<StockTickerStatsProps> = ({
  lang,
  criticalCount,
  totalEmployees,
  complianceScore = '96.4%',
  activeTransfers = 142,
  onSelectTab,
  onAskAI
}) => {
  const t = translations[lang];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 shadow-lg text-white mb-6 p-2 sm:p-3">
      {/* Background Subtle Glow */}
      <div className="absolute -left-10 -top-10 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-purple-500/15 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1 px-1">
        {/* Live Indicator Pill */}
        <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-extrabold text-[11px] uppercase tracking-wider backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline">KHDA LIVE TICKER</span>
          <span className="sm:hidden">LIVE</span>
        </div>

        {/* Ticker 1: KHDA Compliance */}
        <div 
          onClick={() => onAskAI?.('Auditoría de cumplimiento KHDA')}
          className="flex-shrink-0 snap-start flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 cursor-pointer transition-all group"
        >
          <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
            <ShieldCheckIcon className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">KHDA</span>
            <span className="font-mono font-black text-xs text-white group-hover:text-indigo-300">{complianceScore}</span>
            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded flex items-center gap-0.5">
              ▲ 98.4%
            </span>
          </div>
        </div>

        {/* Ticker 2: Docentes & Staff */}
        <div 
          onClick={() => onSelectTab?.('staff')}
          className="flex-shrink-0 snap-start flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 cursor-pointer transition-all group"
        >
          <div className="p-1 rounded-lg bg-blue-500/20 text-blue-400">
            <UserGroupIcon className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
              {lang === Language.ES ? 'DOCENTES' : lang === Language.AR ? 'الكادر' : 'STAFF'}
            </span>
            <span className="font-mono font-black text-xs text-white group-hover:text-blue-300">{totalEmployees}</span>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-700/60 px-1.5 py-0.2 rounded">
              37 Campus
            </span>
          </div>
        </div>

        {/* Ticker 3: Riesgo <30d */}
        <div 
          onClick={() => onSelectTab?.('alerts')}
          className={`flex-shrink-0 snap-start flex items-center gap-2.5 px-3 py-1.5 rounded-xl border cursor-pointer transition-all group ${
            criticalCount > 0
              ? 'bg-rose-950/40 hover:bg-rose-950/60 border-rose-500/40 hover:border-rose-400 text-rose-200'
              : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-200'
          }`}
        >
          <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400">
            <AlertTriangleIcon className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-rose-300 uppercase tracking-tight">
              {lang === Language.ES ? 'RIESGO <30D' : lang === Language.AR ? 'الخطر <30' : 'EXPIRING <30D'}
            </span>
            <span className="font-mono font-black text-xs text-rose-400 animate-pulse">{criticalCount}</span>
            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded">
              AED $0
            </span>
          </div>
        </div>

        {/* Ticker 4: Traslados / Matrícula */}
        <div 
          onClick={() => onAskAI?.('Módulo de traslados e ingresos rápidos de estudiantes')}
          className="flex-shrink-0 snap-start flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 cursor-pointer transition-all group"
        >
          <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
            <SchoolIcon className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
              {lang === Language.ES ? 'TRASLADOS' : lang === Language.AR ? 'النقل' : 'TRANSFERS'}
            </span>
            <span className="font-mono font-black text-xs text-white group-hover:text-emerald-300">{activeTransfers}</span>
            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded">
              ✓ Activo
            </span>
          </div>
        </div>

        {/* Ticker 5: Red 37 Campus Dubái */}
        <div 
          onClick={() => onSelectTab?.('campuses')}
          className="flex-shrink-0 snap-start flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 cursor-pointer transition-all group"
        >
          <div className="p-1 rounded-lg bg-purple-500/20 text-purple-400">
            <ActivityIcon className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
              {lang === Language.ES ? 'RED' : lang === Language.AR ? 'المجمعات' : 'NETWORK'}
            </span>
            <span className="font-mono font-black text-xs text-white group-hover:text-purple-300">37 Campus</span>
            <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/15 px-1.5 py-0.2 rounded">
              Dubái EAU
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
