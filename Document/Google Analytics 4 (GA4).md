# Development Request: Migrate from Firebase Analytics to Google Analytics 4 (GA4)

## Project: kanomsoft.com (Landing Page Builder)
**Date:** August 29, 2025  
**Priority:** High  
**Reason:** Firebase Analytics connection issues, simplify analytics implementation  
**Environment:** Production (Vercel Hosting)

---

## 📋 Objective

Replace Firebase Analytics with direct Google Analytics 4 (GA4) implementation to resolve connectivity issues and simplify the analytics setup.

---

## 🔄 Migration Plan

### Phase 1: Remove Firebase Analytics
### Phase 2: Implement GA4 Directly
### Phase 3: Update Landing Page Generator
### Phase 4: Testing & Verification

---

## 📝 Detailed Implementation Steps

### 1. Environment Variables Update

**Remove from Vercel Dashboard:**
```bash
# Remove these Firebase-specific variables (keep others if needed for other Firebase services)
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID  # Move this value to GA4_MEASUREMENT_ID
```

**Add to Vercel Dashboard:**
```bash
# Google Analytics 4
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX  # Use the same ID from Firebase
```

### 2. Update Main Application (`app/layout.tsx`)

**Replace current Firebase Analytics with GA4:**

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Landing Page Builder",
  description: "Create beautiful landing pages with drag and drop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  
  return (
    <html lang="en">
      <head>
        {/* Google AdSense - Keep existing */}
        <meta name="google-adsense-platform-account" content="ca-pub-2598779635969436" />
        <meta name="google-adsense-platform-domain" content="kanomsoft.com" />
        
        {/* Google AdSense Script - Keep existing */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2598779635969436"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        {/* Google Analytics 4 - NEW */}
        {GA4_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics-4" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA4_ID}', {
                  page_path: window.location.pathname,
                  debug_mode: ${process.env.NODE_ENV === 'development'}
                });
                
                // Log initialization
                console.log('GA4 initialized with ID:', '${GA4_ID}');
                
                // Track Web Vitals
                if (typeof window !== 'undefined') {
                  window.addEventListener('load', () => {
                    gtag('event', 'page_view_complete', {
                      event_category: 'Web Vitals',
                      value: performance.now()
                    });
                  });
                }
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <I18nProvider>
          {children}
        </I18nProvider>
        
        {/* AdSense Auto Ads - Keep existing */}
        <Script
          id="adsense-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && !window.adsenseInitialized) {
                window.adsenseInitialized = true;
                (adsbygoogle = window.adsbygoogle || []).push({
                  google_ad_client: "ca-pub-2598779635969436",
                  enable_page_level_ads: true
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
```

### 3. Create GA4 Analytics Service (`src/lib/ga4-analytics.ts`)

**New file for GA4 utilities:**

```typescript
// src/lib/ga4-analytics.ts

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export function getGA4Config() {
  return {
    measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
  };
}

/**
 * Generate GA4 script for static HTML pages
 */
export function generateGA4Script(): string {
  const config = getGA4Config();
  
  if (!config.measurementId) {
    console.warn('GA4 Measurement ID is not configured.');
    return '';
  }
  
  return `
    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${config.measurementId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${config.measurementId}');
      
      // Track page view
      gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      });
      
      // Track form submissions
      document.addEventListener('DOMContentLoaded', function() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
          form.addEventListener('submit', function(e) {
            gtag('event', 'form_submit', {
              event_category: 'engagement',
              event_label: form.id || 'contact_form'
            });
          });
        });
        
        // Track button clicks
        const buttons = document.querySelectorAll('button, a.btn, a[role="button"]');
        buttons.forEach(button => {
          button.addEventListener('click', function() {
            const buttonText = button.textContent || button.innerText || 'Unknown';
            gtag('event', 'click', {
              event_category: 'engagement',
              event_label: buttonText.trim().substring(0, 100)
            });
          });
        });
      });
      
      console.log('GA4 Analytics initialized');
    </script>`;
}

/**
 * Track custom events in the application
 */
export function trackEvent(
  eventName: string,
  parameters?: Record<string, any>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
}

/**
 * Track page views for SPAs
 */
export function trackPageView(url?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID!, {
      page_path: url || window.location.pathname,
    });
  }
}
```

### 4. Update HTML Generator (`src/lib/html-generator/index.ts`)

**Remove Firebase, Add GA4:**

```typescript
// In src/lib/html-generator/index.ts

import { generateGA4Script } from '@/lib/ga4-analytics';
// Remove: import { generateFirebaseAnalyticsScript } from '@/lib/firebase';

// Update the combineHTML method:
private combineHTML(base: string, sections: string, css: string, js: string): string {
  // Generate GA4 script if analytics is enabled
  const analyticsScript = this.options.includeAnalytics ? generateGA4Script() : '';
  
  // Generate AdSense scripts if AdSense is enabled
  const adSenseHead = this.options.includeAdSense ? generateAdSenseScript() : '';
  const adSenseBody = this.options.includeAdSense ? generateAdSenseAutoAds() : '';
  
  return base
    .replace('<!-- STYLES_PLACEHOLDER -->', `<style>\n${css}\n</style>`)
    .replace('<!-- ANALYTICS_PLACEHOLDER -->', analyticsScript)  // Changed from FIREBASE_ANALYTICS_PLACEHOLDER
    .replace('<!-- ADSENSE_HEAD_PLACEHOLDER -->', adSenseHead)
    .replace('<!-- CONTENT_PLACEHOLDER -->', sections)
    .replace('<!-- SCRIPTS_PLACEHOLDER -->', js)
    .replace('<!-- ADSENSE_BODY_PLACEHOLDER -->', adSenseBody);
}

// Update generateAnalytics method:
private generateAnalytics(): string {
  const gaId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  if (!gaId) return '';
  
  return `
    // Google Analytics 4 Events
    if (typeof gtag !== 'undefined') {
      // Track scroll depth
      let scrollDepthTracked = false;
      window.addEventListener('scroll', function() {
        const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
        if (scrollPercent > 0.75 && !scrollDepthTracked) {
          gtag('event', 'scroll_depth', {
            event_category: 'engagement',
            event_label: '75%'
          });
          scrollDepthTracked = true;
        }
      });
      
      // Track time on page
      setTimeout(function() {
        gtag('event', 'time_on_page', {
          event_category: 'engagement',
          value: 30,
          event_label: '30_seconds'
        });
      }, 30000);
    }`;
}
```

### 5. Remove/Clean Firebase Files

**Files to update/clean:**

```typescript
// src/lib/firebase.ts - Remove or comment out analytics-related code
export function getFirebaseConfig() {
  return {
    // Keep other Firebase config if needed for other services
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    // measurementId: REMOVED - using GA4 directly now
  };
}

// Remove or comment out generateFirebaseAnalyticsScript function
// export function generateFirebaseAnalyticsScript(): string { ... }
```

### 6. Create Analytics Hook (Optional Enhancement)

**`src/hooks/useAnalytics.ts`:**

```typescript
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView, trackEvent } from '@/lib/ga4-analytics';

