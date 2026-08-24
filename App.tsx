import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AIPromptHero } from './components/AIPromptHero';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { DocumentUpload } from './components/DocumentUpload';
import { SettingsModal } from './components/SettingsModal';
import { Employee, Document, DocumentType, ExtractedDocumentInfo, Language, Alert, AlertLevel, AlertSchedule } from './types';
import { translations, INITIAL_ALERT_SCHEDULE } from './constants';
import { 
  EmailIcon, 
  SmsIcon, 
  PhoneIcon, 
  CalendarIcon, 
  AlertTriangleIcon, 
  CheckCircleIcon, 
  SettingsIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  SchoolIcon,
  SparklesIcon,
  SearchIcon,
  FilterIcon,
  FileTextIcon,
  PlusIcon
} from './components/Icons';

// Mock Data for Dubai 37 Schools Chain
const DUBAI_CAMPUSES = [
  'All 37 Dubai Campuses',
  'Campus 01 - Dubai Marina',
  'Campus 02 - Al Barsha',
  'Campus 03 - Jumeirah',
  'Campus 04 - Silicon Oasis',
  'Campus 05 - Dubai South',
  'Campus 06 - Downtown Dubai',
  'Campus 07 - Academic City',
  'Campus 08 - Arabian Ranches',
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

const StatusBadge: React.FC<{ days: number; lang: Language }> = ({ days, lang }) => {
  const t = translations[lang];
  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-extrabold text-white bg-rose-600 rounded-full shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
        {t.expired}
      </span>
    );
  }
  if (days <= 7) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
        {`${t.expiresIn} ${days} ${t.daysLeft}`}
      </span>
    );
  }
  if (days <= 30) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold text-amber-800 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-full">
        {`${t.expiresIn} ${days} ${t.daysLeft}`}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-full">
      {`${t.expiresIn} ${days} ${t.daysLeft}`}
    </span>
  );
};

const AlertChannelIcon: React.FC<{ channel: string }> = ({ channel }) => {
  const lowerChannel = channel.toLowerCase();
  if (lowerChannel.includes('email')) return <EmailIcon className="h-4 w-4" title="Email" />;
  if (lowerChannel.includes('sms')) return <SmsIcon className="h-4 w-4" title="SMS" />;
  if (lowerChannel.includes('call')) return <PhoneIcon className="h-4 w-4" title="Automated Call" />;
  if (lowerChannel.includes('calendar')) return <CalendarIcon className="h-4 w-4" title="Calendar Task" />;
  return null;
};

const getAlertLevelColor = (level: AlertLevel): string => {
  switch (level) {
    case AlertLevel.Critical:
      return 'border-l-4 border-rose-500 bg-rose-500/10 text-slate-900 dark:text-white dark:border-rose-500';
    case AlertLevel.High:
      return 'border-l-4 border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white dark:border-amber-500';
    case AlertLevel.Medium:
      return 'border-l-4 border-yellow-500 bg-yellow-500/10 text-slate-900 dark:text-white dark:border-yellow-500';
    case AlertLevel.FollowUp:
      return 'border-l-4 border-sky-500 bg-sky-500/10 text-slate-900 dark:text-white dark:border-sky-500';
    default:
      return 'border-l-4 border-slate-300 bg-slate-100 dark:bg-slate-800/40 dark:border-slate-700';
  }
};

