import React, { useState, useEffect } from 'react';
import { Language, Employee } from '../types';
import { translations, ALL_NOTIFICATION_CHANNELS } from '../constants';
import { 
  CloseIcon, 
  FileTextIcon, 
  ShieldCheckIcon, 
  AlertTriangleIcon, 
  SparklesIcon, 
  BotIcon, 
  CalendarIcon, 
  SchoolIcon,
  EmailIcon,
  PhoneIcon,
  WhatsAppIcon,
  TelegramIcon,
  DiscordIcon,
  SmsIcon,
  CheckCircleIcon
} from './Icons';

export interface DocumentDetailData {
  employeeId?: string;
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
  employee?: Employee | null;
  availableChannels?: string[];
  lang: Language;
  onAskAI: (query: string) => void;
  onOpenUpload: () => void;
  onUpdateEmployee?: (employeeId: string, updated: Partial<Employee>) => void;
}

const generateCleanEmail = (name: string): string => {
  const cleanName = name.split('(')[0].trim().toLowerCase();
  const normalized = cleanName.replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
  return `${normalized || 'staff'}@sati-schools.ae`;
};

const generateCleanTelegram = (name: string): string => {
  const firstName = name.split('(')[0].trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  return `@${firstName || 'staff'}_dubai`;
};

