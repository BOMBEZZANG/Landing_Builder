'use client';

import React from 'react';
import Link from "next/link";
import { useTranslation } from '@/components/i18n/I18nProvider';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

const translations = {
  en: {
    title: 'Landing Page Builder',
    subtitle: 'Create beautiful, professional landing pages in minutes without any coding knowledge. Simple, fast, and built for results.',
    features: {
      fast: {
        title: 'Lightning Fast',
        description: 'Build your landing page in under 10 minutes with our intuitive drag-and-drop interface.'
      },
      noCode: {
        title: 'No Code Required',
        description: 'Visual editor with inline editing. No technical skills needed to create professional pages.'
      },
      mobile: {
        title: 'Mobile Ready',
        description: 'All pages are automatically optimized for mobile devices and tablets.'
      }
    },
    cta: {
      button: 'Start Building Now',
      subtitle: 'No signup required • Start creating immediately'
    }
  },
  ko: {
    title: '랜딩 페이지 빌더',
    subtitle: '5분 만에 빠르게 아름답고 전문적인 랜딩 페이지를 만드세요.',
    features: {
      fast: {
        title: '초고속',
        description: '직관적인 드래그 앤 드롭 인터페이스로 5분 안에 랜딩 페이지를 만드세요.'
      },
      noCode: {
        title: 'No 코딩',
        description: '직접 편집이 가능한 비주얼 에디터. 전문적인 페이지를 만드는 데 기술적 지식이 필요 없습니다.'
      },
      mobile: {
        title: '모바일 최적화',
        description: '모든 페이지는 모바일 기기와 태블릿에 자동으로 최적화됩니다.'
      }
    },
    cta: {
      button: '지금 시작하기',
      subtitle: '회원가입 불필요 • 즉시 제작 시작'
    }
  }
};

export default function HomePage() {
  const { locale } = useTranslation();
  const t = translations[locale];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              {t.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.features.fast.title}</h3>
              <p className="text-gray-600">{t.features.fast.description}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.features.noCode.title}</h3>
              <p className="text-gray-600">{t.features.noCode.description}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.features.mobile.title}</h3>
              <p className="text-gray-600">{t.features.mobile.description}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Link
              href="/builder"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {t.cta.button}
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            
            <p className="text-sm text-gray-500">
              {t.cta.subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}