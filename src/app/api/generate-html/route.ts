import { NextRequest, NextResponse } from 'next/server';
import { htmlGenerator } from '@/lib/html-generator';
import { PageState } from '@/types/builder.types';

interface GenerateHtmlRequest {
  page: PageState;
  options?: {
    minify?: boolean;
    inlineCSS?: boolean;
    includeAnalytics?: boolean;
    includeMeta?: boolean;
    includeAnimations?: boolean;
    optimizeImages?: boolean;
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
    const defaultOptions = {
      minify: true,
      inlineCSS: true,
      includeAnalytics: false,
      includeMeta: true,
      includeAnimations: true,
      optimizeImages: true
    };

    const options = { ...defaultOptions, ...body.options };

    // Generate HTML
    const result = await htmlGenerator.generateHTML(body.page, options);

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        html: result.html,
        css: result.css,
        js: result.js,
        size: result.size,
        sizeFormatted: formatFileSize(result.size),
        warnings: result.warnings,
        assets: result.assets,
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