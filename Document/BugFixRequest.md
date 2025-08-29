# Bug Fix Request: Google AdSense & Analytics Integration Issues

## Project: kanomsoft.com (Landing Page Builder)
**Date:** August 29, 2025  
**Priority:** High  
**Environment:** Production (Vercel Hosting)

---

## 🔴 Critical Issues Summary

### Issue #1: Content Security Policy (CSP) Blocking Google Services
**Severity:** Critical  
**Impact:** AdSense verification failing, Analytics not tracking

### Issue #2: Duplicate AdSense Initialization
**Severity:** High  
**Impact:** Console errors, potential ad serving issues

### Issue #3: Firebase Analytics Not Loading
**Severity:** High  
**Impact:** No user tracking data

---

## 📋 Detailed Issues & Solutions

### 1. CSP Configuration Update Required

**Current Problem:**
```
Refused to load script from 'https://pagead2.googlesyndication.com/...' 
because it violates the Content Security Policy directive
```

**Required Fix - Update `next.config.js`:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' " +
                "https://vercel.live " +
                "https://*.google.com " +
                "https://*.googleapis.com " +
                "https://*.gstatic.com " +
                "https://*.google-analytics.com " +
                "https://*.googletagmanager.com " +
                "https://pagead2.googlesyndication.com " +
                "https://tpc.googlesyndication.com " +
                "https://*.googleadservices.com " +
                "https://*.googlesyndication.com " +
                "https://*.doubleclick.net " +
                "https://cdnjs.cloudflare.com",
              "connect-src 'self' " +
                "https://vercel.live wss://vercel.live " +
                "https://vitals.vercel-insights.com " +
                "https://api.resend.com " +
                "https://easy-landing-omega.vercel.app " +
                "https://res.cloudinary.com " +
                "https://*.google.com " +
                "https://*.googleapis.com " +
                "https://*.google-analytics.com " +
                "https://*.analytics.google.com " +
                "https://*.googletagmanager.com " +
                "https://*.gstatic.com " +
                "https://*.googlesyndication.com " +
                "https://*.googleadservices.com " +
                "https://*.doubleclick.net " +
                "https://ep1.adtrafficquality.google " +
                "https://ep2.adtrafficquality.google " +
                "https://firebaseinstallations.googleapis.com " +
                "https://firebaselogging.googleapis.com " +
                "https://firebase.googleapis.com",
              "frame-src 'self' " +
                "https://googleads.g.doubleclick.net " +
                "https://tpc.googlesyndication.com " +
                "https://*.google.com " +
                "https://*.googlesyndication.com " +
                "https://*.safeframe.googlesyndication.com " +
                "https://www.google.com",
              "img-src 'self' data: blob: https:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com"
            ].join('; ')
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig;
```

### 2. Fix Duplicate AdSense Initialization

**Current Problem:**
```
Uncaught TagError: adsbygoogle.push() error: 
Only one 'enable_page_level_ads' allowed per page.
```

**Required Fix - Update `app/layout.tsx`:**
```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* AdSense Meta Tags */}
        <meta name="google-adsense-platform-account" content="ca-pub-2598779635969436" />
        <meta name="google-adsense-platform-domain" content="kanomsoft.com" />
        
        {/* AdSense Script - Load Once */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2598779635969436"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <I18nProvider>
          {children}
        </I18nProvider>
        
        {/* AdSense Auto Ads - Initialize Once */}
        <Script
          id="adsense-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent duplicate initialization
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

**Required Fix - Update `src/lib/adsense.ts`:**
```javascript
export function generateAdSenseAutoAds(): string {
  const config = getAdSenseConfig();
  
  if (!config.clientId) {
    return '';
  }
  
  return `
    <!-- AdSense Auto Ads -->
    <script>
      // Prevent duplicate initialization in generated HTML
      if (!window.adsenseInitialized) {
        window.adsenseInitialized = true;
        (adsbygoogle = window.adsbygoogle || []).push({
          google_ad_client: "${config.clientId}",
          enable_page_level_ads: true
        });
      }
    </script>`;
}
```

### 3. Environment Variables Verification

**Required in Vercel Dashboard:**
```bash
# AdSense Configuration
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-2598779635969436

# Firebase Configuration (Note: MEASUREMENT_ID with underscore)
NEXT_PUBLIC_FIREBASE_API_KEY=[your-api-key]
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=[your-auth-domain]
NEXT_PUBLIC_FIREBASE_PROJECT_ID=[your-project-id]
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=[your-storage-bucket]
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=[your-sender-id]
NEXT_PUBLIC_FIREBASE_APP_ID=[your-app-id]
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=[your-measurement-id]  # G-XXXXXXXXXX

# Google Analytics (optional if using Firebase)
NEXT_PUBLIC_GA_ID=[your-ga-id]
```

---

## 🔍 Files to Review and Clean Up

Please check and remove duplicate AdSense initialization code from:
- [ ] `src/lib/html-generator/index.ts`
- [ ] `src/components/builder/PublishModal.tsx`
- [ ] Any other component files with AdSense code

---

## ✅ Testing Checklist

After implementing fixes:

1. **Local Testing:**
   ```bash
   npm run dev
   # Open browser console and check for errors
   ```

2. **Deployment:**
   ```bash
   git add .
   git commit -m "Fix: CSP configuration and AdSense duplicate initialization"
   git push
   ```

3. **Production Verification:**
   - Visit https://kanomsoft.com
   - Open Developer Console (F12)
   - Run validation script:
   ```javascript
   // Should all return true without errors
   console.log('AdSense loaded:', typeof adsbygoogle !== 'undefined');
   console.log('AdSense initialized:', window.adsenseInitialized === true);
   console.log('GA/gtag loaded:', typeof gtag !== 'undefined');
   ```

4. **AdSense Verification:**
   - Visit https://kanomsoft.com/api/verify-adsense?domain=kanomsoft.com
   - All checks should pass
   - Retry AdSense verification in Google AdSense dashboard

---

## 📊 Expected Outcomes

- ✅ No CSP errors in browser console
- ✅ AdSense verification succeeds
- ✅ Analytics starts tracking visitors
- ✅ ads.txt and robots.txt accessible
- ✅ No duplicate initialization errors

---