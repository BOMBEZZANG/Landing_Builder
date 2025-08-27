# Internationalization Development Specification
## Landing Page Builder - Phase 1: Builder UI i18n Support

### Document Version: 1.0
### Project: Landing Page Builder
### Scope: Phase 1 - Builder Tool Interface Only
### Languages: English (EN) & Korean (KO)

---

## 🎯 **Project Overview**

### **Objective**
Implement internationalization (i18n) support for the Landing Page Builder interface, allowing users to switch between English and Korean languages using flag icons in the website header.

### **Scope Definition**
- ✅ **IN SCOPE**: Builder tool interface (toolbar, property panels, buttons, messages)
- ❌ **OUT OF SCOPE**: Generated landing pages content (Phase 2)
- ✅ **IN SCOPE**: Flag-based language switcher in website header
- ✅ **IN SCOPE**: Browser language detection and localStorage persistence

---

## 📋 **Functional Requirements**

### **F1. Language Support**
- Support English (EN) as default language
- Support Korean (KO) as secondary language
- Automatic browser language detection on first visit
- Language preference persistence using localStorage

### **F2. Language Switcher UI**
- Flag-based language switcher in website header (top-right corner)
- US flag (🇺🇸) for English
- Korean flag (🇰🇷) for Korean  
- Active state visual indication
- Smooth transition between languages
- No page reload required

### **F3. Translation Coverage**
All builder interface elements must be translatable:
- Toolbar buttons and tooltips
- Section names and properties  
- Form labels and placeholders
- Success/error messages
- Modal dialogs and confirmations
- Property panel labels and options

---

## 🏗️ **Technical Architecture**

### **Tech Stack Requirements**
- **Framework**: Custom React Context (no external i18n libraries)
- **Storage**: localStorage for language persistence
- **Loading**: Dynamic import for translation files
- **Icons**: Unicode flag emojis (🇺🇸 🇰🇷)

### **File Structure**
```
/src
├── /i18n
│   ├── index.ts                 # Core i18n functions
│   ├── types.ts                 # TypeScript definitions
│   └── /locales
│       ├── en.json              # English translations
│       └── ko.json              # Korean translations
├── /components
│   └── /i18n
│       ├── I18nProvider.tsx     # React Context Provider
│       └── LanguageSwitcher.tsx # Flag-based switcher component
└── /hooks
    └── useTranslation.ts        # Translation hook (optional)
```

---

## 📝 **Implementation Specifications**

### **TASK 1: Type Definitions**

**File**: `/src/i18n/types.ts`

```typescript
export type Locale = 'en' | 'ko';

export interface TranslationKeys {
  // Common UI elements
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    preview: string;
    publish: string;
    loading: string;
    error: string;
    success: string;
  };
  
  // Builder toolbar
  builder: {
    toolbar: {
      save: string;
      preview: string;
      publish: string;
      settings: string;
      undo: string;
      redo: string;
    };
    sections: {
      hero: string;
      content: string;
      cta: string;
      addSection: string;
      moveUp: string;
      moveDown: string;
      duplicate: string;
      remove: string;
    };
    properties: {
      background: string;
      backgroundColor: string;
      backgroundImage: string;
      text: string;
      textColor: string;
      fontSize: string;
      fontFamily: string;
      alignment: string;
      padding: string;
      margin: string;
      layout: string;
      colors: string;
      spacing: string;
    };
  };
  
  // Form elements
  form: {
    labels: {
      name: string;
      email: string;
      phone: string;
      message: string;
      subject: string;
    };
    placeholders: {
      name: string;
      email: string;
      phone: string;
      message: string;
      subject: string;
      enterText: string;
    };
    buttons: {
      submit: string;
      reset: string;
      clear: string;
    };
    validation: {
      required: string;
      invalidEmail: string;
      invalidPhone: string;
      minLength: string;
      maxLength: string;
    };
  };
  
  // Messages and notifications
  messages: {
    success: {
      saved: string;
      published: string;
      emailSent: string;
      imageUploaded: string;
      settingsUpdated: string;
    };
    error: {
      saveFailed: string;
      publishFailed: string;
      uploadFailed: string;
      networkError: string;
      invalidInput: string;
      genericError: string;
    };
    info: {
      autoSave: string;
      unsavedChanges: string;
      processing: string;
    };
  };
  
  // Modal dialogs
  modals: {
    confirmDelete: {
      title: string;
      message: string;
      confirm: string;
      cancel: string;
    };
    publishSettings: {
      title: string;
      domain: string;
      seo: string;
      analytics: string;
    };
    imageUpload: {
      title: string;
      dragDrop: string;
      browse: string;
      maxSize: string;
      supportedFormats: string;
    };
  };
}
```

