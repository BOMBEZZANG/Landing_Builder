import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  
  // Webpack 설정 - 개발 모드에서 eval 사용 최소화
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // eval 대신 다른 devtool 사용
      config.devtool = 'cheap-module-source-map';
    }
    return config;
  },

  async headers() {
    const cspHeader = isDev 
      ? [
          // 개발환경 - 더 관대한 CSP
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://www.googletagmanager.com https://www.google-analytics.com https://cdnjs.cloudflare.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
          "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
          "img-src 'self' data: blob: https:",
          "connect-src 'self' https://vercel.live wss://vercel.live https://vitals.vercel-insights.com https://api.resend.com https://easy-landing-omega.vercel.app https://res.cloudinary.com wss://localhost:* ws://localhost:*",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self' https:",
          "frame-ancestors 'none'",
          "upgrade-insecure-requests"
        ].join('; ')
      : [
          // 프로덕션환경 - 더 엄격한 CSP (하지만 여전히 unsafe-eval 허용)
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://www.googletagmanager.com https://www.google-analytics.com https://cdnjs.cloudflare.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
          "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
          "img-src 'self' data: blob: https:",
          "connect-src 'self' https://vercel.live https://vitals.vercel-insights.com https://api.resend.com https://easy-landing-omega.vercel.app https://res.cloudinary.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self' https:",
          "frame-ancestors 'none'",
          "upgrade-insecure-requests"
        ].join('; ');

    return [
      {
        // Apply these headers to all routes in your application.
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader
          },
          // CORS 헤더 추가 (필요한 경우)
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ],
      },
    ];
  },

  // 이미지 최적화 설정 (Cloudinary 사용시)
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // 실험적 기능 (필요한 경우)
  experimental: {
    // 개발 성능 향상을 위한 설정들
    optimizeCss: !isDev,
    scrollRestoration: true,
  }
};

export default nextConfig;