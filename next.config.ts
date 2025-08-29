import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.google.com https://*.googleapis.com https://*.gstatic.com https://*.google-analytics.com https://*.googletagmanager.com https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://*.googleadservices.com https://*.googlesyndication.com https://*.doubleclick.net https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://cdnjs.cloudflare.com",
              "connect-src 'self' https://vercel.live wss://vercel.live https://vitals.vercel-insights.com https://api.resend.com https://easy-landing-omega.vercel.app https://res.cloudinary.com https://*.google.com https://*.googleapis.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.gstatic.com https://*.googlesyndication.com https://*.googleadservices.com https://*.doubleclick.net https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://firebaseinstallations.googleapis.com https://firebaselogging.googleapis.com https://firebase.googleapis.com",
              "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.google.com https://*.googlesyndication.com https://*.safeframe.googlesyndication.com https://www.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https:",
              "frame-ancestors 'none'",
            ].join('; ')
          },
        ],
      },
    ];
  },
};

export default nextConfig;