import { NextResponse } from 'next/server';
import { generateAdsTxtContent, shouldGenerateAdsTxt } from '@/lib/ads-txt-generator';

export async function GET() {
  if (!shouldGenerateAdsTxt()) {
    return new NextResponse('AdSense is not configured', { status: 404 });
  }

  const content = generateAdsTxtContent();
  
  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
}