### **TASK 2: Core i18n Functions**

**File**: `/src/i18n/index.ts`

```typescript
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
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language.toLowerCase();
  
  // Check for Korean
  if (browserLang.startsWith('ko')) {
    return 'ko';
  }
  
  // Default to English
  return 'en';
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
```

### **TASK 3: Translation Files**

**File**: `/src/i18n/locales/en.json`

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "preview": "Preview",
    "publish": "Publish",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success"
  },
  "builder": {
    "toolbar": {
      "save": "Save Draft",
      "preview": "Preview",
      "publish": "Publish Page",
      "settings": "Settings",
      "undo": "Undo",
      "redo": "Redo"
    },
    "sections": {
      "hero": "Hero Section",
      "content": "Content Section", 
      "cta": "Call to Action",
      "addSection": "Add Section",
      "moveUp": "Move Up",
      "moveDown": "Move Down",
      "duplicate": "Duplicate",
      "remove": "Remove"
    },
    "properties": {
      "background": "Background",
      "backgroundColor": "Background Color",
      "backgroundImage": "Background Image",
      "text": "Text",
      "textColor": "Text Color",
      "fontSize": "Font Size",
      "fontFamily": "Font Family",
      "alignment": "Alignment",
      "padding": "Padding",
      "margin": "Margin",
      "layout": "Layout",
      "colors": "Colors",
      "spacing": "Spacing"
    }
  },
  "form": {
    "labels": {
      "name": "Name",
      "email": "Email",
      "phone": "Phone",
      "message": "Message",
      "subject": "Subject"
    },
    "placeholders": {
      "name": "Enter your name",
      "email": "Enter your email address",
      "phone": "Enter your phone number",
      "message": "Enter your message",
      "subject": "Enter subject",
      "enterText": "Enter text here..."
    },
    "buttons": {
      "submit": "Submit",
      "reset": "Reset",
      "clear": "Clear"
    },
    "validation": {
      "required": "This field is required",
      "invalidEmail": "Please enter a valid email address",
      "invalidPhone": "Please enter a valid phone number",
      "minLength": "Minimum {min} characters required",
      "maxLength": "Maximum {max} characters allowed"
    }
  },
  "messages": {
    "success": {
      "saved": "Page saved successfully!",
      "published": "Page published successfully!",
      "emailSent": "Email sent successfully!",
      "imageUploaded": "Image uploaded successfully!",
      "settingsUpdated": "Settings updated successfully!"
    },
    "error": {
      "saveFailed": "Failed to save page",
      "publishFailed": "Failed to publish page",
      "uploadFailed": "Failed to upload image",
      "networkError": "Network error occurred",
      "invalidInput": "Invalid input provided",
      "genericError": "An error occurred"
    },
    "info": {
      "autoSave": "Auto-saved",
      "unsavedChanges": "You have unsaved changes",
      "processing": "Processing..."
    }
  },
  "modals": {
    "confirmDelete": {
      "title": "Confirm Delete",
      "message": "Are you sure you want to delete this item?",
      "confirm": "Delete",
      "cancel": "Cancel"
    },
    "publishSettings": {
      "title": "Publish Settings",
      "domain": "Custom Domain",
      "seo": "SEO Settings",
      "analytics": "Analytics"
    },
    "imageUpload": {
      "title": "Upload Image",
      "dragDrop": "Drag and drop an image here",
      "browse": "or click to browse",
      "maxSize": "Maximum file size: 5MB",
      "supportedFormats": "Supported formats: JPG, PNG, WebP"
    }
  }
}
```

**File**: `/src/i18n/locales/ko.json`

```json
{
  "common": {
    "save": "저장",
    "cancel": "취소",
    "delete": "삭제", 
    "edit": "편집",
    "preview": "미리보기",
    "publish": "배포",
    "loading": "로딩 중...",
    "error": "오류",
    "success": "성공"
  },
  "builder": {
    "toolbar": {
      "save": "임시저장",
      "preview": "미리보기",
      "publish": "페이지 배포",
      "settings": "설정",
      "undo": "실행취소",
      "redo": "다시실행"
    },
    "sections": {
      "hero": "메인 섹션",
      "content": "콘텐츠 섹션",
      "cta": "액션 섹션",
      "addSection": "섹션 추가",
      "moveUp": "위로 이동",
      "moveDown": "아래로 이동", 
      "duplicate": "복제",
      "remove": "제거"
    },
    "properties": {
      "background": "배경",
      "backgroundColor": "배경색",
      "backgroundImage": "배경 이미지",
      "text": "텍스트", 
      "textColor": "텍스트 색상",
      "fontSize": "글자 크기",
      "fontFamily": "글꼴",
      "alignment": "정렬",
      "padding": "안쪽 여백",
      "margin": "바깥쪽 여백",
      "layout": "레이아웃",
      "colors": "색상",
      "spacing": "간격"
    }
  },
  "form": {
    "labels": {
      "name": "이름",
      "email": "이메일",
      "phone": "전화번호",
      "message": "메시지",
      "subject": "제목"
    },
    "placeholders": {
      "name": "이름을 입력하세요",
      "email": "이메일 주소를 입력하세요",
      "phone": "전화번호를 입력하세요", 
      "message": "메시지를 입력하세요",
      "subject": "제목을 입력하세요",
      "enterText": "텍스트를 입력하세요..."
    },
    "buttons": {
      "submit": "제출하기",
      "reset": "초기화",
      "clear": "지우기"
    },
    "validation": {
      "required": "필수 입력 항목입니다",
      "invalidEmail": "올바른 이메일 주소를 입력하세요",
      "invalidPhone": "올바른 전화번호를 입력하세요",
      "minLength": "최소 {min}자 이상 입력하세요",
      "maxLength": "최대 {max}자까지 입력 가능합니다"
    }
  },
  "messages": {
    "success": {
      "saved": "페이지가 성공적으로 저장되었습니다!",
      "published": "페이지가 성공적으로 배포되었습니다!",
      "emailSent": "이메일이 성공적으로 발송되었습니다!",
      "imageUploaded": "이미지가 성공적으로 업로드되었습니다!",
      "settingsUpdated": "설정이 성공적으로 업데이트되었습니다!"
    },
    "error": {
      "saveFailed": "페이지 저장에 실패했습니다",
      "publishFailed": "페이지 배포에 실패했습니다",
      "uploadFailed": "이미지 업로드에 실패했습니다",
      "networkError": "네트워크 오류가 발생했습니다",
      "invalidInput": "잘못된 입력입니다",
      "genericError": "오류가 발생했습니다"
    },
    "info": {
      "autoSave": "자동 저장됨",
      "unsavedChanges": "저장되지 않은 변경사항이 있습니다",
      "processing": "처리 중..."
    }
  },
  "modals": {
    "confirmDelete": {
      "title": "삭제 확인",
      "message": "정말로 이 항목을 삭제하시겠습니까?",
      "confirm": "삭제",
      "cancel": "취소"
    },
    "publishSettings": {
      "title": "배포 설정",
      "domain": "커스텀 도메인",
      "seo": "SEO 설정", 
      "analytics": "분석 도구"
    },
    "imageUpload": {
      "title": "이미지 업로드",
      "dragDrop": "이미지를 여기에 드래그하세요",
      "browse": "또는 클릭하여 찾아보기",
      "maxSize": "최대 파일 크기: 5MB",
      "supportedFormats": "지원 형식: JPG, PNG, WebP"
    }
  }
}
```

### **TASK 4: React Context Provider**

**File**: `/src/components/i18n/I18nProvider.tsx`

```typescript
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
  }, []);

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
```

### **TASK 5: Flag-Based Language Switcher**

**File**: `/src/components/i18n/LanguageSwitcher.tsx`

```typescript
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
    <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-200 p-1">
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
          >
            <span className="text-lg leading-none">{lang.flag}</span>
            <span className="text-xs font-medium">{lang.label}</span>
          </button>
        );
      })}
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
```

### **TASK 6: Integration with App Layout**

**File**: `/src/app/layout.tsx` - **ADD I18N PROVIDER**

```typescript
import { I18nProvider } from '@/components/i18n/I18nProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
```

**Header Component Integration - ADD TO EXISTING HEADER**

```typescript
// Add to existing header component (or create new one)
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Landing Builder
            </h1>
          </div>
          
          {/* Right side - Language Switcher */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
```

### **TASK 7: Update Existing Components**

**Example: Update Toolbar Component**

```typescript
// Before
import Button from '@/components/ui/Button';

// After  
import Button from '@/components/ui/Button';
import { useTranslation } from '@/components/i18n/I18nProvider';

export default function Toolbar() {
  const { t, isLoading } = useTranslation();
  
  // Show loading state while translations load
  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }
  
  return (
    <div className="toolbar">
      <Button>{t('builder.toolbar.save')}</Button>
      <Button>{t('builder.toolbar.preview')}</Button>
      <Button>{t('builder.toolbar.publish')}</Button>
      <Button>{t('builder.toolbar.settings')}</Button>
    </div>
  );
}
```

**Example: Update PropertyPanel Component**

```typescript
import { useTranslation } from '@/components/i18n/I18nProvider';

