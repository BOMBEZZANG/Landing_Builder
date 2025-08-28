import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET(request: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  };

  // Check environment variables
  const config = {
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    RESEND_API_KEY_LENGTH: process.env.RESEND_API_KEY?.length || 0,
    RESEND_API_KEY_PREFIX: process.env.RESEND_API_KEY?.substring(0, 7) || 'NOT_SET',
    EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS || 'NOT_SET',
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
  };

  return NextResponse.json({
    message: 'Email Configuration Debug Info',
    config,
    timestamp: new Date().toISOString()
  }, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  };

  try {
    const body = await request.json();
    const recipientEmail = body.recipientEmail || 'bombezzang100@gmail.com';

    // Initialize Resend
    let resend: Resend | null = null;
    let resendError = null;
    
    if (process.env.RESEND_API_KEY) {
      try {
        resend = new Resend(process.env.RESEND_API_KEY);
      } catch (e) {
        resendError = e instanceof Error ? e.message : 'Failed to initialize Resend';
      }
    }

    // Test email sending
    let emailResult = null;
    let emailError = null;

    if (resend) {
      try {
        emailResult = await resend.emails.send({
          from: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
          to: recipientEmail,
          subject: 'Debug Test Email from Landing Page Builder',
          html: `
            <h2>Debug Test Email</h2>
            <p>This is a test email sent from the debug endpoint.</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>Environment:</strong> ${process.env.VERCEL_ENV || 'unknown'}</p>
            <hr>
            <p>If you received this email, your email configuration is working correctly!</p>
          `,
          text: `Debug Test Email\n\nThis is a test email sent from the debug endpoint.\n\nTimestamp: ${new Date().toISOString()}\nEnvironment: ${process.env.VERCEL_ENV || 'unknown'}\n\nIf you received this email, your email configuration is working correctly!`
        });
      } catch (e) {
        emailError = e instanceof Error ? {
          message: e.message,
          stack: e.stack,
          name: e.name
        } : 'Unknown email error';
      }
    }

    return NextResponse.json({
      success: !!emailResult?.data?.id,
      debug: {
        resendInitialized: !!resend,
        resendError,
        apiKeyPresent: !!process.env.RESEND_API_KEY,
        apiKeyLength: process.env.RESEND_API_KEY?.length || 0,
        fromAddress: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
        recipientEmail,
        emailResult: emailResult?.data,
        emailError,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          VERCEL_ENV: process.env.VERCEL_ENV,
        }
      }
    }, { headers: corsHeaders });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  };
  
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}