import React, { useState, useEffect, FC } from 'react';
import { AlertSchedule, AlertRule, AlertLevel, Language } from '../types';
import { translations } from '../constants';
import { PlusIcon, TrashIcon, SparklesIcon, CheckCircleIcon } from './Icons';
import { getStoredApiKey, saveCustomApiKey, removeCustomApiKey, checkGeminiConnection } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: AlertSchedule;
  onSave: (newSchedule: AlertSchedule) => void;
  lang: Language;
}

const allChannels = ['Email', 'SMS', 'Automated Call', 'Calendar Task'];

export const SettingsModal: FC<SettingsModalProps> = ({ isOpen, onClose, schedule, onSave, lang }) => {
  const [editableSchedule, setEditableSchedule] = useState<AlertSchedule>(schedule);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<{ connected: boolean; source: string; keyPreview: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    setEditableSchedule(JSON.parse(JSON.stringify(schedule)));
    setApiKeyInput(getStoredApiKey());
    checkGeminiConnection().then(setConnectionStatus);
  }, [schedule, isOpen]);

  if (!isOpen) return null;

  const handleTestAndSaveKey = async () => {
    setIsTesting(true);
    saveCustomApiKey(apiKeyInput);
    const result = await checkGeminiConnection();
    setConnectionStatus(result);
    setIsTesting(false);
  };

  const handleRuleChange = (docType: string, ruleId: string, field: keyof AlertRule, value: any) => {
    setEditableSchedule(prev => ({
      ...prev,
      [docType]: prev[docType].map(rule => {
        if (rule.id === ruleId) {
          if (field === 'recipients') {
            return { ...rule, [field]: value.split(',').map((r: string) => r.trim()) };
          }
          if (field === 'days') {
            return { ...rule, [field]: parseInt(value, 10) || 0 };
          }
          return { ...rule, [field]: value };
        }
        return rule;
      }),
    }));
  };
  
  const handleChannelChange = (docType: string, ruleId: string, channel: string, isChecked: boolean) => {
    setEditableSchedule(prev => ({
        ...prev,
        [docType]: prev[docType].map(rule => {
            if (rule.id === ruleId) {
                const newChannels = isChecked 
                    ? [...rule.channels, channel]
                    : rule.channels.filter(c => c !== channel);
                return { ...rule, channels: newChannels };
            }
            return rule;
        })
    }))
  };

  const handleAddRule = (docType: string) => {
    const newRule: AlertRule = {
      id: `${docType}-rule-${Date.now()}`,
      days: 30,
      level: AlertLevel.Medium,
      message: '',
      recipients: ['Employee', 'HR'],
      channels: ['Email'],
    };
    setEditableSchedule(prev => ({
      ...prev,
      [docType]: [...prev[docType], newRule].sort((a, b) => b.days - a.days),
    }));
  };

  const handleDeleteRule = (docType: string, ruleId: string) => {
    setEditableSchedule(prev => ({
      ...prev,
      [docType]: prev[docType].filter(rule => rule.id !== ruleId),
    }));
  };

  const handleSaveChanges = () => {
    if (apiKeyInput !== getStoredApiKey()) {
      saveCustomApiKey(apiKeyInput);
    }
    onSave(editableSchedule);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">{t.alertSettings}</h2>
          <span className="text-xs px-3 py-1 bg-indigo-500/10 text-indigo-500 font-bold rounded-full border border-indigo-500/20">
            SATI Core v2.5
          </span>
        </div>

        <div className="p-6 flex-grow overflow-y-auto space-y-6">
          {/* Gemini AI Config Section */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-indigo-400" />
                Configuración del Motor de Inteligencia Artificial (Google Gemini 2.5)
              </h3>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                connectionStatus?.connected
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              }`}>
                {connectionStatus?.connected ? '✓ Gemini Cloud Activo' : '🧠 Motor RAG Local Activo'}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Personaliza tu API Key de Google Gemini para habilitar interacción en tiempo real en la nube o aprovecha el motor de análisis RAG integrado.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Ingresa tu Gemini API Key (AIzaSy...)"
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-indigo-500/40 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleTestAndSaveKey}
                disabled={isTesting}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap"
              >
                {isTesting ? 'Verificando...' : 'Guardar y Probar'}
              </button>
              {getStoredApiKey() && (
                <button
                  type="button"
                  onClick={() => {
                    removeCustomApiKey();
                    setApiKeyInput('');
                    checkGeminiConnection().then(setConnectionStatus);
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs transition-colors"
                >
                  Restablecer
                </button>
              )}
            </div>
          </div>

          {/* Rules by Document Type */}
          {Object.entries(editableSchedule).map(([docType, rules]) => (
            <div key={docType} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-black mb-3 text-slate-800 dark:text-slate-200 uppercase tracking-wider">{`${t.documentTypeSettings} ${docType}`}</h3>
              <div className="space-y-4">
                {(rules as any[]).map(rule => (
                  <div key={rule.id} className="p-4 border border-slate-200 dark:border-slate-700/70 rounded-2xl bg-white dark:bg-slate-900 relative shadow-sm">
                    <button onClick={() => handleDeleteRule(docType, rule.id)} className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-rose-500 transition-colors" title={t.deleteRule}><TrashIcon className="h-4 w-4"/></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">{t.daysBeforeExpiration}</label>
                        <input type="number" value={rule.days} onChange={e => handleRuleChange(docType, rule.id, 'days', e.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">{t.alertLevel}</label>
                        <select value={rule.level} onChange={e => handleRuleChange(docType, rule.id, 'level', e.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                          {Object.values(AlertLevel).map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">{t.messageTemplate}</label>
                        <textarea value={rule.message} onChange={e => handleRuleChange(docType, rule.id, 'message', e.target.value)} rows={2} className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">{t.recipients}</label>
                        <input type="text" value={rule.recipients.join(', ')} onChange={e => handleRuleChange(docType, rule.id, 'recipients', e.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">{t.notificationChannels}</label>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                            {allChannels.map(channel => (
                                <label key={channel} className="inline-flex items-center">
                                    <input type="checkbox" checked={rule.channels.some(c => c.toLowerCase().includes(channel.split(' ')[0].toLowerCase()))} onChange={e => handleChannelChange(docType, rule.id, channel, e.target.checked)} className="rounded border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700"/>
                                    <span className="ml-2 rtl:ml-0 rtl:mr-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">{t[channel.replace(/\s/g, '').toLowerCase() as keyof typeof t] || channel}</span>
                                </label>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => handleAddRule(docType)} className="mt-2 flex items-center px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors">
                    <PlusIcon className="h-4 w-4 mr-1 rtl:mr-0 rtl:ml-1"/>{t.addRule}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3 rtl:space-x-reverse">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
            {t.cancel}
          </button>
          <button onClick={handleSaveChanges} className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all">
            {t.saveChanges}
          </button>
        </div>
      </div>
    </div>
  );
};
