import { NextRequest, NextResponse } from 'next/server';
import { HTMLGenerator } from '@/lib/html-generator/index';
import { PageState } from '@/types/builder.types';

interface GenerateHtmlRequest {
  page: PageState;
  options?: {
    minify?: boolean;
    inlineCSS?: boolean;
    includeAnalytics?: boolean;
    includeAdSense?: boolean;
    includeMeta?: boolean;
    includeAnimations?: boolean;
    optimizeImages?: boolean;
    formService?: 'formspree' | 'custom' | 'netlify-forms';
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateHtmlRequest = await request.json();

    if (!body.page) {
      return NextResponse.json(
        { error: 'Page data is required' },
        { status: 400 }
      );
    }

    // Validate page structure
    if (!body.page.sections || !Array.isArray(body.page.sections)) {
      return NextResponse.json(
        { error: 'Page sections are required' },
        { status: 400 }
      );
    }

    if (body.page.sections.length === 0) {
      return NextResponse.json(
        { error: 'Page must contain at least one section' },
        { status: 400 }
      );
    }

    // Default options
    // Enable analytics if either Firebase or Google Analytics is configured
    const hasFirebaseConfig = !!(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_APP_ID);
    const hasGoogleAnalytics = !!process.env.NEXT_PUBLIC_GA_ID;
    const hasAdSenseConfig = !!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
    
    const defaultOptions = {
      minify: true,
      inlineCSS: true,
      includeAnalytics: hasFirebaseConfig || hasGoogleAnalytics,
      includeAdSense: hasAdSenseConfig,
      includeMeta: true,
      includeAnimations: true,
      optimizeImages: true,
      formService: 'custom' as const // Ensure we use custom form handler
    };

    const options = { ...defaultOptions, ...body.options };

    // Generate HTML
    const generator = new HTMLGenerator(options);
    const result = await generator.generate(body.page);

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        html: result.html,
        size: result.size,
        sizeFormatted: formatFileSize(result.size),
        warnings: result.warnings,
        metadata: result.metadata,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('HTML generation error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'HTML generation failed',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'HTML Generator API',
    endpoints: {
      POST: '/api/generate-html - Generate HTML from page data'
    },
    requiredFields: ['page'],
    optionalFields: ['options']
  });
}

// Utility function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}