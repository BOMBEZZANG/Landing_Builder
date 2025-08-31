import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import FontLoader from "@/components/design/FontLoader";
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
  other: {
    'google-adsense-account': 'ca-pub-2598779635969436',
  },
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
        {/* Google Analytics 4 */}
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FontLoader />
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
