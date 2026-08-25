import React from 'react';
import { Language } from '../types';
import { translations } from '../constants';
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
  ChevronRightIcon,
  CloseIcon
} from './Icons';

import logoImage from '../assets/cropped-jgrouptech-logo.png';
import logoIcon from '../assets/cropped-cropped-LOGO-32x32.png';

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
  const t = translations[lang];
  const isRtl = lang === Language.AR;

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    if (window.innerWidth < 768) {
      setIsCollapsed(true);
    }
  };

  const handleUploadClick = () => {
    onOpenUpload();
    if (window.innerWidth < 768) {
      setIsCollapsed(true);
    }
  };

  const handleAICopilotClick = () => {
    onToggleAIDrawer();
    if (window.innerWidth < 768) {
      setIsCollapsed(true);
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: t.dashboard,
      icon: ActivityIcon,
      badge: null
    },
    {
      id: 'documents',
      label: lang === Language.ES ? 'Matriz Documental KHDA' : lang === Language.AR ? 'مصفوفة الوثائق' : 'KHDA Documents Matrix',
      icon: FileTextIcon,
      badge: null
    },
    {
      id: 'alerts',
      label: lang === Language.ES ? 'Centro de Alertas' : lang === Language.AR ? 'مركز التنبيهات' : 'Early Warning Center',
      icon: AlertTriangleIcon,
      badge: alertCount > 0 ? alertCount : null
    },
    {
      id: 'campuses',
      label: lang === Language.ES ? 'Matriz 37 Campus Dubái' : lang === Language.AR ? 'مجمعات دبي الـ 37' : 'Dubai 37 Campuses',
      icon: SchoolIcon,
      badge: '37'
    },
    {
      id: 'staff',
      label: lang === Language.ES ? 'Docentes & Personal' : lang === Language.AR ? 'المعلمون والكادر' : 'Teachers & Staff',
      icon: UserGroupIcon,
      badge: null
    }
  ];

  return (
    <aside
      className={`fixed top-16 md:top-0 bottom-0 ${
        isRtl ? 'right-0 border-l' : 'left-0 border-r'
      } z-40 transition-all duration-300 ease-in-out glass-panel dark:bg-slate-900/95 dark:border-slate-800 border-slate-200 shadow-2xl flex flex-col ${
        isCollapsed
          ? isRtl
            ? 'translate-x-full md:translate-x-0 w-64 md:w-20'
            : '-translate-x-full md:translate-x-0 w-64 md:w-20'
          : 'translate-x-0 w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 md:h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center space-x-3 rtl:space-x-reverse overflow-hidden">
          <div className="md:hidden flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              SATI {t.navigation}
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-2.5 rtl:space-x-reverse">
            {isCollapsed ? (
              <img 
                src={logoIcon} 
                alt="JGroupTech Logo" 
                className="w-9 h-9 object-contain rounded-lg"
              />
            ) : (
              <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                <img 
                  src={logoImage} 
                  alt="JGroupTech Logo" 
                  className="h-10 w-auto max-w-[150px] object-contain"
                />
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20 whitespace-nowrap">
                  PRO v2.5
                </span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
          title={isCollapsed ? "Expand Sidebar" : "Close Sidebar"}
        >
          {isCollapsed ? (
            isRtl ? <ChevronLeftIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <>
              <CloseIcon className="w-5 h-5 md:hidden" />
              <span className="hidden md:inline-flex">
                {isRtl ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 overflow-y-auto px-3 space-y-6">
        {/* Primary Menu */}
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              {t.navigation}
            </p>
          )}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const label = item.label;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
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
              {t.aiQuickActions}
            </p>
          )}
          <div className="space-y-1.5">
            <button
              onClick={handleUploadClick}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-3'} py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-md shadow-purple-500/20 transition-all transform hover:-translate-y-0.5`}
              title={isCollapsed ? t.aiDocScan : undefined}
            >
              <SparklesIcon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 rtl:mr-3 rtl:ml-0 truncate">
                  {t.aiDocScan}
                </span>
              )}
            </button>

            <button
              onClick={handleAICopilotClick}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-3'} py-2.5 rounded-xl font-medium text-sm border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/10 transition-all`}
              title={isCollapsed ? t.satiCopilot : undefined}
            >
              <BotIcon className="w-5 h-5 flex-shrink-0 text-indigo-500" />
              {!isCollapsed && (
                <span className="ml-3 rtl:mr-3 rtl:ml-0 truncate">
                  {t.satiCopilot}
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
          title={isCollapsed ? t.alertRules : undefined}
        >
          <SettingsIcon className="w-5 h-5 flex-shrink-0 text-slate-500" />
          {!isCollapsed && (
            <span className="ml-3 rtl:mr-3 rtl:ml-0 truncate">
              {t.alertRules}
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

