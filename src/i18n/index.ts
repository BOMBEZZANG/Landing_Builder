import { Locale, TranslationKeys } from './types';

// Dynamic translation file imports
const translations = {
  en: () => import('./locales/en.json'),
  ko: () => import('./locales/ko.json'),
};

/**
 * Get nested value from object using dot notation
 * @param obj - Translation object
 * @param path - Dot notation path (e.g., 'builder.toolbar.save')
 * @returns Translated string or original path if not found
 */
export function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      console.warn(`Translation key not found: ${path}`);
      return path; // Return original key if not found
    }
  }
  
  return typeof current === 'string' ? current : path;
}

/**
 * Load translation file for specified locale
 */
export async function loadTranslations(locale: Locale): Promise<TranslationKeys> {
  try {
    const translation = await translations[locale]();
    return (translation as any).default || translation;
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error);
    // Fallback to English if loading fails
    if (locale !== 'en') {
      return await loadTranslations('en');
    }
    throw error;
  }
}

/**
 * Detect browser language preference
 */
export function detectBrowserLanguage(): Locale {
  if (typeof window === 'undefined') return 'ko'; // Default to Korean for server-side
  
  const browserLang = navigator.language.toLowerCase();
  
  // Check for English
  if (browserLang.startsWith('en')) {
    return 'en';
  }
  
  // Default to Korean for all other languages
  return 'ko';
}

/**
 * Get stored language from localStorage
 */
export function getStoredLanguage(): Locale {
  if (typeof window === 'undefined') return 'en';
  
  try {
    const stored = localStorage.getItem('landing-builder-language');
    if (stored === 'ko' || stored === 'en') {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to read language from localStorage:', error);
  }
  
  // Fallback to browser detection
  return detectBrowserLanguage();
}

/**
 * Store language preference in localStorage
 */
export function setStoredLanguage(locale: Locale): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('landing-builder-language', locale);
  } catch (error) {
    console.warn('Failed to store language in localStorage:', error);
  }
}