export default function PropertyPanel() {
  const { t } = useTranslation();
  
  return (
    <div>
      <PropertyGroup title={t('builder.properties.background')}>
        <ColorPicker 
          label={t('builder.properties.backgroundColor')}
          // ... other props
        />
      </PropertyGroup>
      
      <PropertyGroup title={t('builder.properties.text')}>
        <Input 
          label={t('builder.properties.fontSize')}
          placeholder={t('form.placeholders.enterText')}
        />
      </PropertyGroup>
    </div>
  );
}
```

---

## 🎨 **UI/UX Requirements**

### **Language Switcher Specifications**
- **Position**: Top-right corner of website header
- **Size**: Compact, approximately 180px width × 40px height
- **Flags**: Unicode emoji flags (🇺🇸 🇰🇷)
- **Active State**: Blue background with border
- **Hover State**: Light gray background
- **Loading State**: Spinner overlay with disabled buttons
- **Responsive**: Stack vertically on mobile < 640px

### **Visual States**
```css
/* Active language */
.language-active {
  background: #dbeafe; /* blue-100 */
  color: #1d4ed8;      /* blue-700 */  
  border: 1px solid #93c5fd; /* blue-300 */
}

/* Inactive language */  
.language-inactive {
  color: #4b5563;      /* gray-600 */
}

