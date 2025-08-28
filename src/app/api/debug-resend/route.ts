import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  };

  try {
    const body = await request.json();
    const { recipientEmail } = body;

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'recipientEmail is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check environment configuration
    const config = {
      hasApiKey: !!process.env.RESEND_API_KEY,
      apiKeyLength: process.env.RESEND_API_KEY?.length || 0,
      fromAddress: process.env.EMAIL_FROM_ADDRESS || 'not configured',
      fromName: process.env.EMAIL_FROM_NAME || 'not configured'
    };

    console.log('Email configuration:', config);
    console.log('Recipient email:', recipientEmail);

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { 
          error: 'RESEND_API_KEY not configured',
          config 
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // Validate from address format
    const fromAddress = process.env.EMAIL_FROM_ADDRESS || '';
    if (!fromAddress.includes('@')) {
      return NextResponse.json(
        { 
          error: `Invalid EMAIL_FROM_ADDRESS format: "${fromAddress}". Must be a valid email address like "noreply@kanomsoft.com"`,
          config 
        },
        { status: 500, headers: corsHeaders }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    console.log(`Attempting to send email from ${fromAddress} to ${recipientEmail}...`);
    
    try {
      const result = await resend.emails.send({
        from: fromAddress,
        to: recipientEmail,
        subject: `Debug Test - ${new Date().toISOString()}`,
        html: `
          <h2>Debug Email Test</h2>
          <p>This is a test email to verify the email configuration.</p>
          <hr>
          <h3>Configuration Details:</h3>
          <ul>
            <li><strong>From Address:</strong> ${fromAddress}</li>
            <li><strong>To Address:</strong> ${recipientEmail}</li>
            <li><strong>From Name:</strong> ${process.env.EMAIL_FROM_NAME || 'not set'}</li>
            <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
            <li><strong>Domain:</strong> ${fromAddress.split('@')[1]}</li>
          </ul>
          <hr>
          <h3>Checklist for Domain Setup:</h3>
          <ul>
            <li>✅ Domain added to Resend dashboard</li>
            <li>✅ DNS records configured (SPF, DKIM, DMARC)</li>
            <li>✅ Domain verified in Resend</li>
            <li>✅ EMAIL_FROM_ADDRESS uses full email format</li>
          </ul>
          <p>If you don't receive this email, check:</p>
          <ol>
            <li>Domain verification status in Resend dashboard</li>
            <li>DNS propagation (may take up to 48 hours)</li>
            <li>Spam/junk folder</li>
            <li>Email logs in Resend dashboard</li>
          </ol>
        `,
        text: `Debug Email Test\n\nFrom: ${fromAddress}\nTo: ${recipientEmail}\nTimestamp: ${new Date().toISOString()}`
      });

      console.log('Resend API response:', JSON.stringify(result, null, 2));

      if (result.error) {
        console.error('Resend API error:', result.error);
        return NextResponse.json(
          {
            success: false,
            error: result.error,
            config,
            suggestion: 'Check if your domain is verified in Resend dashboard'
          },
          { status: 400, headers: corsHeaders }
        );
      }

      return NextResponse.json(
        {
          success: true,
          emailId: result.data?.id,
          message: 'Email sent successfully',
          recipient: recipientEmail,
          from: fromAddress,
          config,
          debugInfo: {
            timestamp: new Date().toISOString(),
            resendResponse: result.data
          }
        },
        { headers: corsHeaders }
      );

    } catch (sendError: any) {
      console.error('Email send error:', sendError);
      
      // Parse specific Resend errors
      let errorDetails = 'Unknown error';
      let suggestion = '';
      
      if (sendError.message?.includes('domain')) {
        errorDetails = 'Domain verification issue';
        suggestion = 'Ensure your domain is verified in Resend dashboard and DNS records are properly configured';
      } else if (sendError.message?.includes('from')) {
        errorDetails = 'Invalid from address';
        suggestion = 'Check EMAIL_FROM_ADDRESS format (should be like noreply@kanomsoft.com)';
      } else if (sendError.statusCode === 401) {
        errorDetails = 'API key authentication failed';
        suggestion = 'Verify your RESEND_API_KEY is correct and active';
      }
      
      return NextResponse.json(
        {
          success: false,
          error: sendError.message || 'Failed to send email',
          errorDetails,
          suggestion,
          config,
          statusCode: sendError.statusCode,
          response: sendError.response
        },
        { status: 500, headers: corsHeaders }
      );
    }

  } catch (error) {
    console.error('Debug endpoint error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET() {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  };

  const config = {
    hasApiKey: !!process.env.RESEND_API_KEY,
    fromAddress: process.env.EMAIL_FROM_ADDRESS || 'not configured',
    fromName: process.env.EMAIL_FROM_NAME || 'not configured',
    isValidFormat: process.env.EMAIL_FROM_ADDRESS?.includes('@') || false
  };

  return NextResponse.json(
    {
      message: 'Resend Debug API',
      usage: 'POST with { recipientEmail: "email@example.com" }',
      currentConfig: config,
      suggestions: [
        'Ensure EMAIL_FROM_ADDRESS is in format: noreply@kanomsoft.com',
        'Verify domain in Resend dashboard: https://resend.com/domains',
        'Check DNS records are properly configured',
        'Allow 24-48 hours for DNS propagation'
      ]
    },
    { headers: corsHeaders }
  );
}

export async function OPTIONS() {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  };
  
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}