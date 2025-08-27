import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { validateEmail } from '@/utils/validation';

export async function POST(request: NextRequest) {
  console.log('📧 Test email API called');
  console.log('Environment check:', {
    hasResendKey: !!process.env.RESEND_API_KEY,
    fromAddress: process.env.EMAIL_FROM_ADDRESS || 'not set'
  });

  try {
    const { email } = await request.json();
    console.log('📨 Request email:', email);

    // Validate email address
    const validation = validateEmail(email);
    if (!validation.isValid) {
      console.log('❌ Email validation failed:', validation.error);
      return NextResponse.json(
        { error: validation.error || 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log('✅ Resend initialized');

    // Send test email using Resend
    console.log('📤 Sending email to:', email);
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || 'Landing Builder <noreply@landing-builder.com>',
      to: [email],
      subject: 'Test Email - Landing Page Form Configuration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; margin: 0;">✅ Email Configuration Successful!</h1>
          </div>
          
          <div style="background: #F8FAFC; border-radius: 8px; padding: 24px; margin: 20px 0;">
            <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5;">
              <strong>Great news!</strong> Your email is properly configured to receive form submissions from your landing page.
            </p>
            <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #64748B;">
              When visitors submit the form on your landing page, you'll receive their information at this email address.
            </p>
          </div>

          <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 12px 0; color: #1E40AF; font-size: 18px;">What's next?</h3>
            <ul style="margin: 0; padding-left: 20px; color: #374151;">
              <li style="margin-bottom: 8px;">Complete your landing page design</li>
              <li style="margin-bottom: 8px;">Configure your form fields</li>
              <li style="margin-bottom: 8px;">Publish your page</li>
              <li style="margin-bottom: 0;">Share the link with your audience</li>
            </ul>
          </div>

          <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="margin: 0 0 12px 0; color: #374151;">📧 Email Flow Preview</h4>
            <div style="display: flex; align-items: center; justify-content: space-between; text-align: center;">
              <div style="flex: 1;">
                <div style="width: 40px; height: 40px; background: #E5E7EB; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                  👤
                </div>
                <span style="font-size: 12px; color: #6B7280;">Visitor</span>
              </div>
              <div style="flex: 1; padding: 0 16px;">
                <div style="height: 2px; background: #D1D5DB; position: relative;">
                  <div style="position: absolute; right: -6px; top: -3px; width: 0; height: 0; border-left: 8px solid #D1D5DB; border-top: 4px solid transparent; border-bottom: 4px solid transparent;"></div>
                </div>
              </div>
              <div style="flex: 1;">
                <div style="width: 40px; height: 40px; background: #E5E7EB; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;">
                  📝
                </div>
                <span style="font-size: 12px; color: #6B7280;">Form</span>
              </div>
              <div style="flex: 1; padding: 0 16px;">
                <div style="height: 2px; background: #3B82F6; position: relative;">
                  <div style="position: absolute; right: -6px; top: -3px; width: 0; height: 0; border-left: 8px solid #3B82F6; border-top: 4px solid transparent; border-bottom: 4px solid transparent;"></div>
                </div>
              </div>
              <div style="flex: 1;">
                <div style="width: 40px; height: 40px; background: #3B82F6; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;">
                  📧
                </div>
                <span style="font-size: 12px; color: #3B82F6; font-weight: 600;">You</span>
              </div>
            </div>
          </div>

          <hr style="border: none; height: 1px; background: #E5E7EB; margin: 30px 0;" />
          
          <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
            This is a test email from Landing Page Builder. If you didn't request this, please ignore it.
          </p>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #64748B; font-size: 14px; margin: 0;">
              Built with ❤️ by Landing Page Builder
            </p>
          </div>
        </div>
      `,
      text: `
✅ Email Configuration Successful!

Great! Your email is properly configured to receive form submissions from your landing page.

When visitors submit the form on your landing page, you'll receive their information at this email address.

What's next?
- Complete your landing page design
- Configure your form fields  
- Publish your page
- Share the link with your audience

This is a test email from Landing Page Builder. If you didn't request this, please ignore it.
      `
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // More specific error messages based on Resend error types
      let errorMessage = 'Failed to send test email. Please try again.';
      if (error.message) {
        if (error.message.includes('API key')) {
          errorMessage = 'Invalid API key. Please check your Resend configuration.';
        } else if (error.message.includes('domain')) {
          errorMessage = 'Email domain not verified. Please verify your domain in Resend.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Rate limit exceeded. Please try again in a moment.';
        } else if (error.message.includes('testing emails') || error.statusCode === 403) {
          errorMessage = 'Email service is in testing mode. Please verify your domain at resend.com/domains or contact the administrator.';
        } else {
          errorMessage = `Resend API error: ${error.message}`;
        }
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    console.log('✅ Test email sent successfully:', data?.id);
    
    return NextResponse.json({ 
      success: true,
      emailId: data?.id,
      message: 'Test email sent successfully!'
    });

  } catch (error) {
    console.error('❌ Test email endpoint error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    let errorMessage = 'Failed to send test email';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific error types
      if (error.message.includes('fetch')) {
        errorMessage = 'Network error contacting email service. Please check your internet connection.';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Invalid request format. Please try again.';
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        success: false,
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : String(error) : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to send test emails.' },
    { status: 405 }
  );
}