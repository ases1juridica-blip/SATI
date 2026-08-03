import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { DocumentUpload } from './components/DocumentUpload';
import { SettingsModal } from './components/SettingsModal';
import { Employee, Document, DocumentType, ExtractedDocumentInfo, Language, Alert, AlertLevel, AlertSchedule } from './types';
import { translations, INITIAL_ALERT_SCHEDULE } from './constants';
import { EmailIcon, SmsIcon, PhoneIcon, CalendarIcon, AlertTriangleIcon, CheckCircleIcon, SettingsIcon } from './components/Icons';

// Mock Data for Dubai 37 Schools Chain
const DUBAI_CAMPUSES = [
    'All 37 Dubai Campuses',
    'Campus 01 - Dubai Marina',
    'Campus 02 - Al Barsha',
    'Campus 03 - Jumeirah',
    'Campus 04 - Silicon Oasis',
    'Campus 05 - Dubai South',
];

const createInitialData = (): Employee[] => {
    const today = new Date();
    const addDays = (date: Date, days: number) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result.toISOString().split('T')[0];
    };

    return [
        {
            id: 'emp-1', 
            name: 'Sarah Jenkins (Math Teacher)', 
            campus: 'Campus 01 - Dubai Marina',
            role: 'Teacher',
            documents: [
                { id: 'doc-1-1', type: DocumentType.KHDAPermit, expiryDate: addDays(today, 12) },
                { id: 'doc-1-2', type: DocumentType.Visa, expiryDate: addDays(today, 25) },
                { id: 'doc-1-3', type: DocumentType.Contract, expiryDate: addDays(today, 180) },
            ]
        },
        {
            id: 'emp-2', 
            name: 'Tariq Al-Mansoor (Physics Lead)', 
            campus: 'Campus 02 - Al Barsha',
            role: 'Teacher',
            documents: [
                { id: 'doc-2-1', type: DocumentType.EmiratesID, expiryDate: addDays(today, 88) },
                { id: 'doc-2-2', type: DocumentType.MedicalFitness, expiryDate: addDays(today, 6) },
            ]
        },
        {
            id: 'emp-3', 
            name: 'Elena Rostova (Primary Head)', 
            campus: 'Campus 03 - Jumeirah',
            role: 'Administrator',
            documents: [
                 { id: 'doc-3-1', type: DocumentType.WorkPermit, expiryDate: addDays(today, 5) },
                 { id: 'doc-3-2', type: DocumentType.AttestedDegree, expiryDate: addDays(today, 360) },
            ]
        },
        {
            id: 'emp-4', 
            name: 'David Miller (STEM Specialist)', 
            campus: 'Campus 04 - Silicon Oasis',
            role: 'Teacher',
            documents: [
                 { id: 'doc-4-1', type: DocumentType.HealthInsurance, expiryDate: addDays(today, 45) },
                 { id: 'doc-4-2', type: DocumentType.KHDAPermit, expiryDate: addDays(today, 90) },
            ]
        },
        {
            id: 'emp-5', 
            name: 'Relocated Student #842 (Fast Intake)', 
            campus: 'Campus 05 - Dubai South',
            role: 'Student',
            documents: [
                 { id: 'doc-5-1', type: DocumentType.StudentPassport, expiryDate: addDays(today, 300) },
            ]
        }
    ];
};

