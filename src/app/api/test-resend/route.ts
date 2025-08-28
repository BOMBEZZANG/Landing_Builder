import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipientEmail, testMessage } = body;

    if (!recipientEmail) {
      return NextResponse.json({ error: 'recipientEmail is required' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    console.log('Testing email send to:', recipientEmail);
    console.log('Using from address:', process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev');
    
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
      to: recipientEmail,
      subject: `Test Email - ${new Date().toLocaleString()}`,
      html: `
        <h2>Test Email</h2>
        <p><strong>Recipient:</strong> ${recipientEmail}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Message:</strong> ${testMessage || 'This is a test email from Resend API'}</p>
        <p><strong>From Address:</strong> ${process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev'}</p>
      `,
      text: `Test Email\n\nRecipient: ${recipientEmail}\nTime: ${new Date().toLocaleString()}\nMessage: ${testMessage || 'This is a test email from Resend API'}`
    });

    console.log('Resend API response:', JSON.stringify(result, null, 2));

    if (result.error) {
      console.error('Resend API error:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error,
        details: 'Check console logs for full error details'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      emailId: result.data?.id,
      recipient: recipientEmail,
      fromAddress: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test email error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Resend Test API',
    usage: 'POST with { recipientEmail: "email@domain.com", testMessage?: "optional message" }',
    environment: {
      hasApiKey: !!process.env.RESEND_API_KEY,
      fromAddress: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev'
    }
  });
}