/* Hover state */
.language-inactive:hover {
  background: #f9fafb; /* gray-50 */
  color: #111827;      /* gray-900 */
}

/* Loading/disabled state */
.language-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## ✅ **Acceptance Criteria**

### **Functional Testing**

1. **Language Detection**
   - [ ] Browser language auto-detection works on first visit
   - [ ] Korean browsers → Korean interface  
   - [ ] Non-Korean browsers → English interface

2. **Language Switching**
   - [ ] Clicking US flag switches to English
   - [ ] Clicking Korean flag switches to Korean  
   - [ ] Language change is immediate (no page reload)
   - [ ] All UI text changes to selected language
   - [ ] Loading state shows during language change

3. **Persistence**
   - [ ] Language choice saves to localStorage
   - [ ] Selected language persists after browser refresh
   - [ ] Language persists across browser sessions

4. **Translation Coverage**
   - [ ] All toolbar buttons translated
   - [ ] All property panel labels translated  
   - [ ] All form placeholders translated
   - [ ] All success/error messages translated
   - [ ] All modal dialogs translated

### **Technical Testing**

1. **Performance**
   - [ ] Translation files load < 200ms
   - [ ] Language switching < 100ms
   - [ ] No memory leaks during language changes
   - [ ] Bundle size increase < 50KB