const App: React.FC = () => {
  const [selectedCampus, setSelectedCampus] = useState<string>('All 37 Dubai Campuses');
  const [employees, setEmployees] = useState<Employee[]>(createInitialData);
  const [lang, setLang] = useState<Language>(Language.ES);
  const [alertSchedule, setAlertSchedule] = useState<AlertSchedule>(INITIAL_ALERT_SCHEDULE);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [aiDrawerQuery, setAiDrawerQuery] = useState<string | undefined>(undefined);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const t = translations[lang];

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const filteredEmployees = useMemo(() => {
    let result = employees;
    if (selectedCampus !== 'All 37 Dubai Campuses' && selectedCampus) {
      result = result.filter((emp) => emp.campus === selectedCampus);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.name.toLowerCase().includes(term) ||
          emp.campus.toLowerCase().includes(term) ||
          emp.documents.some((d) => d.type.toLowerCase().includes(term))
      );
    }
    return result;
  }, [employees, selectedCampus, searchTerm]);

  const handleDocumentProcessed = (info: ExtractedDocumentInfo) => {
    setEmployees((prevEmployees) => {
      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        type: info.documentType as DocumentType,
        expiryDate: info.expiryDate,
      };

      const employeeIndex = prevEmployees.findIndex(
        (emp) => emp.name.toLowerCase() === info.employeeName.toLowerCase()
      );

      if (employeeIndex > -1) {
        const updatedEmployees = [...prevEmployees];
        const existingEmployee = updatedEmployees[employeeIndex];
        const docExists = existingEmployee.documents.some(
          (doc) => doc.type === newDocument.type && doc.expiryDate === newDocument.expiryDate
        );

        if (!docExists) {
          updatedEmployees[employeeIndex] = {
            ...existingEmployee,
            documents: [...existingEmployee.documents, newDocument],
          };
        }
        return updatedEmployees;
      } else {
        const newEmployee: Employee = {
          id: `emp-${Date.now()}`,
          name: info.employeeName,
          campus:
            info.campus ||
            (selectedCampus !== 'All 37 Dubai Campuses' ? selectedCampus : 'Campus 01 - Dubai Marina'),
          role: 'Teacher',
          documents: [newDocument],
        };
        return [...prevEmployees, newEmployee];
      }
    });
  };

  const alerts: Alert[] = useMemo(() => {
    const generatedAlerts: Alert[] = [];
    filteredEmployees.forEach((employee) => {
      employee.documents.forEach((doc) => {
        const daysRemaining = getDaysRemaining(doc.expiryDate);
        if (daysRemaining < 0 || daysRemaining > 120) return;

        const rules = alertSchedule[doc.type] || [];
        const defaultRules = alertSchedule['Default'] || [];
        const allRules = [...rules, ...defaultRules].sort((a, b) => b.days - a.days);

        for (const rule of allRules) {
          if (daysRemaining <= rule.days) {
            generatedAlerts.push({
              employee,
              document: doc,
              daysRemaining,
              level: rule.level,
              message: rule.message,
              recipients: rule.recipients,
              channels: rule.channels,
            });
            return;
          }
        }
      });
    });
    return generatedAlerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [filteredEmployees, alertSchedule]);

  const criticalExpirationsCount = useMemo(() => {
    return filteredEmployees
      .flatMap((emp) => emp.documents)
      .filter((doc) => getDaysRemaining(doc.expiryDate) <= 30).length;
  }, [filteredEmployees]);

  const handleSaveSettings = (newSchedule: AlertSchedule) => {
    setAlertSchedule(newSchedule);
    setIsSettingsModalOpen(false);
  };

  const handleOpenAIDrawer = (queryText?: string) => {
    setAiDrawerQuery(queryText);
    setIsAIDrawerOpen(true);
  };

  const isRtl = lang === Language.AR;

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300"
    >
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onToggleAIDrawer={() => handleOpenAIDrawer()}
        alertCount={criticalExpirationsCount}
      />

      {/* Main Content Workspace */}
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? 'md:ml-20 rtl:md:mr-20 rtl:md:ml-0' : 'md:ml-64 rtl:md:mr-64 rtl:md:ml-0'
        }`}
      >
        <Header
          title={t.title}
          lang={lang}
          setLang={setLang}
          selectedCampus={selectedCampus}
          setSelectedCampus={setSelectedCampus}
          campuses={DUBAI_CAMPUSES}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenUpload={() => setIsUploadModalOpen(true)}
          onToggleAIDrawer={() => handleOpenAIDrawer()}
          criticalCount={criticalExpirationsCount}
        />

        <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
          {/* AIPromptHero Banner */}
          <AIPromptHero
            lang={lang}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onSelectTab={(tab) => setCurrentTab(tab)}
            onToggleAIDrawer={handleOpenAIDrawer}
            criticalAlertCount={criticalExpirationsCount}
          />

          {/* Executive KPI Glassmorphism Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* KPI 1 */}
            <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  {t.khdaComplianceScore}
                </span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <ShieldCheckIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2 rtl:space-x-reverse">
                <span className="text-3xl font-black text-slate-900 dark:text-white">96.4%</span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  ✓ KHDA Ready
                </span>
              </div>
              <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full w-[96.4%]"></div>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  {t.totalTeachersStaff}
                </span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <UserGroupIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2 rtl:space-x-reverse">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {filteredEmployees.length * 42 + 814}
                </span>
                <span className="text-xs font-semibold text-slate-400">en 37 campus</span>
              </div>
              <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Sincronización en tiempo real KHDA
              </p>
            </div>

            {/* KPI 3 */}
            <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  {t.expiring30Days}
                </span>
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <AlertTriangleIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2 rtl:space-x-reverse">
                <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
                  {criticalExpirationsCount}
                </span>
                <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full animate-pulse">
                  Riesgo Multa $0
                </span>
              </div>
              <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Acción inmediata requerida
              </p>
            </div>

            {/* KPI 4 */}
            <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  {t.fastEnrollmentModule}
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <SchoolIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2 rtl:space-x-reverse">
                <span className="text-3xl font-black text-slate-900 dark:text-white">142</span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Ingreso Activo
                </span>
              </div>
              <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Módulo de traslados rápido de estudiantes
              </p>
            </div>
          </div>

          {/* Main Content Workspace Tabs */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse overflow-x-auto">
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    currentTab === 'dashboard'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {lang === Language.ES ? '📄 Matriz de Documentos' : 'Document Matrix'}
                </button>
                <button
                  onClick={() => setCurrentTab('alerts')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all relative ${
                    currentTab === 'alerts'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {lang === Language.ES ? '🔔 Centro de Alertas' : 'Alert Center'}
                  {criticalExpirationsCount > 0 && (
                    <span className="ml-2 rtl:mr-2 rtl:ml-0 px-1.5 py-0.5 text-[10px] bg-rose-500 text-white rounded-full font-bold">
                      {criticalExpirationsCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setCurrentTab('campuses')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    currentTab === 'campuses'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {lang === Language.ES ? '🏫 37 Campus Dubái' : '37 Campuses'}
                </button>
              </div>

              {/* Workspace Search & Actions */}
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="relative flex-1 sm:w-64">
                  <SearchIcon className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={lang === Language.ES ? 'Filtrar docentes o visas...' : 'Filter staff or visas...'}
                    className="w-full pl-9 rtl:pr-9 rtl:pl-3 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title={t.customizeAlerts}
                >
                  <SettingsIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tab 1: Document Matrix */}
            {currentTab === 'dashboard' && (
              <div className="glass-card rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{t.dashboard}</h3>
                    <p className="text-xs text-slate-400">
                      {filteredEmployees.flatMap((e) => e.documents).length} registros de cumplimiento KHDA
                    </p>
                  </div>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>{t.uploadDocument}</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left rtl:text-right text-xs">
                    <thead className="bg-slate-100/70 dark:bg-slate-900/70 text-slate-500 dark:text-slate-400 uppercase font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-4">{t.employee}</th>
                        <th className="p-4">{t.campusFilter}</th>
                        <th className="p-4">{t.documentType}</th>
                        <th className="p-4">{t.expiresOn}</th>
                        <th className="p-4">{t.status}</th>
                        <th className="p-4 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredEmployees
                        .flatMap((emp) =>
                          emp.documents.map((doc) => ({
                            ...doc,
                            employeeName: emp.name,
                            employeeId: emp.id,
                            campus: emp.campus,
                          }))
                        )
                        .sort((a, b) => getDaysRemaining(a.expiryDate) - getDaysRemaining(b.expiryDate))
                        .map((doc) => {
                          const daysLeft = getDaysRemaining(doc.expiryDate);
                          return (
                            <tr
                              key={`${doc.employeeId}-${doc.id}`}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                              <td className="p-4 font-bold text-slate-900 dark:text-white">
                                {doc.employeeName}
                              </td>
                              <td className="p-4 text-slate-500 dark:text-slate-400 font-medium">
                                {doc.campus}
                              </td>
                              <td className="p-4 font-semibold text-indigo-600 dark:text-indigo-400">
                                {t[doc.type.replace(/\s/g, '').toLowerCase() as keyof typeof t] || doc.type}
                              </td>
                              <td className="p-4 text-slate-700 dark:text-slate-300 font-mono">
                                {doc.expiryDate}
                              </td>
                              <td className="p-4">
                                <StatusBadge days={daysLeft} lang={lang} />
                              </td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() =>
                                    handleOpenAIDrawer(
                                      `Renovar documento ${doc.type} para ${doc.employeeName}`
                                    )
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] transition-colors"
                                >
                                  {daysLeft <= 30 ? 'Gestionar Renovación' : 'Ver Detalle'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  {filteredEmployees.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      {t.allDocumentsUpToDate}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Early Warning Alerts */}
            {currentTab === 'alerts' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                      {t.upcomingExpirations}
                    </h3>
                    <span className="text-xs text-slate-400 font-semibold">
                      {alerts.length} alertas registradas
                    </span>
                  </div>

                  <div className="space-y-3">
                    {alerts.length > 0 ? (
                      alerts.map((alert, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl glass-card transition-all ${getAlertLevelColor(
                            alert.level
                          )}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-extrabold text-sm">{alert.employee.name}</h4>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                                {t[alert.document.type.replace(/\s/g, '').toLowerCase() as keyof typeof t] ||
                                  alert.document.type}{' '}
                                - <StatusBadge days={alert.daysRemaining} lang={lang} />
                              </p>
                            </div>
                            <div className="flex items-center space-x-1.5 text-slate-500">
                              {alert.channels.map((ch) => (
                                <AlertChannelIcon key={ch} channel={ch} />
                              ))}
                            </div>
                          </div>
                          <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                            {alert.message}
                          </p>
                          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200/50 dark:border-slate-700/50 pt-2">
                            <span>Destinatarios: {alert.recipients.join(', ')}</span>
                            <button
                              onClick={() =>
                                handleOpenAIDrawer(
                                  `Generar carta de aviso para ${alert.employee.name} sobre ${alert.document.type}`
                                )
                              }
                              className="text-indigo-500 font-bold hover:underline"
                            >
                              Redactar Notificación IA →
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 glass-card rounded-2xl">
                        <CheckCircleIcon className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                        <p className="font-bold text-sm text-slate-700 dark:text-slate-200">
                          {t.noUpcomingExpirations}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel: Rule Configuration Card */}
                <div className="glass-card p-6 rounded-2xl space-y-4">
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-indigo-500" />
                    Reglas de Alerta Automática
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    SATI envía avisos automáticos a los 120, 90, 60, 30, 15 y 7 días de anticipación por correo, SMS y llamadas automatizadas.
                  </p>
                  <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all"
                  >
                    Personalizar Umbrales de Alerta
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: 37 Campuses Matrix */}
            {currentTab === 'campuses' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {DUBAI_CAMPUSES.filter((c) => c !== 'All 37 Dubai Campuses').map((campusName, idx) => (
                  <div key={campusName} className="glass-card p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-sm">
                        #{idx + 1}
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                        Auditoría 98%
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{campusName}</h4>
                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200/50 dark:border-slate-700/50 pt-2">
                      <span>42 Personal Activo</span>
                      <span className="text-indigo-500 font-semibold">0 Multas</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Action Trigger for AI Document Upload */}
      <button
        onClick={() => setIsUploadModalOpen(true)}
        className="fixed bottom-6 right-6 rtl:left-6 rtl:right-auto bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl p-4 shadow-2xl shadow-indigo-500/40 hover:scale-110 focus:outline-none transition-all z-40 pulse-glow"
        aria-label={t.uploadDocument}
        title={t.uploadDocument}
      >
        <SparklesIcon className="h-7 w-7" />
      </button>

      {/* Modals & Drawers */}
      <DocumentUpload
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDocumentProcessed={handleDocumentProcessed}
        lang={lang}
      />

      <AIAssistantDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
        lang={lang}
        initialQuery={aiDrawerQuery}
        onOpenUpload={() => {
          setIsAIDrawerOpen(false);
          setIsUploadModalOpen(true);
        }}
      />

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
