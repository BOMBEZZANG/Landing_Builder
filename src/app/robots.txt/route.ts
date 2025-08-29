import { NextResponse } from 'next/server';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Mediapartners-Google
Allow: /

Sitemap: https://kanomsoft.com/sitemap.xml`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}