const generateCleanDiscord = (name: string): string => {
  const firstName = name.split('(')[0].trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${firstName || 'staff'}#4421`;
};

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  isOpen,
  onClose,
  docDetail,
  employee,
  availableChannels,
  lang,
  onAskAI,
  onOpenUpload,
  onUpdateEmployee,
}) => {
  if (!isOpen || !docDetail) return null;

  const t = translations[lang];
  const isRtl = lang === Language.AR;
  const isCritical = docDetail.daysLeft <= 30;
  const isExpired = docDetail.daysLeft < 0;

  const [preferredChannels, setPreferredChannels] = useState<string[]>(
    employee?.preferredChannels || ['Email', 'WhatsApp', 'Automated Call']
  );
  const [emailInput, setEmailInput] = useState(employee?.email || generateCleanEmail(docDetail.employeeName));
  const [phoneInput, setPhoneInput] = useState(employee?.phone || '+971 50 123 4567');
  const [telegramInput, setTelegramInput] = useState(employee?.telegram || generateCleanTelegram(docDetail.employeeName));
  const [discordInput, setDiscordInput] = useState(employee?.discord || generateCleanDiscord(docDetail.employeeName));
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (employee) {
      setPreferredChannels(employee.preferredChannels || ['Email', 'WhatsApp', 'Automated Call']);
      setEmailInput(employee.email || generateCleanEmail(docDetail.employeeName));
      setPhoneInput(employee.phone || '+971 50 123 4567');
      setTelegramInput(employee.telegram || generateCleanTelegram(docDetail.employeeName));
      setDiscordInput(employee.discord || generateCleanDiscord(docDetail.employeeName));
    }
  }, [employee, docDetail]);

  const handleToggleChannel = (channel: string) => {
    setPreferredChannels(prev => 
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const handleSaveUserPreferences = () => {
    const empId = employee?.id || docDetail.employeeId || 'emp-1';
    if (onUpdateEmployee) {
      onUpdateEmployee(empId, {
        preferredChannels,
        email: emailInput,
        phone: phoneInput,
        telegram: telegramInput,
        discord: discordInput
      });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const allChannelBadges = [
    { id: 'Email', label: t.email || 'Email', icon: <EmailIcon className="w-3.5 h-3.5" />, color: 'blue' },
    { id: 'Automated Call', label: t.automatedCall || 'Llamada Automática', icon: <PhoneIcon className="w-3.5 h-3.5" />, color: 'amber' },
    { id: 'WhatsApp', label: 'WhatsApp', icon: <WhatsAppIcon className="w-3.5 h-3.5" />, color: 'emerald' },
    { id: 'Telegram', label: 'Telegram', icon: <TelegramIcon className="w-3.5 h-3.5" />, color: 'sky' },
    { id: 'Discord', label: 'Discord', icon: <DiscordIcon className="w-3.5 h-3.5" />, color: 'indigo' },
    { id: 'SMS', label: 'SMS', icon: <SmsIcon className="w-3.5 h-3.5" />, color: 'purple' },
  ];

  // Filter channels based on availableChannels from Settings/Alert rules if provided
  const channelBadges = availableChannels && availableChannels.length > 0
    ? allChannelBadges.filter(cb => 
        availableChannels.some(ac => 
          ac.toLowerCase().includes(cb.id.toLowerCase()) || 
          cb.id.toLowerCase().includes(ac.toLowerCase())
        )
      )
    : allChannelBadges;

  // Compute active channels for dynamic inputs activation
  const isEmailActive = preferredChannels.some(c => c.toLowerCase().includes('email'));
  const isPhoneActive = preferredChannels.some(c => 
    ['automated call', 'phone', 'whatsapp', 'sms', 'llamada'].some(k => c.toLowerCase().includes(k))
  );
  const isTelegramActive = preferredChannels.some(c => c.toLowerCase().includes('telegram'));
  const isDiscordActive = preferredChannels.some(c => c.toLowerCase().includes('discord'));

  const activePhoneServices = preferredChannels.filter(c => 
    ['automated call', 'phone', 'whatsapp', 'sms', 'llamada'].some(k => c.toLowerCase().includes(k))
  );

  const hasAnyActiveChannel = isEmailActive || isPhoneActive || isTelegramActive || isDiscordActive;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all transform animate-in fade-in zoom-in-95 duration-200 my-8">
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
                  {t.khdaComplianceRecord}
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
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
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
              {docDetail.role || (lang === Language.ES ? 'Docente KHDA' : lang === Language.AR ? 'معلم KHDA' : 'KHDA Teacher')}
            </span>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                {t.expiryDateLabel}
              </span>
              <p className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                {docDetail.expiryDate}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <AlertTriangleIcon className="w-3.5 h-3.5" />
                {t.riskStatusLabel}
              </span>
              <p className={`font-bold text-xs ${
                isExpired
                  ? 'text-rose-500'
                  : isCritical
                  ? 'text-amber-500'
                  : 'text-emerald-500'
              }`}>
                {isExpired
                  ? t.expiredRiskText
                  : isCritical
                  ? t.criticalRiskText.replace('{days}', String(docDetail.daysLeft))
                  : t.validRiskText.replace('{days}', String(docDetail.daysLeft))}
              </p>
            </div>
          </div>

          {/* User-Specific Notification Channels & Endpoints Configuration */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-indigo-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <SparklesIcon className="w-4 h-4 text-indigo-500" />
                {t.userChannelConfig}
              </h5>
              {savedSuccess && (
                <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  {t.savedChannelsSuccess}
                </span>
              )}
            </div>

            {/* Channel Toggles for this specific User */}
            <div>
              <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                {t.preferredChannels}:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {channelBadges.map(ch => {
                  const isChecked = preferredChannels.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => handleToggleChannel(ch.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold border transition-all text-left rtl:text-right ${
                        isChecked
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className={isChecked ? 'text-white' : 'text-slate-400'}>{ch.icon}</span>
                      <span className="truncate">{ch.label}</span>
                      <span className="ml-auto text-[10px] opacity-75">{isChecked ? '✓' : '+'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Activated Contact Endpoints */}
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                  {t.contactInfoTitle}
                </span>
                <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold">
                  {t.activeEndpointsSubtitle}
                </span>
              </div>

              {!hasAnyActiveChannel ? (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangleIcon className="w-4 h-4 flex-shrink-0" />
                  <span>{t.noChannelsSelected}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Email field - activated only if Email is checked */}
                  {isEmailActive && (
                    <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40 space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <EmailIcon className="w-3.5 h-3.5 text-blue-500" />
                          {t.emailAddress}
                        </label>
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400">
                          Email
                        </span>
                      </div>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="usuario@sati-schools.ae"
                      />
                    </div>
                  )}

                  {/* Phone field - activated if WhatsApp, Automated Call, or SMS are checked */}
                  {isPhoneActive && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <PhoneIcon className="w-3.5 h-3.5 text-emerald-500" />
                          {t.phoneNumber}
                        </label>
                        <div className="flex items-center gap-1 flex-wrap">
                          {activePhoneServices.map(srv => (
                            <span key={srv} className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              {srv}
                            </span>
                          ))}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        placeholder="+971 50 123 4567"
                      />
                    </div>
                  )}

                  {/* Telegram field - activated only if Telegram is checked */}
                  {isTelegramActive && (
                    <div className="p-2.5 rounded-xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200/70 dark:border-sky-900/40 space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <TelegramIcon className="w-3.5 h-3.5 text-sky-500" />
                          {t.telegramUsername}
                        </label>
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400">
                          Telegram
                        </span>
                      </div>
                      <input
                        type="text"
                        value={telegramInput}
                        onChange={(e) => setTelegramInput(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        placeholder="@usuario_dubai"
                      />
                    </div>
                  )}

                  {/* Discord field - activated only if Discord is checked */}
                  {isDiscordActive && (
                    <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/40 space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <DiscordIcon className="w-3.5 h-3.5 text-indigo-500" />
                          {t.discordTag}
                        </label>
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                          Discord
                        </span>
                      </div>
                      <input
                        type="text"
                        value={discordInput}
                        onChange={(e) => setDiscordInput(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="usuario#1234"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSaveUserPreferences}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-md shadow-indigo-500/20"
            >
              {t.saveUserChannels}
            </button>
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
              <span>{t.uploadNewVersion}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                const queryText = lang === Language.ES
                  ? `Analizar expediente de ${docDetail.employeeName} para el documento ${docDetail.documentType} con fecha de vencimiento ${docDetail.expiryDate}`
                  : lang === Language.AR
                  ? `تحليل ملف ${docDetail.employeeName} للوثيقة ${docDetail.documentType} بتاريخ انتهاء ${docDetail.expiryDate}`
                  : `Analyze compliance record for ${docDetail.employeeName} document ${docDetail.documentType} expiring on ${docDetail.expiryDate}`;
                onAskAI(queryText);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <BotIcon className="w-4 h-4 text-indigo-500" />
              <span>{t.consultCopilotDrawer}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