const getDaysRemaining = (expiryDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const StatusBadge: React.FC<{ days: number, lang: Language }> = ({ days, lang }) => {
    const t = translations[lang];
    if (days < 0) {
        return <span className="px-2 py-1 text-xs font-semibold text-white bg-red-700 rounded-full">{t.expired}</span>;
    }
    if (days <= 7) {
        return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">{`${t.expiresIn} ${days} ${t.daysLeft}`}</span>;
    }
    if (days <= 30) {
        return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">{`${t.expiresIn} ${days} ${t.daysLeft}`}</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">{`${t.expiresIn} ${days} ${t.daysLeft}`}</span>;
};

const AlertChannelIcon: React.FC<{ channel: string }> = ({ channel }) => {
    const lowerChannel = channel.toLowerCase();
    if (lowerChannel.includes('email')) return <EmailIcon className="h-5 w-5" title="Email"/>;
    if (lowerChannel.includes('sms')) return <SmsIcon className="h-5 w-5" title="SMS"/>;
    if (lowerChannel.includes('call')) return <PhoneIcon className="h-5 w-5" title="Automated Call"/>;
    if (lowerChannel.includes('calendar')) return <CalendarIcon className="h-5 w-5" title="Calendar Task"/>;
    return null;
}

const getAlertLevelColor = (level: AlertLevel): string => {
    switch(level) {
        case AlertLevel.Critical: return 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-700';
        case AlertLevel.High: return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-700';
        case AlertLevel.Medium: return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700';
        case AlertLevel.FollowUp: return 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 dark:border-sky-700';
        default: return 'border-gray-300 bg-gray-50 dark:bg-gray-800/20 dark:border-gray-700';
    }
}

const App: React.FC = () => {
    const [selectedCampus, setSelectedCampus] = useState<string>('All 37 Dubai Campuses');
    const [employees, setEmployees] = useState<Employee[]>(createInitialData);
    const [lang, setLang] = useState<Language>(Language.ES);
    const [alertSchedule, setAlertSchedule] = useState<AlertSchedule>(INITIAL_ALERT_SCHEDULE);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const t = translations[lang];

    const filteredEmployees = useMemo(() => {
        if (selectedCampus === 'All 37 Dubai Campuses' || !selectedCampus) {
            return employees;
        }
        return employees.filter(emp => emp.campus === selectedCampus);
    }, [employees, selectedCampus]);

    const handleDocumentProcessed = (info: ExtractedDocumentInfo) => {
        setEmployees(prevEmployees => {
            const newDocument: Document = {
                id: `doc-${Date.now()}`,
                type: info.documentType as DocumentType,
                expiryDate: info.expiryDate,
            };

            const employeeIndex = prevEmployees.findIndex(emp => emp.name.toLowerCase() === info.employeeName.toLowerCase());

            if (employeeIndex > -1) {
                // Employee exists, update their documents
                const updatedEmployees = [...prevEmployees];
                const existingEmployee = updatedEmployees[employeeIndex];
                
                // Avoid adding duplicate documents
                const docExists = existingEmployee.documents.some(doc => doc.type === newDocument.type && doc.expiryDate === newDocument.expiryDate);

                if (!docExists) {
                    updatedEmployees[employeeIndex] = {
                        ...existingEmployee,
                        documents: [...existingEmployee.documents, newDocument],
                    };
                }
                return updatedEmployees;
            } else {
                // New employee
                const newEmployee: Employee = {
                    id: `emp-${Date.now()}`,
                    name: info.employeeName,
                    campus: info.campus || (selectedCampus !== 'All 37 Dubai Campuses' ? selectedCampus : 'Campus 01 - Dubai Marina'),
                    role: 'Teacher',
                    documents: [newDocument],
                };
                return [...prevEmployees, newEmployee];
            }
        });
    };
    
    const alerts: Alert[] = useMemo(() => {
        const generatedAlerts: Alert[] = [];
        filteredEmployees.forEach(employee => {
            employee.documents.forEach(doc => {
                const daysRemaining = getDaysRemaining(doc.expiryDate);
                if(daysRemaining < 0 || daysRemaining > 120) return;

                const rules = alertSchedule[doc.type] || [];
                const defaultRules = alertSchedule['Default'] || [];
                
                const allRules = [...rules, ...defaultRules].sort((a,b) => b.days - a.days);

                for(const rule of allRules) {
                    if (daysRemaining <= rule.days) {
                         generatedAlerts.push({
                            employee,
                            document: doc,
                            daysRemaining,
                            level: rule.level,
                            message: rule.message,
                            recipients: rule.recipients,
                            channels: rule.channels
                         });
                         return; // Only add the most relevant alert for each document
                    }
                }
            });
        });
        return generatedAlerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
    }, [filteredEmployees, alertSchedule]);

    const criticalExpirationsCount = useMemo(() => {
        return filteredEmployees.flatMap(emp => emp.documents).filter(doc => getDaysRemaining(doc.expiryDate) <= 30).length;
    }, [filteredEmployees]);

    const handleSaveSettings = (newSchedule: AlertSchedule) => {
      setAlertSchedule(newSchedule);
      setIsSettingsModalOpen(false);
    };

    const isRtl = lang === Language.AR;

    return (
        <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
            <Header title={t.title} lang={lang} setLang={setLang} />
            <main className="container mx-auto p-4 md:p-6 space-y-6">
                
                {/* CEO Executive KPI Banner for 37 Campuses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border-l-4 border-indigo-600 dark:border-indigo-500">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.khdaComplianceScore}</p>
                        <div className="flex items-baseline space-x-2 rtl:space-x-reverse mt-1">
                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">96.4%</span>
                            <span className="text-xs text-green-600 font-bold">✓ KHDA Audit Ready</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border-l-4 border-blue-600 dark:border-blue-500">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.totalTeachersStaff}</p>
                        <div className="flex items-baseline space-x-2 rtl:space-x-reverse mt-1">
                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{filteredEmployees.length * 42 + 814}</span>
                            <span className="text-xs text-gray-500">across 37 schools</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border-l-4 border-red-500 dark:border-red-600">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.expiring30Days}</p>
                        <div className="flex items-baseline space-x-2 rtl:space-x-reverse mt-1">
                            <span className="text-2xl font-black text-red-600 dark:text-red-400">{criticalExpirationsCount}</span>
                            <span className="text-xs text-red-500 font-semibold">Immediate Action</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border-l-4 border-emerald-500 dark:border-emerald-600">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.fastEnrollmentModule}</p>
                        <div className="flex items-baseline space-x-2 rtl:space-x-reverse mt-1">
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">142</span>
                            <span className="text-xs text-emerald-600 font-medium">Active Relocation Intake</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Employee & Document List */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard}</h2>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{t.campusFilter}:</label>
                                <select 
                                    value={selectedCampus}
                                    onChange={e => setSelectedCampus(e.target.value)}
                                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    {DUBAI_CAMPUSES.map(c => (
                                        <option key={c} value={c}>{c === 'All 37 Dubai Campuses' ? t.allCampuses : c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-start">
                                <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="p-3 text-sm font-semibold tracking-wide text-start">{t.employee}</th>
                                        <th className="p-3 text-sm font-semibold tracking-wide text-start">{t.campusFilter}</th>
                                        <th className="p-3 text-sm font-semibold tracking-wide text-start">{t.documentType}</th>
                                        <th className="p-3 text-sm font-semibold tracking-wide text-start">{t.expiresOn}</th>
                                        <th className="p-3 text-sm font-semibold tracking-wide text-start">{t.status}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.flatMap(emp => 
                                        emp.documents.map(doc => ({ ...doc, employeeName: emp.name, employeeId: emp.id, campus: emp.campus }))
                                    ).sort((a,b) => getDaysRemaining(a.expiryDate) - getDaysRemaining(b.expiryDate))
                                    .map(doc => (
                                        <tr key={`${doc.employeeId}-${doc.id}`} className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="p-3 font-medium text-gray-900 dark:text-white">{doc.employeeName}</td>
                                            <td className="p-3 text-xs text-gray-500 dark:text-gray-400">{doc.campus}</td>
                                            <td className="p-3">{t[doc.type.replace(/\s/g, '').toLowerCase() as keyof typeof t] || doc.type}</td>
                                            <td className="p-3">{doc.expiryDate}</td>
                                            <td className="p-3"><StatusBadge days={getDaysRemaining(doc.expiryDate)} lang={lang} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredEmployees.length === 0 && <p className="text-center p-4 text-gray-500 dark:text-gray-400">{t.allDocumentsUpToDate}</p>}
                        </div>
                    </div>

                    {/* Alerts Dashboard */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.upcomingExpirations}</h2>
                            <button 
                                onClick={() => setIsSettingsModalOpen(true)}
                                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                                aria-label={t.customizeAlerts}
                                title={t.customizeAlerts}
                            >
                                <SettingsIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            {alerts.length > 0 ? alerts.map((alert, index) => (
                                <div key={index} className={`p-4 border-l-4 rtl:border-l-0 rtl:border-r-4 rounded-r-lg rtl:rounded-r-none rtl:rounded-l-lg ${getAlertLevelColor(alert.level)}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-white">{alert.employee.name}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{t[alert.document.type.replace(/\s/g, '').toLowerCase() as keyof typeof t] || alert.document.type} - <StatusBadge days={alert.daysRemaining} lang={lang}/></p>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                                            {alert.channels.map(ch => <AlertChannelIcon key={ch} channel={ch}/>)}
                                        </div>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{alert.message}</p>
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Recipients: {alert.recipients.join(', ')}</p>
                                </div>
                            )) : (
                                <div className="text-center py-8 px-4 text-gray-500 dark:text-gray-400">
                                    <CheckCircleIcon className="h-12 w-12 mx-auto text-green-500" />
                                    <p className="mt-2 font-medium">{t.noUpcomingExpirations}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <DocumentUpload onDocumentProcessed={handleDocumentProcessed} lang={lang} />
            <SettingsModal 
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                schedule={alertSchedule}
                onSave={handleSaveSettings}
                lang={lang}
            />
        </div>
    );
};

export default App;
