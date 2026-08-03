import React, { useState, useEffect, FC } from 'react';
import { AlertSchedule, AlertRule, AlertLevel, Language } from '../types';
import { translations } from '../constants';
import { PlusIcon, TrashIcon } from './Icons';

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
  const t = translations[lang];

  useEffect(() => {
    // Deep copy to prevent modifying parent state directly
    setEditableSchedule(JSON.parse(JSON.stringify(schedule)));
  }, [schedule, isOpen]);

  if (!isOpen) return null;

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
    onSave(editableSchedule);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.alertSettings}</h2>
        </div>
        <div className="p-6 flex-grow overflow-y-auto space-y-6">
          {Object.entries(editableSchedule).map(([docType, rules]) => (
            <div key={docType} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">{`${t.documentTypeSettings} ${docType}`}</h3>
              <div className="space-y-4">
                {rules.map(rule => (
                  <div key={rule.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 relative">
                    <button onClick={() => handleDeleteRule(docType, rule.id)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500" title={t.deleteRule}><TrashIcon className="h-5 w-5"/></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.daysBeforeExpiration}</label>
                        <input type="number" value={rule.days} onChange={e => handleRuleChange(docType, rule.id, 'days', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.alertLevel}</label>
                        <select value={rule.level} onChange={e => handleRuleChange(docType, rule.id, 'level', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                          {Object.values(AlertLevel).map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.messageTemplate}</label>
                        <textarea value={rule.message} onChange={e => handleRuleChange(docType, rule.id, 'message', e.target.value)} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.recipients}</label>
                        <input type="text" value={rule.recipients.join(', ')} onChange={e => handleRuleChange(docType, rule.id, 'recipients', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.notificationChannels}</label>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                            {allChannels.map(channel => (
                                <label key={channel} className="inline-flex items-center">
                                    <input type="checkbox" checked={rule.channels.some(c => c.toLowerCase().includes(channel.split(' ')[0].toLowerCase()))} onChange={e => handleChannelChange(docType, rule.id, channel, e.target.checked)} className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"/>
                                    <span className="ml-2 rtl:ml-0 rtl:mr-2 text-sm text-gray-600 dark:text-gray-400">{t[channel.replace(/\s/g, '').toLowerCase() as keyof typeof t] || channel}</span>
                                </label>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => handleAddRule(docType)} className="mt-2 flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <PlusIcon className="h-5 w-5 mr-1 rtl:mr-0 rtl:ml-1"/>{t.addRule}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 rtl:space-x-reverse">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
            {t.cancel}
          </button>
          <button onClick={handleSaveChanges} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            {t.saveChanges}
          </button>
        </div>
      </div>
    </div>
  );
};