2. **Error Handling**
   - [ ] Graceful fallback to English if Korean fails to load
   - [ ] Console warnings for missing translation keys
   - [ ] No crashes when translations unavailable

3. **Browser Compatibility**
   - [ ] Chrome/Edge (latest 2 versions)
   - [ ] Firefox (latest 2 versions)  
   - [ ] Safari (latest 2 versions)
   - [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### **Code Quality**

1. **TypeScript**
   - [ ] All components fully typed
   - [ ] No `any` types used
   - [ ] Translation keys type-safe

2. **React Best Practices**
   - [ ] Context doesn't cause unnecessary re-renders
   - [ ] Components properly memoized if needed
   - [ ] No memory leaks in useEffect hooks

3. **Accessibility**
   - [ ] Language switcher keyboard accessible
   - [ ] Screen reader compatible
   - [ ] ARIA labels where appropriate

---

## 📊 **Testing Checklist**

### **Manual Testing Steps**

1. **Initial Load**
   ```
   ✅ Open app in Korean browser → UI shows in Korean
   ✅ Open app in English browser → UI shows in English  
   ✅ Open app in other language browser → UI shows in English (default)
   ```

2. **Language Switching**
   ```
   ✅ Click US flag → All text changes to English
   ✅ Click Korean flag → All text changes to Korean
   ✅ Refresh page → Language persists
   ✅ Open new tab → Language persists
   ```

3. **Component Coverage**
   ```
   ✅ Toolbar buttons: Save, Preview, Publish, Settings
   ✅ Section names: Hero, Content, CTA
   ✅ Properties: Background, Text, Colors, Layout
   ✅ Form labels: Name, Email, Phone placeholders
   ✅ Messages: Success, Error, Info notifications
   ✅ Modals: Confirm dialogs, Settings panels
   ```

### **Automated Testing**
```typescript
// Example test cases to implement
describe('Internationalization', () => {
  test('loads English by default', () => {});
  test('switches to Korean when flag clicked', () => {});
  test('persists language in localStorage', () => {});
  test('handles missing translations gracefully', () => {});
  test('shows loading state during language switch', () => {});
});
```

---

## 🚀 **Deployment Requirements**

### **Environment Variables**
No additional environment variables required.

### **Build Process**  
- Translation files are statically imported
- No additional build steps required
- Verify bundle size increase acceptable

### **Performance Monitoring**
- Monitor translation loading times
- Track language switch conversion rates  
- Monitor for missing translation warnings in logs

---

## 📅 **Timeline & Milestones**

### **Phase 1: Foundation 
- ✅ Create type definitions
- ✅ Implement core i18n functions  
- ✅ Create translation files (en.json, ko.json)

### **Phase 2: React Integration 
- ✅ Build I18nProvider context
- ✅ Create LanguageSwitcher component
- ✅ Integrate with app layout

### **Phase 3: Component Updates 
- ✅ Update Toolbar component
- ✅ Update PropertyPanel component
- ✅ Update form components
- ✅ Update modal components

### **Phase 4: Testing & Polish 
- ✅ Manual testing all components
- ✅ Browser compatibility testing
- ✅ Performance optimization
- ✅ Documentation updates

---

## 🐛 **Known Issues & Limitations**

### **Current Limitations**
- Only supports English and Korean (extensible for more languages)
- No plural form handling (add if needed in future)
- No date/number formatting (not required for current scope)
- No RTL language support (not needed for Korean/English)

### **Future Enhancements** (Out of Scope)
- Generated landing page content translation
- Dynamic content translation
- Translation management interface
- Professional translation service integration

---

## 📞 **Support & Questions**

For technical questions during implementation:
- Check existing component patterns in `/src/components`
- Follow established TypeScript conventions  
- Test language switching in multiple browsers
- Ensure all text is translatable (no hardcoded strings)

**Critical Success Factors:**
1. Zero hardcoded strings in components after implementation
2. Smooth, instant language switching experience
3. Complete translation coverage for builder interface
4. Professional flag-based switcher in header
5. Persistent language preference across sessions