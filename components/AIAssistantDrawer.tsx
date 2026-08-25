import React, { useState, useEffect, useRef } from 'react';
import { Language, ExtractedDocumentInfo } from '../types';
import { translations } from '../constants';
import { BotIcon, CloseIcon, SparklesIcon, FileTextIcon, ShieldCheckIcon, CheckCircleIcon, SettingsIcon } from './Icons';
import { askGeminiAssistant, checkGeminiConnection, getStoredApiKey, saveCustomApiKey, removeCustomApiKey } from '../services/geminiService';
import { GeminiLiveWebSocket, ConnectionStatus } from '../services/geminiLiveWebSocket';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialQuery?: string;
  processedDoc?: ExtractedDocumentInfo | null;
  onOpenUpload: () => void;
  systemContext?: string;
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
  onOpenUpload,
  systemContext
}) => {
  const t = translations[lang];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text:
        lang === Language.ES
          ? '¡Hola! Soy **SATI Copilot (Gemini AI & RAG Context)**, tu asistente especializado en el Sistema de Alerta Temprana y regulación docente KHDA en los 37 campus de Dubái. ¿En qué puedo ayudarte hoy?'
          : lang === Language.AR
          ? 'مرحباً! أنا مساعد SATI الذكي (Gemini AI & RAG Context). كيف يمكنني مساعدتك اليوم؟'
          : 'Hello! I am **SATI Copilot (Gemini AI & RAG Context)**, your intelligent assistant for KHDA compliance & early warning alerts across 37 Dubai campuses. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [useWebSocketMode, setUseWebSocketMode] = useState<boolean>(true);
  const [wsStatus, setWsStatus] = useState<ConnectionStatus>('disconnected');
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [connectionCheck, setConnectionCheck] = useState<{ connected: boolean; source: string; keyPreview: string } | null>(null);

  const liveWsRef = useRef<GeminiLiveWebSocket | null>(null);
  const activeAiMsgIdRef = useRef<string | null>(null);

  useEffect(() => {
    setApiKeyInput(getStoredApiKey());
    checkGeminiConnection().then(setConnectionCheck);
  }, [isOpen]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === '1') {
        return [
          {
            id: '1',
            sender: 'ai',
            text:
              lang === Language.ES
                ? '¡Hola! Soy **SATI Copilot (Gemini AI & RAG Context)**, tu asistente especializado en el Sistema de Alerta Temprana y regulación docente KHDA en los 37 campus de Dubái. ¿En qué puedo ayudarte hoy?'
                : lang === Language.AR
                ? 'مرحباً! أنا مساعد SATI الذكي (Gemini AI & RAG Context). كيف يمكنني مساعدتك اليوم؟'
                : 'Hello! I am **SATI Copilot (Gemini AI & RAG Context)**, your intelligent assistant for KHDA compliance & early warning alerts across 37 Dubai campuses. How can I help you today?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];
      }
      return prev;
    });
  }, [lang]);

  // Initialize Gemini Live WebSocket Connection
  useEffect(() => {
    if (isOpen && useWebSocketMode) {
      const apiKey = getStoredApiKey() || process.env.GEMINI_API_KEY || process.env.API_KEY || '';
      const langName = lang === Language.AR ? 'Arabic (العربية)' : lang === Language.ES ? 'Spanish (Español)' : 'English';

      if (apiKey && apiKey.startsWith('AIzaSy')) {
        const liveWs = new GeminiLiveWebSocket({
          onStatusChange: (status) => {
            setWsStatus(status);
          },
          onTextReceived: (streamedText, isFinished) => {
            setIsTyping(!isFinished);
            if (activeAiMsgIdRef.current) {
              const msgId = activeAiMsgIdRef.current;
              setMessages((prev) =>
                prev.map((msg) => (msg.id === msgId ? { ...msg, text: streamedText } : msg))
              );
            } else {
              const newMsgId = `ai-ws-${Date.now()}`;
              activeAiMsgIdRef.current = newMsgId;
              const newMsg: Message = {
                id: newMsgId,
                sender: 'ai',
                text: streamedText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
              setMessages((prev) => [...prev, newMsg]);
            }

            if (isFinished) {
              activeAiMsgIdRef.current = null;
            }
          },
          onError: (err) => {
            console.warn('[Gemini Live WS] Fallback to REST / Smart RAG:', err);
          }
        });

        const systemPrompt = `CRITICAL MANDATE: You MUST answer ALL responses 100% strictly and ONLY in ${langName}.
Translate ALL section headers, titles, bullet points, formatting, and body text into ${langName}. Do NOT use any English headings or any other language under any circumstance.
You are SATI Copilot, an expert AI Assistant integrated into SATI (Sistema de Alerta Temprana y Cumplimiento KHDA) for 37 school campuses in Dubai. Respond in ${langName}.
${systemContext ? `\n--- CURRENT REAL-TIME SYSTEM DATA CONTEXT ---\n${systemContext}\n--- END CONTEXT ---\n` : ''}`;

        liveWs.connect(apiKey, systemPrompt, true);
        liveWsRef.current = liveWs;

        return () => {
          liveWs.disconnect();
          liveWsRef.current = null;
        };
      } else {
        setWsStatus('disconnected');
      }
    }
  }, [isOpen, useWebSocketMode, lang, systemContext]);

  useEffect(() => {
    if (processedDoc) {
      handleDocumentProcessedMessage(processedDoc);
    } else if (initialQuery && initialQuery.trim()) {
      handleSendUserQuery(initialQuery);
    }
  }, [initialQuery, processedDoc]);

  const handleSaveApiKey = () => {
    saveCustomApiKey(apiKeyInput);
    checkGeminiConnection().then(setConnectionCheck);
    setShowKeyConfig(false);
  };

  const handleDocumentProcessedMessage = async (doc: ExtractedDocumentInfo) => {
    const docPrompt = lang === Language.ES
      ? `📄 **Nuevo documento digitalizado:**\n• **Nombre:** ${doc.employeeName}\n• **Documento:** ${doc.documentType}\n• **Fecha Expiración:** ${doc.expiryDate}${doc.campus ? `\n• **Campus:** ${doc.campus}` : ''}\n\nPor favor analiza la validez del documento en ESPAÑOL, su impacto en la auditoría KHDA y dime si requiere activar una alerta de renovación en SATI.`
      : lang === Language.AR
      ? `📄 **تمت معالجة وثيقة جديدة:**\n• **الاسم:** ${doc.employeeName}\n• **النوع:** ${doc.documentType}\n• **تاريخ الانتهاء:** ${doc.expiryDate}${doc.campus ? `\n• **المجمع:** ${doc.campus}` : ''}\n\nيرجى تحليل مدى الالتزام بـ KHDA والرد باللغة العربية.`
      : `📄 **New document processed:**\n• **Name:** ${doc.employeeName}\n• **Type:** ${doc.documentType}\n• **Expiry:** ${doc.expiryDate}${doc.campus ? `\n• **Campus:** ${doc.campus}` : ''}\n\nPlease analyze its KHDA compliance readiness and alert requirements in ENGLISH.`;

    await handleSendUserQuery(docPrompt);
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
    activeAiMsgIdRef.current = null;

    const targetLang = lang === Language.AR ? 'Arabic (العربية)' : lang === Language.ES ? 'Spanish (Español)' : 'English';
    const formattedQuery = `[PLEASE RESPOND 100% STRICTLY IN ${targetLang.toUpperCase()} WITH ALL HEADINGS TRANSLATED]: ${queryText}`;

    // Try WebSocket Live streaming first
    if (useWebSocketMode && liveWsRef.current && wsStatus === 'connected') {
      const sent = liveWsRef.current.sendTextMessage(formattedQuery);
      if (sent) return;
    }

    // Fallback REST call with full System Context
    const historyForAi = messages.map(m => ({
      role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
      text: m.text
    }));

    const aiResponseText = await askGeminiAssistant(queryText, historyForAi, lang, systemContext);

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
                  {t.satiCopilot}
                  {wsStatus === 'connected' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      WS Live
                    </span>
                  ) : connectionCheck?.connected ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/30">
                      Gemini 2.5
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      RAG Context AI
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {wsStatus === 'connected' ? t.wsLiveActive : connectionCheck?.connected ? 'Gemini Cloud AI Conectado' : 'Motor RAG Contextual Activo'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowKeyConfig(!showKeyConfig)}
                className={`p-2 rounded-lg transition-colors ${showKeyConfig ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                title="Configurar Google Gemini API Key"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Key Configuration Dropdown */}
          {showKeyConfig && (
            <div className="p-4 bg-indigo-950/40 border-b border-indigo-500/30 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <SparklesIcon className="w-4 h-4 text-indigo-400" />
                  Google Gemini API Key
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${connectionCheck?.connected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}`}>
                  {connectionCheck?.connected ? 'Conectado ✓' : 'Modo RAG Local'}
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Ingresa tu API Key de Google AI Studio (`AIzaSy...`) para streaming en vivo en la nube o usa el motor RAG local integrado.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-indigo-500/30 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <button
                  onClick={handleSaveApiKey}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  Guardar
                </button>
                {getStoredApiKey() && (
                  <button
                    onClick={() => {
                      removeCustomApiKey();
                      setApiKeyInput('');
                      checkGeminiConnection().then(setConnectionCheck);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs"
                  >
                    Borrar
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Action Bar */}
          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/30 flex items-center gap-2 overflow-x-auto text-xs">
            <button
              onClick={onOpenUpload}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-medium flex items-center gap-1 flex-shrink-0 shadow-sm hover:bg-indigo-700 transition-all"
            >
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>{t.scanDocument}</span>
            </button>
            <button
              onClick={() => handleSendUserQuery(t.khdaReportQuery)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium flex items-center gap-1 flex-shrink-0 hover:border-indigo-400 transition-all"
            >
              <ShieldCheckIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t.khdaReport}</span>
            </button>
            <button
              onClick={() => handleSendUserQuery(lang === Language.ES ? 'Auditoría de vencimientos críticos de visados en los 37 campus' : 'Critical visa expiration audit across all 37 campuses')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 font-medium flex items-center gap-1 flex-shrink-0 hover:border-rose-400 transition-all"
            >
              <span>🚨 Visas &lt;30d</span>
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
                <span>{t.streamingText}</span>
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
                placeholder={t.askPlaceholder}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isTyping}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-sm"
              >
                {t.send}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


