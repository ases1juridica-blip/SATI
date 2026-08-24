import React from 'react';
import { Language } from '../types';
import { 
  BotIcon, 
  ShieldCheckIcon, 
  SchoolIcon, 
  FileTextIcon, 
  AlertTriangleIcon, 
  SettingsIcon, 
  SparklesIcon, 
  UserGroupIcon, 
  ActivityIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from './Icons';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: Language;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onOpenUpload: () => void;
  onOpenSettings: () => void;
  onToggleAIDrawer: () => void;
  alertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  isCollapsed,
  setIsCollapsed,
  onOpenUpload,
  onOpenSettings,
  onToggleAIDrawer,
  alertCount
}) => {
  const isRtl = lang === Language.AR;

  const menuItems = [
    {
      id: 'dashboard',
      labelEs: 'Panel Principal',
      labelEn: 'Dashboard',
      labelAr: 'لوحة التحكم',
      icon: ActivityIcon,
      badge: null
    },
    {
      id: 'documents',
      labelEs: 'Matriz Documental KHDA',
      labelEn: 'KHDA Documents Matrix',
      labelAr: 'مصفوفة الوثائق',
      icon: FileTextIcon,
      badge: null
    },
    {
      id: 'alerts',
      labelEs: 'Centro de Alertas',
      labelEn: 'Early Warning Center',
      labelAr: 'مركز التنبيهات',
      icon: AlertTriangleIcon,
      badge: alertCount > 0 ? alertCount : null
    },
    {
      id: 'campuses',
      labelEs: 'Matriz 37 Campus Dubái',
      labelEn: 'Dubai 37 Campuses',
      labelAr: 'مجمعات دبي الـ 37',
      icon: SchoolIcon,
      badge: '37'
    },
    {
      id: 'staff',
      labelEs: 'Docentes & Personal',
      labelEn: 'Teachers & Staff',
      labelAr: 'المعلمون والكادر',
      icon: UserGroupIcon,
      badge: null
    }
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} z-30 transition-all duration-300 ease-in-out glass-panel dark:bg-slate-900/90 dark:border-slate-800 border-slate-200 shadow-xl flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3 rtl:space-x-reverse overflow-hidden">
          {isCollapsed ? (
            <img 
              src="assets/cropped-cropped-LOGO-32x32.png" 
              alt="JGroupTech Logo" 
              className="w-9 h-9 object-contain rounded-lg"
            />
          ) : (
            <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
              <img 
                src="assets/cropped-jgrouptech-logo.png" 
                alt="JGroupTech Logo" 
                className="h-10 w-auto max-w-[150px] object-contain"
              />
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20 whitespace-nowrap">
                PRO v2.5
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden md:block"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            isRtl ? <ChevronLeftIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />
          ) : (
            isRtl ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 overflow-y-auto px-3 space-y-6">
        {/* Primary Menu */}
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              {lang === Language.ES ? 'Navegación' : lang === Language.AR ? 'التصفح الرئيسي' : 'Navigation'}
            </p>
          )}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const label = lang === Language.ES ? item.labelEs : lang === Language.AR ? item.labelAr : item.labelEn;

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl font-medium text-sm transition-all duration-200 relative group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={isCollapsed ? label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`} />
                  {!isCollapsed && (
                    <span className="ml-3 rtl:mr-3 rtl:ml-0 truncate flex-1 text-left rtl:text-right">{label}</span>
                  )}
                  {!isCollapsed && item.badge !== null && (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      typeof item.badge === 'number'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* AI Tools & Actions */}
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              {lang === Language.ES ? 'Acciones Inteligentes' : lang === Language.AR ? 'أدوات الذكاء الاصطناعي' : 'AI Quick Actions'}
            </p>
          )}
          <div className="space-y-1.5">
            <button
              onClick={onOpenUpload}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-3'} py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-md shadow-purple-500/20 transition-all transform hover:-translate-y-0.5`}
              title={isCollapsed ? "Escáner OCR IA" : undefined}
            >
              <SparklesIcon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 rtl:mr-3 rtl:ml-0 truncate">
                  {lang === Language.ES ? 'Escáner OCR IA' : lang === Language.AR ? 'مسح الوثائق بالذكاء الاصطناعي' : 'AI Document Scan'}
                </span>
              )}
            </button>

            <button
              onClick={onToggleAIDrawer}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-3'} py-2.5 rounded-xl font-medium text-sm border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/10 transition-all`}
              title={isCollapsed ? "Copilot Asistente KHDA" : undefined}
            >
              <BotIcon className="w-5 h-5 flex-shrink-0 text-indigo-500" />
              {!isCollapsed && (
                <span className="ml-3 rtl:mr-3 rtl:ml-0 truncate">
                  {lang === Language.ES ? 'Asistente SATI Copilot' : lang === Language.AR ? 'مساعد SATI الذكي' : 'SATI Copilot'}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Settings & System Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          onClick={onOpenSettings}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-3'} py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors`}
          title={isCollapsed ? "Configurar Alertas" : undefined}
        >
          <SettingsIcon className="w-5 h-5 flex-shrink-0 text-slate-500" />
          {!isCollapsed && (
            <span className="ml-3 rtl:mr-3 rtl:ml-0 truncate">
              {lang === Language.ES ? 'Reglas de Alerta' : lang === Language.AR ? 'إعدادات القواعد' : 'Alert Rules'}
            </span>
          )}
        </button>

        {/* User Card */}
        {!isCollapsed ? (
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 rtl:space-x-reverse overflow-hidden">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Compliance Director"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/40"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">Dr. Amira Al-Mansoor</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">KHDA Audit Director</span>
              </div>
            </div>
            <ShieldCheckIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Compliance Director"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/40"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
