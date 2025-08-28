import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

interface FormSubmission {
  pageId: string;
  formData: Record<string, string>;
  recipientEmail: string;
  timestamp: string;
}

// Initialize Resend client
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  // Add CORS headers to allow requests from deployed static sites
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }

  try {
    let body: FormSubmission;
    
    // Check Content-Type to handle both JSON and form data submissions
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // JavaScript fetch request
      body = await request.json();
    } else {
      // HTML form submission (application/x-www-form-urlencoded)
      const formData = await request.formData();
      
      // Convert form data to our expected format
      const formDataObj: Record<string, string> = {};
      
      formData.forEach((value, key) => {
        if (typeof value === 'string') {
          formDataObj[key] = value;
        }
      });
      
      // Extract metadata from form attributes or use defaults
      const recipientEmail = formData.get('data-recipient-email') as string || 
                           formData.get('recipientEmail') as string || 
                           'test@example.com'; // fallback
      
      const pageId = formData.get('data-page-id') as string || 
                    formData.get('pageId') as string || 
                    'html-form-submission';
      
      // Remove metadata fields from form data
      delete formDataObj['data-recipient-email'];
      delete formDataObj['data-page-id'];
      delete formDataObj['recipientEmail'];
      delete formDataObj['pageId'];
      
      body = {
        formData: formDataObj,
        recipientEmail,
        pageId,
        timestamp: new Date().toISOString()
      };
    }

    // Validate required fields
    if (!body.recipientEmail) {
      return NextResponse.json(
        { error: 'Recipient email is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!body.formData || Object.keys(body.formData).length === 0) {
      return NextResponse.json(
        { error: 'Form data is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate email format
    if (!isValidEmail(body.recipientEmail)) {
      return NextResponse.json(
        { error: 'Invalid recipient email format' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Sanitize form data
    const sanitizedData: Record<string, string> = {};
    for (const [key, value] of Object.entries(body.formData)) {
      if (typeof value === 'string') {
        sanitizedData[sanitizeField(key)] = sanitizeInput(value);
      }
    }

    // Generate email content
    const emailContent = generateEmailContent(sanitizedData, body.pageId, body.timestamp);

    // Send email if Resend is configured
    if (resend) {
      try {
        const emailResult = await resend.emails.send({
          from: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
          to: body.recipientEmail,
          subject: `New form submission from ${body.pageId || 'Landing Page'}`,
          html: emailContent.html,
          text: emailContent.text,
          replyTo: body.formData.email || undefined, // If submitter provided email, set as reply-to
        });

        console.log('Email sent successfully:', emailResult);
        
        // If email sending fails, we should know about it
        if (!emailResult.data?.id) {
          console.error('Email may not have been sent - no ID returned');
        }
      } catch (emailError) {
        console.error('Email send error:', emailError);
        // Log the full error for debugging
        if (emailError instanceof Error) {
          console.error('Error details:', {
            message: emailError.message,
            stack: emailError.stack,
            recipientEmail: body.recipientEmail,
            apiKeyPresent: !!process.env.RESEND_API_KEY
          });
        }
      }
    } else {
      console.warn('Resend API key not configured - emails will not be sent');
    }

    // Log form submission (in production, you might want to store this in a database)
    console.log('Form submission received:', {
      pageId: body.pageId,
      recipientEmail: body.recipientEmail,
      timestamp: body.timestamp,
      data: sanitizedData
    });

    // Return success response with CORS headers
    return NextResponse.json({
      success: true,
      message: 'Form submission received successfully',
      submissionId: generateSubmissionId(),
      timestamp: new Date().toISOString()
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Form submission error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Form submission failed',
        success: false 
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET() {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  };

  return NextResponse.json({
    message: 'Form Submission API',
    endpoints: {
      POST: '/api/submit-form - Submit form data'
    },
    requiredFields: ['recipientEmail', 'formData'],
    optionalFields: ['pageId', 'timestamp']
  }, { headers: corsHeaders });
}

export async function OPTIONS() {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  };
  
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// Utility functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .substring(0, 1000); // Limit length
}

function sanitizeField(field: string): string {
  return field
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase()
    .substring(0, 50);
}

function generateEmailContent(
  formData: Record<string, string>, 
  pageId: string, 
  timestamp: string
): { html: string; text: string } {
  const formFields = Object.entries(formData)
    .map(([key, value]) => `<strong>${capitalize(key)}:</strong> ${value}`)
    .join('<br>');

  const formFieldsText = Object.entries(formData)
    .map(([key, value]) => `${capitalize(key)}: ${value}`)
    .join('\n');

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Form Submission
        </h2>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Page ID:</strong> ${pageId || 'Unknown'}</p>
          <p><strong>Submitted:</strong> ${new Date(timestamp || Date.now()).toLocaleString()}</p>
        </div>
        
        <h3 style="color: #333;">Form Data:</h3>
        <div style="background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
          ${formFields}
        </div>
        
        <hr style="margin: 30px 0; border: 1px solid #eee;">
        
        <p style="color: #666; font-size: 12px;">
          This email was generated by Landing Page Builder form submission system.
        </p>
      </body>
    </html>
  `;

  const text = `
New Form Submission

Page ID: ${pageId || 'Unknown'}
Submitted: ${new Date(timestamp || Date.now()).toLocaleString()}

Form Data:
${formFieldsText}

---
This email was generated by Landing Page Builder form submission system.
  `;

  return { html, text };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateSubmissionId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}