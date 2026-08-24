import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { BotIcon, CloseIcon, SparklesIcon, FileTextIcon, ShieldCheckIcon, CheckCircleIcon } from './Icons';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialQuery?: string;
  onOpenUpload: () => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  initialQuery,
  onOpenUpload
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text:
        lang === Language.ES
          ? '¡Hola! Soy **SATI Copilot**, tu asistente especializado en el Sistema de Alerta Temprana y regulación docente KHDA en Dubái. ¿En qué puedo ayudarte hoy?'
          : lang === Language.AR
          ? 'مرحباً! أنا مساعد SATI الذكي المخصص لامتثال هيئة المعرفة والتنمية البشرية في دبي. كيف يمكنني مساعدتك اليوم؟'
          : 'Hello! I am **SATI Copilot**, your intelligent assistant for KHDA compliance & early warning alerts in Dubai. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendUserQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleSendUserQuery = (queryText: string) => {
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      let responseText = '';
      const lower = queryText.toLowerCase();

      if (lower.includes('khda') || lower.includes('auditoría') || lower.includes('audit')) {
        responseText =
          lang === Language.ES
            ? '📊 **Resumen Auditoría KHDA:** La tasa de cumplimiento de los 37 campus es del **96.4%**. Hay 3 contratos docentes pendientes de renovación dentro de los próximos 30 días en Campus 01 (Dubai Marina) y Campus 03 (Jumeirah). Te sugiero enviar la notificación formal de renovación hoy.'
            : lang === Language.AR
            ? '📊 **ملخص تدقيق KHDA:** نسبة الإلتزام في المجمعات الـ 37 هي **96.4%**. هناك 3 عقود تحتاج إلى تجديد خلال 30 يوماً.'
            : '📊 **KHDA Audit Summary:** Compliance readiness is at **96.4%** across all 37 campuses. 3 teaching permits in Campus 01 (Dubai Marina) require renewal within 30 days.';
      } else if (lower.includes('visa') || lower.includes('vencer') || lower.includes('expir')) {
        responseText =
          lang === Language.ES
            ? '🚨 **Alerta de Visados:** Se detectaron 2 visados con menos de 30 días de vigencia (Elena Rostova - Permiso de Trabajo, Tariq Al-Mansoor - Aptitud Médica). De acuerdo con la regla automática, se ha enviado una notificación por Email y SMS a Recursos Humanos.'
            : lang === Language.AR
            ? '🚨 **تنبيه التأشيرات:** تم اكتشاف تأشيرتين متبقي لهما أقل من 30 يوماً. تم إرسال إشعارات تلقائية عبر البريد والـ SMS.'
            : '🚨 **Visa Alert:** 2 documents are expiring in less than 30 days (Work Permit & Medical Fitness). Automatic alerts have been queued for HR.';
      } else {
        responseText =
          lang === Language.ES
            ? `🤖 **Análisis SATI AI:** He procesado tu consulta: "${queryText}". Los sistemas de alerta temprana están sincronizados con la base de datos de los 37 campus de Dubái. Todo el personal docente cumple con los estándares vigentes.`
            : lang === Language.AR
            ? `🤖 **تحليل SATI الذكي:** تم تحليل استفسارك. جميع الأنظمة محدثة وتغطي كافة مجمعات دبي.`
            : `🤖 **SATI AI Analysis:** Processed query: "${queryText}". Early warning indicators show zero active fines and full audit readiness across all 37 Dubai Campuses.`;
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleSendUserQuery(inputText);
      setInputText('');
    }
  };

  if (!isOpen) return null;

  const isRtl = lang === Language.AR;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm transition-opacity">
      <div className={`fixed inset-y-0 ${isRtl ? 'left-0' : 'right-0'} max-w-full flex pl-10 rtl:pr-10 rtl:pl-0`}>
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l dark:border-slate-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <BotIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                  SATI Copilot AI
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === Language.ES ? 'Asistente de Cumplimiento KHDA' : 'KHDA Compliance Assistant'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Bar */}
          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/30 flex items-center gap-2 overflow-x-auto text-xs">
            <button
              onClick={onOpenUpload}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-medium flex items-center gap-1 flex-shrink-0 shadow-sm"
            >
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>{lang === Language.ES ? 'Escanear Documento' : 'Scan Document'}</span>
            </button>
            <button
              onClick={() => handleSendUserQuery('Generar informe de auditoría KHDA')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium flex items-center gap-1 flex-shrink-0 hover:border-indigo-400"
            >
              <ShieldCheckIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span>{lang === Language.ES ? 'Reporte KHDA' : 'KHDA Report'}</span>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed font-normal">{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-2 text-indigo-500 text-xs font-semibold p-2">
                <BotIcon className="w-4 h-4 animate-spin" />
                <span>{lang === Language.ES ? 'SATI AI procesando...' : 'SATI AI typing...'}</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleFormSubmit} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={lang === Language.ES ? 'Escribe una pregunta a SATI...' : 'Type a query...'}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm"
              >
                {lang === Language.ES ? 'Enviar' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
