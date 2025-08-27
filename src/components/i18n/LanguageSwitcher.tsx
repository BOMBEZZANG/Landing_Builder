'use client';

import React from 'react';
import { useTranslation } from './I18nProvider';
import { Locale } from '@/i18n/types';

interface LanguageOption {
  locale: Locale;
  flag: string;
  label: string;
  name: string;
}

const languages: LanguageOption[] = [
  {
    locale: 'en',
    flag: '🇺🇸',
    label: 'EN',
    name: 'English'
  },
  {
    locale: 'ko',
    flag: '🇰🇷',
    label: '한국어',
    name: '한국어'
  }
];

export default function LanguageSwitcher() {
  const { locale, setLocale, isLoading } = useTranslation();

  const handleLanguageChange = async (newLocale: Locale) => {
    if (newLocale !== locale && !isLoading) {
      await setLocale(newLocale);
    }
  };

  return (
    <div className="relative flex items-center space-x-1 bg-white rounded-lg border border-gray-200 p-1">
      {languages.map((lang) => {
        const isActive = locale === lang.locale;
        
        return (
          <button
            key={lang.locale}
            onClick={() => handleLanguageChange(lang.locale)}
            disabled={isLoading}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
              transition-all duration-200 min-w-[80px] justify-center
              ${isActive 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={`Switch to ${lang.name}`}
            aria-label={`Switch language to ${lang.name}`}
          >
            <span className="text-lg leading-none" role="img" aria-label={`${lang.name} flag`}>
              {lang.flag}
            </span>
            <span className="text-xs font-medium">{lang.label}</span>
          </button>
        );
      })}
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}