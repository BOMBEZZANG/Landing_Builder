'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, TranslationKeys } from '@/i18n/types';
import { 
  loadTranslations, 
  getStoredLanguage, 
  setStoredLanguage, 
  getNestedValue 
} from '@/i18n';

interface I18nContextType {
  locale: Locale;
  t: (key: string, params?: Record<string, string>) => string;
  setLocale: (locale: Locale) => Promise<void>;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [translations, setTranslations] = useState<TranslationKeys | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Translation function with parameter interpolation
   * @param key - Translation key (dot notation)
   * @param params - Parameters to interpolate (optional)
   */
  const t = (key: string, params?: Record<string, string>): string => {
    if (!translations) {
      console.warn('Translations not loaded yet');
      return key;
    }
    
    let translatedText = getNestedValue(translations, key);
    
    // Parameter interpolation
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translatedText = translatedText.replace(`{${paramKey}}`, paramValue);
      });
    }
    
    return translatedText;
  };

  /**
   * Change language and load new translations
   */
  const setLocale = async (newLocale: Locale): Promise<void> => {
    if (newLocale === locale && translations) {
      return; // Already loaded
    }
    
    setIsLoading(true);
    
    try {
      const newTranslations = await loadTranslations(newLocale);
      setTranslations(newTranslations);
      setLocaleState(newLocale);
      setStoredLanguage(newLocale);
      
      // Update document language attribute
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLocale;
      }
      
      console.log(`Language changed to: ${newLocale}`);
    } catch (error) {
      console.error('Failed to change language:', error);
      // Don't change locale if loading fails
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize language on mount
  useEffect(() => {
    const initializeLanguage = async () => {
      const storedLocale = getStoredLanguage();
      await setLocale(storedLocale);
    };
    
    initializeLanguage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const contextValue: I18nContextType = {
    locale,
    t,
    setLocale,
    isLoading
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Custom hook for using translation context
 */
export function useTranslation(): I18nContextType {
  const context = useContext(I18nContext);
  
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  
  return context;
}