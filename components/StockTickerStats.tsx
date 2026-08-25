import React from 'react';
import { Language } from '../types';
import { translations } from '../constants';
import { 
  ShieldCheckIcon, 
  UserGroupIcon, 
  AlertTriangleIcon, 
  SchoolIcon, 
  ActivityIcon,
  SparklesIcon,
  CheckCircleIcon
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

  const tickerItems = [
    {
      id: 'khda',
      icon: <ShieldCheckIcon className="w-4 h-4" />,
      iconColor: 'bg-indigo-500/20 text-indigo-400',
      label: 'KHDA',
      value: complianceScore,
      badge: '▲ 98.4%',
      badgeColor: 'text-emerald-400 bg-emerald-500/15',
      action: () => onAskAI?.('Auditoría de cumplimiento KHDA')
    },
    {
      id: 'staff',
      icon: <UserGroupIcon className="w-4 h-4" />,
      iconColor: 'bg-blue-500/20 text-blue-400',
      label: lang === Language.ES ? 'DOCENTES' : lang === Language.AR ? 'الكادر' : 'STAFF',
      value: totalEmployees.toLocaleString(),
      badge: '37 Campus',
      badgeColor: 'text-slate-300 bg-slate-700/60',
      action: () => onSelectTab?.('staff')
    },
    {
      id: 'risk',
      icon: <AlertTriangleIcon className="w-4 h-4" />,
      iconColor: 'bg-rose-500/20 text-rose-400',
      label: lang === Language.ES ? 'RIESGO <30D' : lang === Language.AR ? 'الخطر <30' : 'EXPIRING <30D',
      value: criticalCount,
      badge: 'AED $0 Fines',
      badgeColor: 'text-emerald-400 bg-emerald-500/15',
      isPulse: criticalCount > 0,
      action: () => onSelectTab?.('alerts')
    },
    {
      id: 'transfers',
      icon: <SchoolIcon className="w-4 h-4" />,
      iconColor: 'bg-emerald-500/20 text-emerald-400',
      label: lang === Language.ES ? 'TRASLADOS' : lang === Language.AR ? 'النقل' : 'TRANSFERS',
      value: activeTransfers,
      badge: '✓ Activo',
      badgeColor: 'text-emerald-400 bg-emerald-500/15',
      action: () => onAskAI?.('Módulo de traslados e ingresos rápidos de estudiantes')
    },
    {
      id: 'network',
      icon: <ActivityIcon className="w-4 h-4" />,
      iconColor: 'bg-purple-500/20 text-purple-400',
      label: lang === Language.ES ? 'RED 37 CAMPUS' : lang === Language.AR ? '37 مجمع' : '37 CAMPUSES',
      value: '100% OK',
      badge: 'Dubái EAU',
      badgeColor: 'text-indigo-300 bg-indigo-500/15',
      action: () => onSelectTab?.('campuses')
    },
    {
      id: 'ai-sync',
      icon: <SparklesIcon className="w-4 h-4 text-indigo-400" />,
      iconColor: 'bg-indigo-500/20 text-indigo-400',
      label: 'SATI COPILOT AI',
      value: '24/7 Live',
      badge: 'Gemini 2.5',
      badgeColor: 'text-indigo-400 bg-indigo-500/15',
      action: () => onAskAI?.('Generar diagnóstico preventivo de cumplimiento general')
    }
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 shadow-xl text-white mb-6 p-2 sm:p-2.5">
      {/* Background Subtle Glows */}
      <div className="absolute -left-10 -top-10 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-purple-500/15 rounded-full blur-2xl pointer-events-none"></div>

      {/* Left and Right Fade Gradients for Stock Ticker Tape Effect */}
      <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-16 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-16 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none"></div>

      {/* Outer container */}
      <div className="flex items-center overflow-hidden">
        {/* Fixed LIVE Indicator Badge on the Left */}
        <div className="flex-shrink-0 z-20 flex items-center gap-2 pl-2 pr-3 py-1 mr-2 rounded-xl bg-indigo-900/60 border border-indigo-400/30 text-indigo-300 font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider backdrop-blur-md shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="whitespace-nowrap">KHDA LIVE</span>
        </div>

        {/* Infinite Running Marquee Track */}
        <div className="overflow-hidden flex-1 relative">
          <div className="animate-ticker flex items-center gap-3">
            {/* Set 1 */}
            {tickerItems.map((item, idx) => (
              <div
                key={`t1-${item.id}-${idx}`}
                onClick={item.action}
                className="flex-shrink-0 flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 cursor-pointer transition-all hover:scale-105 group"
              >
                <div className={`p-1 rounded-lg ${item.iconColor}`}>
                  {item.icon}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-tight whitespace-nowrap">
                    {item.label}
                  </span>
                  <span className={`font-mono font-black text-xs sm:text-sm text-white group-hover:text-indigo-300 whitespace-nowrap ${item.isPulse ? 'text-rose-400 animate-pulse' : ''}`}>
                    {item.value}
                  </span>
                  <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.2 rounded whitespace-nowrap ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
              </div>
            ))}

            {/* Set 2 (Duplicate for Seamless Infinite Loop) */}
            {tickerItems.map((item, idx) => (
              <div
                key={`t2-${item.id}-${idx}`}
                onClick={item.action}
                className="flex-shrink-0 flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 cursor-pointer transition-all hover:scale-105 group"
              >
                <div className={`p-1 rounded-lg ${item.iconColor}`}>
                  {item.icon}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-tight whitespace-nowrap">
                    {item.label}
                  </span>
                  <span className={`font-mono font-black text-xs sm:text-sm text-white group-hover:text-indigo-300 whitespace-nowrap ${item.isPulse ? 'text-rose-400 animate-pulse' : ''}`}>
                    {item.value}
                  </span>
                  <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.2 rounded whitespace-nowrap ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
