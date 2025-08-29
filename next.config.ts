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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://www.googletagmanager.com https://www.google-analytics.com https://cdnjs.cloudflare.com https://pagead2.googlesyndication.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://vercel.live wss://vercel.live https://vitals.vercel-insights.com https://api.resend.com https://easy-landing-omega.vercel.app https://res.cloudinary.com",
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