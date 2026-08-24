import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { 
  CloseIcon, 
  EmailIcon, 
  PhoneIcon, 
  WhatsAppIcon, 
  TelegramIcon, 
  DiscordIcon, 
  SparklesIcon, 
  CheckCircleIcon,
  BotIcon
} from './Icons';
import { askGeminiAssistant } from '../services/geminiService';

export type NotificationChannel = 'email' | 'phone' | 'whatsapp' | 'telegram' | 'discord';

export interface NotificationDraftData {
  alertId?: string;
  employeeName: string;
  documentType: string;
  expiryDate: string;
  daysRemaining: number;
  campus: string;
  originalMessage: string;
  recipients: string[];
  channels: string[];
}

interface NotificationDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertData: NotificationDraftData | null;
  lang: Language;
  onSendSuccess: (alertId?: string, channel?: NotificationChannel, updatedMessage?: string) => void;
}

export const NotificationDraftModal: React.FC<NotificationDraftModalProps> = ({
  isOpen,
  onClose,
  alertData,
  lang,
  onSendSuccess,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel>('email');
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    if (alertData) {
      // Determine default channel from alertData.channels
      const firstChannel = alertData.channels[0]?.toLowerCase() || 'email';
      if (firstChannel.includes('whatsapp')) setSelectedChannel('whatsapp');
      else if (firstChannel.includes('telegram')) setSelectedChannel('telegram');
      else if (firstChannel.includes('discord')) setSelectedChannel('discord');
      else if (firstChannel.includes('phone') || firstChannel.includes('call') || firstChannel.includes('sms')) setSelectedChannel('phone');
      else setSelectedChannel('email');

      setMessage(alertData.originalMessage || '');
      setSentSuccess(false);
    }
  }, [alertData]);

  if (!isOpen || !alertData) return null;

  const handleRegenerateWithAI = async (channel: NotificationChannel) => {
    setIsGenerating(true);
    try {
      const prompt = `Rehace y redacta una notificación oficial de alerta temprana de cumplimiento KHDA para ${alertData.employeeName} referente a su ${alertData.documentType} que vence el ${alertData.expiryDate} (${alertData.daysRemaining} días restantes) en el campus ${alertData.campus}. El canal de envío es ${channel.toUpperCase()}. Adapta el formato y tono al canal (ej. corto y directo para WhatsApp/Telegram/Discord con asteriscos, plantilla estructurada para Email con asunto, o guion telefónico para Llamada por IA). Idioma: ${lang}.`;
      
      const text = await askGeminiAssistant(prompt, [], lang);
      setMessage(text);
    } catch (err) {
      console.error('Error generating notification text:', err);
      // Fallback templates per channel
      if (channel === 'whatsapp') {
        setMessage(`*SATI KHDA ALERT* 🚨\nEstimado/a *${alertData.employeeName}*,\nLe recordamos que su *${alertData.documentType}* en *${alertData.campus}* vence en *${alertData.daysRemaining} días* (${alertData.expiryDate}). Por favor entregue su documento actualizado.`);
      } else if (channel === 'telegram') {
        setMessage(`⚡ *Notificación SATI Compliance*\nDocente: *${alertData.employeeName}*\nDocumento: *${alertData.documentType}*\nVencimiento: *${alertData.expiryDate}* (${alertData.daysRemaining} días restantes)\nAcción requerida: Carga de archivo en portal SATI.`);
      } else if (channel === 'discord') {
        setMessage(`📌 **[SATI BOT ALERTA KHDA]**\n**Empleado:** ${alertData.employeeName}\n**Documento:** ${alertData.documentType}\n**Campus:** ${alertData.campus}\n**Días Restantes:** ${alertData.daysRemaining} días.\nPor favor regularizar trámite.`);
      } else if (channel === 'phone') {
        setMessage(`[Guion de Llamada IA de Voz]: "Hola ${alertData.employeeName}, le habla el sistema automatizado SATI. Le notificamos que su documento ${alertData.documentType} vence en ${alertData.daysRemaining} días. Presione 1 para contactar con Recursos Humanos."`);
      } else {
        setMessage(`ASUNTO: [URGENTE] Renovación Requerida: ${alertData.documentType} - ${alertData.employeeName}\n\nEstimado/a ${alertData.employeeName},\n\nLe notificamos que su ${alertData.documentType} asignado al campus ${alertData.campus} vence el ${alertData.expiryDate}.\n\nAtentamente,\nDepartamento de Cumplimiento KHDA`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChannelSelect = (channel: NotificationChannel) => {
    setSelectedChannel(channel);
    handleRegenerateWithAI(channel);
  };

  const handleSendNotification = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      setTimeout(() => {
        onSendSuccess(alertData.alertId, selectedChannel, message);
        onClose();
      }, 1200);
    }, 800);
  };

  const channelIcons: Record<NotificationChannel, { icon: React.ReactNode; label: string; bg: string; border: string; text: string }> = {
    email: {
      icon: <EmailIcon className="w-5 h-5" />,
      label: 'Email',
      bg: 'bg-blue-500/10 dark:bg-blue-900/30',
      border: 'border-blue-500/30',
      text: 'text-blue-600 dark:text-blue-400',
    },
    phone: {
      icon: <PhoneIcon className="w-5 h-5" />,
      label: 'Teléfono / Voz',
      bg: 'bg-amber-500/10 dark:bg-amber-900/30',
      border: 'border-amber-500/30',
      text: 'text-amber-600 dark:text-amber-400',
    },
    whatsapp: {
      icon: <WhatsAppIcon className="w-5 h-5" />,
      label: 'WhatsApp',
      bg: 'bg-emerald-500/10 dark:bg-emerald-900/30',
      border: 'border-emerald-500/30',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    telegram: {
      icon: <TelegramIcon className="w-5 h-5" />,
      label: 'Telegram',
      bg: 'bg-sky-500/10 dark:bg-sky-900/30',
      border: 'border-sky-500/30',
      text: 'text-sky-600 dark:text-sky-400',
    },
    discord: {
      icon: <DiscordIcon className="w-5 h-5" />,
      label: 'Discord',
      bg: 'bg-indigo-500/10 dark:bg-indigo-900/30',
      border: 'border-indigo-500/30',
      text: 'text-indigo-600 dark:text-indigo-400',
    },
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all transform animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 text-white flex items-center justify-between border-b border-indigo-500/20">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold">Redactar Notificación con IA</h3>
              <p className="text-xs text-indigo-200">
                Personaliza y rehace el mensaje enviado a {alertData.employeeName} ({alertData.documentType})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Channel Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Canal de Notificación Enviado:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(Object.keys(channelIcons) as NotificationChannel[]).map((ch) => {
                const info = channelIcons[ch];
                const isSelected = selectedChannel === ch;
                return (
                  <button
                    key={ch}
                    onClick={() => handleChannelSelect(ch)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-bold gap-1.5 ${
                      isSelected
                        ? `${info.bg} ${info.border} ${info.text} ring-2 ring-indigo-500 shadow-md`
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {info.icon}
                    <span>{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Message Studio / Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <BotIcon className="w-4 h-4 text-indigo-500" />
                Mensaje Redactado por IA ({channelIcons[selectedChannel].label}):
              </label>
              <button
                onClick={() => handleRegenerateWithAI(selectedChannel)}
                disabled={isGenerating}
                className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                <SparklesIcon className="w-3.5 h-3.5" />
                {isGenerating ? 'Rehaciendo...' : 'Rehacer con Gemini IA'}
              </button>
            </div>

            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-slate-100 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                placeholder="Redactando mensaje automatizado..."
              />
              {isGenerating && (
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs rounded-2xl flex items-center justify-center text-xs font-bold text-white gap-2">
                  <SparklesIcon className="w-5 h-5 animate-spin text-indigo-400" />
                  <span>Optimizando mensaje para {channelIcons[selectedChannel].label}...</span>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>VISTA PREVIA DEL ENVÍO ({channelIcons[selectedChannel].label})</span>
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                Webhook Listo
              </span>
            </div>
            <div className={`p-3 rounded-xl text-xs font-medium ${
              selectedChannel === 'whatsapp'
                ? 'bg-emerald-950/40 text-emerald-200 border border-emerald-800/40 font-sans'
                : selectedChannel === 'telegram'
                ? 'bg-sky-950/40 text-sky-200 border border-sky-800/40 font-sans'
                : selectedChannel === 'discord'
                ? 'bg-indigo-950/40 text-indigo-200 border border-indigo-800/40 font-mono'
                : selectedChannel === 'phone'
                ? 'bg-amber-950/40 text-amber-200 border border-amber-800/40 font-sans'
                : 'bg-slate-900 text-slate-200 font-sans'
            }`}>
              {message || 'Esperando generación de mensaje...'}
            </div>
          </div>

          {/* Success Notification Bar */}
          {sentSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
              <span>Notificación reenviada exitosamente a través del canal {channelIcons[selectedChannel].label}!</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSendNotification}
              disabled={isSending || isGenerating}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              {isSending ? (
                <>
                  <SparklesIcon className="w-4 h-4 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  {channelIcons[selectedChannel].icon}
                  <span>Enviar Notificación por {channelIcons[selectedChannel].label}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