export function useAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return {
    trackEvent,
    trackPageView
  };
}
```

### 7. Testing Component

**Create `app/test-analytics/page.tsx`:**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/ga4-analytics';

export default function TestAnalytics() {
  const [analyticsStatus, setAnalyticsStatus] = useState<string>('Checking...');

  useEffect(() => {
    const checkAnalytics = () => {
      if (typeof window !== 'undefined') {
        const status = {
          gtag: typeof window.gtag !== 'undefined',
          dataLayer: Array.isArray(window.dataLayer),
          measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
        };
        
        setAnalyticsStatus(JSON.stringify(status, null, 2));
        console.log('Analytics Status:', status);
      }
    };

    // Check after a delay to ensure scripts are loaded
    setTimeout(checkAnalytics, 2000);
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">GA4 Analytics Test Page</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Analytics Status:</h2>
          <pre className="text-sm">{analyticsStatus}</pre>
        </div>

        <div className="space-x-4">
          <button
            onClick={() => {
              trackEvent('test_button_click', {
                event_category: 'test',
                event_label: 'Test Button 1'
              });
              alert('Event sent: test_button_click');
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Send Test Event
          </button>

          <button
            onClick={() => {
              trackEvent('form_submit', {
                event_category: 'test',
                form_name: 'test_form'
              });
              alert('Event sent: form_submit');
            }}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test Form Submit Event
          </button>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm">
            After clicking buttons, check Google Analytics Real-time reports at:
            <br />
            <a 
              href="https://analytics.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              https://analytics.google.com → Reports → Real-time
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ Testing Checklist

1. **Environment Variable Setup**
   - [ ] Add `NEXT_PUBLIC_GA4_MEASUREMENT_ID` to Vercel
   - [ ] Redeploy after adding environment variable

2. **Code Implementation**
   - [ ] Update `app/layout.tsx`
   - [ ] Create `src/lib/ga4-analytics.ts`
   - [ ] Update HTML generator
   - [ ] Clean up Firebase analytics code

3. **Verification Steps**
   ```bash
   # Local testing
   npm run dev
   # Visit http://localhost:3000/test-analytics
   ```

4. **Production Verification**
   - [ ] Visit https://kanomsoft.com
   - [ ] Open browser console
   - [ ] Check for "GA4 initialized" message
   - [ ] No Firebase Analytics errors

5. **Google Analytics Verification**
   - [ ] Go to Google Analytics
   - [ ] Check Real-time → Overview
   - [ ] Verify your visit appears
   - [ ] Test events are recorded

---

## 📊 Expected Outcomes

- ✅ GA4 successfully tracks page views
- ✅ Custom events work properly
- ✅ No Firebase Analytics errors
- ✅ Generated landing pages include GA4
- ✅ Real-time data visible in Google Analytics
- ✅ No conflicts with AdSense

---

## 🚨 Important Notes

1. **GA4 Property Setup**: Ensure GA4 property is created in Google Analytics
2. **Measurement ID Format**: Must be `G-XXXXXXXXXX` format (not `UA-`)
3. **Data Processing**: GA4 may take 24-48 hours to show full data
4. **Debug Mode**: Available in development environment for testing
5. **Privacy Compliance**: Update privacy policy to mention GA4 usage



스트림 이름
landing-pages-deploy
스트림 URL
https://kanomsoft.com
스트림 ID
12080907954
측정 ID
G-ZPJYKFHFBX
---