import React, { useState, useEffect } from 'react';
import { Language, ExtractedDocumentInfo } from '../types';
import { BotIcon, CloseIcon, SparklesIcon, FileTextIcon, ShieldCheckIcon, CheckCircleIcon } from './Icons';
import { askGeminiAssistant, checkGeminiConnection } from '../services/geminiService';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialQuery?: string;
  processedDoc?: ExtractedDocumentInfo | null;
  onOpenUpload: () => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

const renderMessageText = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const lineContent = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-indigo-400 dark:text-indigo-300">{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    return (
      <React.Fragment key={lineIdx}>
        {lineContent}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  initialQuery,
  processedDoc,
  onOpenUpload
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text:
        lang === Language.ES
          ? '¡Hola! Soy **SATI Copilot (Gemini Live AI)**, tu asistente especializado en el Sistema de Alerta Temprana y regulación docente KHDA en los 37 campus de Dubái. ¿En qué puedo ayudarte hoy?'
          : lang === Language.AR
          ? 'مرحباً! أنا مساعد SATI الذكي المباشر (Gemini AI Live). كيف يمكنني مساعدتك اليوم؟'
          : 'Hello! I am **SATI Copilot (Gemini Live AI)**, your intelligent assistant for KHDA compliance & early warning alerts in Dubai. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    checkGeminiConnection().then((connected) => {
      setIsConnected(connected);
    });
  }, []);

  useEffect(() => {
    if (processedDoc) {
      handleDocumentProcessedMessage(processedDoc);
    } else if (initialQuery && initialQuery.trim()) {
      handleSendUserQuery(initialQuery);
    }
  }, [initialQuery, processedDoc]);

  const handleDocumentProcessedMessage = async (doc: ExtractedDocumentInfo) => {
    const docPrompt = lang === Language.ES
      ? `📄 **Nuevo documento digitalizado:**\n• **Nombre:** ${doc.employeeName}\n• **Documento:** ${doc.documentType}\n• **Fecha Expiración:** ${doc.expiryDate}${doc.campus ? `\n• **Campus:** ${doc.campus}` : ''}\n\nPor favor analiza la validez del documento, su impacto en la auditoría KHDA y dime si requiere activar una alerta de renovación en SATI.`
      : `📄 **New document processed:**\n• **Name:** ${doc.employeeName}\n• **Type:** ${doc.documentType}\n• **Expiry:** ${doc.expiryDate}\n\nPlease analyze its KHDA compliance readiness and alert requirements.`;

    const userMsg: Message = {
      id: `msg-doc-${Date.now()}`,
      sender: 'user',
      text: docPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const historyForAi = messages.map(m => ({
      role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
      text: m.text
    }));

    const aiResponseText = await askGeminiAssistant(docPrompt, historyForAi, lang);

    const aiMsg: Message = {
      id: `ai-doc-${Date.now()}`,
      sender: 'ai',
      text: aiResponseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleSendUserQuery = async (queryText: string) => {
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const historyForAi = messages.map(m => ({
      role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
      text: m.text
    }));

    const aiResponseText = await askGeminiAssistant(queryText, historyForAi, lang);

    const aiMsg: Message = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: aiResponseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
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
                  {isConnected === true ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      Gemini Live
                    </span>
                  ) : isConnected === false ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      Offline
                    </span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === Language.ES ? 'Conectado con Gemini Live API' : 'Connected with Gemini Live API'}
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
              className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-medium flex items-center gap-1 flex-shrink-0 shadow-sm hover:bg-indigo-700 transition-all"
            >
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>{lang === Language.ES ? 'Escanear Documento' : 'Scan Document'}</span>
            </button>
            <button
              onClick={() => handleSendUserQuery('Generar informe de auditoría KHDA')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium flex items-center gap-1 flex-shrink-0 hover:border-indigo-400 transition-all"
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
                  className={`max-w-[88%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md font-medium'
                      : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div>{renderMessageText(msg.text)}</div>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-2 text-indigo-500 text-xs font-semibold p-2">
                <BotIcon className="w-4 h-4 animate-spin" />
                <span>{lang === Language.ES ? 'Gemini Live AI consultando...' : 'Gemini Live AI processing...'}</span>
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
                placeholder={lang === Language.ES ? 'Escribe una pregunta a Gemini AI...' : 'Ask Gemini AI live...'}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isTyping}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-sm"
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

