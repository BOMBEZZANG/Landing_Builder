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
  other: {
    'google-adsense-account': 'ca-pub-2598779635969436',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google AdSense Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2598779635969436"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        
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
