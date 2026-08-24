import React from 'react';
import { Language } from '../types';
import { CloseIcon, FileTextIcon, ShieldCheckIcon, AlertTriangleIcon, SparklesIcon, BotIcon, CalendarIcon, SchoolIcon } from './Icons';

export interface DocumentDetailData {
  employeeName: string;
  campus: string;
  role?: string;
  documentType: string;
  expiryDate: string;
  daysLeft: number;
}

interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  docDetail: DocumentDetailData | null;
  lang: Language;
  onAskAI: (query: string) => void;
  onOpenUpload: () => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  isOpen,
  onClose,
  docDetail,
  lang,
  onAskAI,
  onOpenUpload,
}) => {
  if (!isOpen || !docDetail) return null;

  const isRtl = lang === Language.AR;
  const isCritical = docDetail.daysLeft <= 30;
  const isExpired = docDetail.daysLeft < 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all transform animate-in fade-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className={`p-6 ${
          isExpired
            ? 'bg-gradient-to-r from-rose-600 to-red-700 text-white'
            : isCritical
            ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                <FileTextIcon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                  {lang === Language.ES ? 'Expediente KHDA & Cumplimiento' : 'KHDA Compliance Record'}
                </span>
                <h3 className="text-xl font-extrabold">{docDetail.documentType}</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/10 hover:bg-black/20 text-white transition-colors"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Employee & Campus Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse overflow-hidden">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm shadow">
                {docDetail.employeeName.charAt(0)}
              </div>
              <div className="truncate">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {docDetail.employeeName}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <SchoolIcon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{docDetail.campus}</span>
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
              {docDetail.role || 'Docente KHDA'}
            </span>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                Fecha de Vencimiento
              </span>
              <p className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                {docDetail.expiryDate}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <AlertTriangleIcon className="w-3.5 h-3.5" />
                Estado de Riesgo
              </span>
              <p className={`font-bold text-xs ${
                isExpired
                  ? 'text-rose-500'
                  : isCritical
                  ? 'text-amber-500'
                  : 'text-emerald-500'
              }`}>
                {isExpired
                  ? 'Vencido (Riesgo Multa KHDA)'
                  : isCritical
                  ? `Vence en ${docDetail.daysLeft} días (Atención)`
                  : `Vigente (${docDetail.daysLeft} días restantes)`}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-1">
              <span className="text-slate-400 font-semibold">Ref / Expediente No.</span>
              <p className="font-mono font-bold text-slate-700 dark:text-slate-300">
                KHDA-UAE-{Math.floor(100000 + Math.random() * 900000)}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-1">
              <span className="text-slate-400 font-semibold">Validación Normativa</span>
              <p className="font-bold text-emerald-500 flex items-center gap-1">
                <ShieldCheckIcon className="w-4 h-4" />
                Verificado SATI
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                onClose();
                onOpenUpload();
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>Cargar Nueva Versión o Escanear OCR</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onAskAI(`Analizar expediente de ${docDetail.employeeName} para el documento ${docDetail.documentType} con fecha de vencimiento ${docDetail.expiryDate}`);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <BotIcon className="w-4 h-4 text-indigo-500" />
              <span>Consultar con Copilot IA en el Cajón</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
