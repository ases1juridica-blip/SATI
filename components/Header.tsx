
import React from 'react';
import { Language } from '../types';

interface HeaderProps {
  title: string;
  lang: Language;
  setLang: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ title, lang, setLang }) => {
  const LanguageButton: React.FC<{ targetLang: Language; label: string }> = ({ targetLang, label }) => {
    const isActive = lang === targetLang;
    return (
      <button
        onClick={() => setLang(targetLang)}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
          isActive
            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow'
            : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
        }`}
      >
        {label}
      </button>
    );
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{title}</h1>
        <div className="flex items-center space-x-1 rtl:space-x-reverse bg-gray-200 dark:bg-gray-900 p-1 rounded-lg">
          <LanguageButton targetLang={Language.EN} label="EN" />
          <LanguageButton targetLang={Language.ES} label="ES" />
          <LanguageButton targetLang={Language.AR} label="العربية" />
        </div>
      </div>
    </header>
  );
};
