import React, { useState } from 'react';
import { Language } from '../types';
import { SparklesIcon, SearchIcon, BotIcon, AlertTriangleIcon, UploadIcon, ShieldCheckIcon } from './Icons';

interface AIPromptHeroProps {
  lang: Language;
  onOpenUpload: () => void;
  onSelectTab: (tab: string) => void;
  onToggleAIDrawer: (initialQuery?: string) => void;
  criticalAlertCount: number;
}

export const AIPromptHero: React.FC<AIPromptHeroProps> = ({
  lang,
  onOpenUpload,
  onSelectTab,
  onToggleAIDrawer,
  criticalAlertCount
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onToggleAIDrawer(query);
      setQuery('');
    }
  };

  const handleQuickChip = (text: string) => {
    onToggleAIDrawer(text);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 p-6 md:p-8 text-white shadow-2xl border border-indigo-500/30 mb-8">
      {/* Background Decorative Neon Orbs */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl">
        {/* Top Tagline */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-4 backdrop-blur-md">
          <SparklesIcon className="w-4 h-4 text-indigo-400" />
          <span>
            {lang === Language.ES
              ? 'SATI AI • Sistema de Alerta Temprana 24/7'
              : lang === Language.AR
              ? 'SATI AI • نظام الإنذار المبكر على مدار الساعة'
              : 'SATI AI • 24/7 Early Warning Hub'}
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          {lang === Language.ES ? (
            <>
              Monitoreo Inteligente de <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Cumplimiento KHDA & Visados</span>
            </>
          ) : lang === Language.AR ? (
            <>
              المراقبة الذكية لامتثال <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">تأشيرات وتصاريح KHDA</span>
            </>
          ) : (
            <>
              Intelligent Monitoring for <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">KHDA Permits & Visas</span>
            </>
          )}
        </h1>

        <p className="text-slate-300 text-sm md:text-base mb-6 max-w-2xl font-normal leading-relaxed">
          {lang === Language.ES
            ? 'Supervisa la vigencia de documentos, contratos docentes y matrículas en los 37 campus de Dubái con extracción instantánea de OCR por IA Gemini.'
            : lang === Language.AR
            ? 'مراقبة صلاحية التأشيرات والعقود في مجمعات دبي الـ 37 مع استخراج فوري بواسطة الذكاء الاصطناعي Gemini.'
            : 'Track expiration dates, teaching permits, and staff records across Dubai 37 Campuses with instant Gemini AI document OCR.'}
        </p>

        {/* AI Prompt Input Bar */}
        <form onSubmit={handleSubmit} className="relative mb-4">
          <div className="relative flex items-center glass-panel bg-white/10 dark:bg-slate-900/60 border border-white/20 dark:border-indigo-500/30 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-transparent transition-all shadow-inner">
            <div className="pl-3.5 rtl:pr-3.5 rtl:pl-0 text-indigo-400">
              <BotIcon className="w-6 h-6 animate-pulse" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                lang === Language.ES
                  ? 'Pregúntale a SATI Copilot (ej. "¿Cuáles docentes tienen visa por vencer en 30 días?")...'
                  : lang === Language.AR
                  ? 'اسأل SATI Copilot (مثال: "ما هي التأشيرات التي تنتهي خلال 30 يوماً؟")...'
                  : 'Ask SATI Copilot (e.g. "Which teachers have KHDA permits expiring soon?")...'
              }
              className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-slate-400 focus:outline-none font-medium"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 flex-shrink-0"
            >
              <SearchIcon className="w-4 h-4" />
              <span className="hidden sm:inline">
                {lang === Language.ES ? 'Consultar IA' : lang === Language.AR ? 'بحث بالذكاء الاصطناعي' : 'Ask AI'}
              </span>
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="text-slate-400 font-semibold">
            {lang === Language.ES ? 'Acciones Rápidas:' : lang === Language.AR ? 'إجراءات سريعة:' : 'Quick Shortcuts:'}
          </span>

          <button
            type="button"
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all hover:scale-105"
          >
            <UploadIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === Language.ES ? 'Subir Documento' : lang === Language.AR ? 'تحميل وثيقة' : 'Upload Document'}</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('alerts')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 transition-all hover:scale-105"
          >
            <AlertTriangleIcon className="w-3.5 h-3.5 text-rose-400" />
            <span>
              {lang === Language.ES
                ? `${criticalAlertCount} Alertas Críticas`
                : lang === Language.AR
                ? `${criticalAlertCount} تنبيهات حرجة`
                : `${criticalAlertCount} Critical Alerts`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickChip('Auditoría KHDA y Estado de Cumplimiento')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 transition-all hover:scale-105"
          >
            <ShieldCheckIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lang === Language.ES ? 'Auditoría KHDA (96.4%)' : lang === Language.AR ? 'تدقيق KHDA' : 'KHDA Audit (96.4%)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
