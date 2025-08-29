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
  return (
    <html lang="en">
      <head>
        {/* Google AdSense Verification Meta Tags */}
        <meta name="google-adsense-platform-account" content="ca-pub-2598779635969436" />
        <meta name="google-adsense-platform-domain" content="kanomsoft.com" />
        
        {/* Google AdSense Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2598779635969436"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider>
          {children}
        </I18nProvider>
        
        {/* AdSense Auto Ads */}
        <Script
          id="adsense-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (adsbygoogle = window.adsbygoogle || []).push({
                google_ad_client: "ca-pub-2598779635969436",
                enable_page_level_ads: true
              });
            `
          }}
        />
      </body>
    </html>
  );
}
