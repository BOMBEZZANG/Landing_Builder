import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Debug endpoint only available in development' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      hasResendKey: !!process.env.RESEND_API_KEY,
      resendKeyLength: process.env.RESEND_API_KEY?.length || 0,
      resendKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10) || 'not set',
      fromAddress: process.env.EMAIL_FROM_ADDRESS || 'not set',
      fromName: process.env.EMAIL_FROM_NAME || 'not set'
    },
    message: 'Environment debug info'
  });
}