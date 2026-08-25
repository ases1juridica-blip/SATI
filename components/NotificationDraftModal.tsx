import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../constants';
import { 
  CloseIcon, 
  EmailIcon, 
  PhoneIcon, 
  WhatsAppIcon, 
  TelegramIcon, 
  DiscordIcon, 
  SmsIcon,
  SparklesIcon, 
  CheckCircleIcon,
  BotIcon
} from './Icons';
import { askGeminiAssistant } from '../services/geminiService';

export type NotificationChannel = 'email' | 'phone' | 'whatsapp' | 'telegram' | 'discord' | 'sms';

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
  const t = translations[lang];
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel>('email');
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    if (alertData) {
      const firstChannel = alertData.channels[0]?.toLowerCase() || 'email';
      if (firstChannel.includes('whatsapp')) setSelectedChannel('whatsapp');
      else if (firstChannel.includes('telegram')) setSelectedChannel('telegram');
      else if (firstChannel.includes('discord')) setSelectedChannel('discord');
      else if (firstChannel.includes('sms')) setSelectedChannel('sms');
      else if (firstChannel.includes('phone') || firstChannel.includes('call')) setSelectedChannel('phone');
      else setSelectedChannel('email');

      setMessage(alertData.originalMessage || '');
      setSentSuccess(false);
    }
  }, [alertData]);

  if (!isOpen || !alertData) return null;

  const handleRegenerateWithAI = async (channel: NotificationChannel) => {
    setIsGenerating(true);
    try {
      const prompt = lang === Language.ES
        ? `Rehace y redacta una notificación oficial de alerta temprana de cumplimiento KHDA para ${alertData.employeeName} referente a su ${alertData.documentType} que vence el ${alertData.expiryDate} (${alertData.daysRemaining} días restantes) en el campus ${alertData.campus}. El canal de envío es ${channel.toUpperCase()}. Adapta el formato y tono al canal. Idioma: ESPAÑOL.`
        : lang === Language.AR
        ? `أعد صياغة إشعار رسمي للتنبيه المبكر لالتزام KHDA لـ ${alertData.employeeName} بخصوص ${alertData.documentType} ينتهي في ${alertData.expiryDate} (${alertData.daysRemaining} أيام متبقية) في مجمع ${alertData.campus}. قناة الإرسال هي ${channel.toUpperCase()}. الرد باللغة العربية حصراً.`
        : `Redraft an official KHDA early warning compliance alert notification for ${alertData.employeeName} regarding their ${alertData.documentType} expiring on ${alertData.expiryDate} (${alertData.daysRemaining} days remaining) at campus ${alertData.campus}. Delivery channel is ${channel.toUpperCase()}. Language: ENGLISH.`;

      const text = await askGeminiAssistant(prompt, [], lang);
      setMessage(text);
    } catch (err) {
      console.error('Error generating notification text:', err);
      if (lang === Language.AR) {
        if (channel === 'whatsapp') {
          setMessage(`*تنبيه SATI KHDA* 🚨\nعزيزي/تكي *${alertData.employeeName}*,\nنذكركم بأن *${alertData.documentType}* في *${alertData.campus}* ينتهي خلال *${alertData.daysRemaining} أيام* (${alertData.expiryDate}). يرجى تسليم الوثيقة المحدثة.`);
        } else {
          setMessage(`إشعار عاجل: تجديد ${alertData.documentType} المطلوب لـ ${alertData.employeeName}\nالمجمع: ${alertData.campus}\nتاريخ الانتهاء: ${alertData.expiryDate}`);
        }
      } else if (lang === Language.ES) {
        if (channel === 'whatsapp') {
          setMessage(`*SATI KHDA ALERT* 🚨\nEstimado/a *${alertData.employeeName}*,\nLe recordamos que su *${alertData.documentType}* en *${alertData.campus}* vence en *${alertData.daysRemaining} días* (${alertData.expiryDate}). Por favor entregue su documento actualizado.`);
        } else {
          setMessage(`ASUNTO: [URGENTE] Renovación Requerida: ${alertData.documentType} - ${alertData.employeeName}\n\nEstimado/a ${alertData.employeeName},\n\nLe notificamos que su ${alertData.documentType} asignado al campus ${alertData.campus} vence el ${alertData.expiryDate}.\n\nAtentamente,\nDepartamento de Cumplimiento KHDA`);
        }
      } else {
        if (channel === 'whatsapp') {
          setMessage(`*SATI KHDA ALERT* 🚨\nDear *${alertData.employeeName}*,\nThis is a reminder that your *${alertData.documentType}* at *${alertData.campus}* expires in *${alertData.daysRemaining} days* (${alertData.expiryDate}). Please submit your updated document.`);
        } else {
          setMessage(`SUBJECT: [URGENT] Renewal Required: ${alertData.documentType} - ${alertData.employeeName}\n\nDear ${alertData.employeeName},\n\nPlease be advised that your ${alertData.documentType} at ${alertData.campus} campus expires on ${alertData.expiryDate}.\n\nBest regards,\nKHDA Compliance Dept.`);
        }
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
      label: t.email || 'Email',
      bg: 'bg-blue-500/10 dark:bg-blue-900/30',
      border: 'border-blue-500/30',
      text: 'text-blue-600 dark:text-blue-400',
    },
    phone: {
      icon: <PhoneIcon className="w-5 h-5" />,
      label: t.automatedCall || 'Llamada Automática',
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
    sms: {
      icon: <SmsIcon className="w-5 h-5" />,
      label: 'SMS',
      bg: 'bg-purple-500/10 dark:bg-purple-900/30',
      border: 'border-purple-500/30',
      text: 'text-purple-600 dark:text-purple-400',
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
              <h3 className="text-lg font-extrabold">{t.draftModalTitle}</h3>
              <p className="text-xs text-indigo-200">
                {t.draftModalSubtitle} {alertData.employeeName} ({alertData.documentType})
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
              {t.sentChannelLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
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
                {t.aiDraftedMessage} ({channelIcons[selectedChannel].label}):
              </label>
              <button
                onClick={() => handleRegenerateWithAI(selectedChannel)}
                disabled={isGenerating}
                className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                <SparklesIcon className="w-3.5 h-3.5" />
                {isGenerating ? t.redoing : t.redoWithGemini}
              </button>
            </div>

            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-slate-100 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                placeholder="..."
              />
              {isGenerating && (
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs rounded-2xl flex items-center justify-center text-xs font-bold text-white gap-2">
                  <SparklesIcon className="w-5 h-5 animate-spin text-indigo-400" />
                  <span>{t.optimizingFor} {channelIcons[selectedChannel].label}...</span>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>{t.livePreview} ({channelIcons[selectedChannel].label})</span>
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                {t.webhookReady}
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
              {message || t.waitingMsgGen}
            </div>
          </div>

          {/* Success Notification Bar */}
          {sentSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
              <span>{t.notifResentSuccess} {channelIcons[selectedChannel].label}!</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSendNotification}
              disabled={isSending || isGenerating}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              {isSending ? (
                <>
                  <SparklesIcon className="w-4 h-4 animate-spin" />
                  <span>{t.sending}</span>
                </>
              ) : (
                <>
                  {channelIcons[selectedChannel].icon}
                  <span>{t.sendingNotifBy} {channelIcons[selectedChannel].label}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
