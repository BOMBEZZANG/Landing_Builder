import { NextRequest, NextResponse } from 'next/server';
import { HTMLGenerator } from '@/lib/html-generator/index';
import { githubService } from '@/lib/github-service';
import { PageState } from '@/types/builder.types';

interface DeployRequest {
  page: PageState;
  userId: string;
  pageId?: string;
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
    const body: DeployRequest = await request.json();

    // Validate required fields
    if (!body.page) {
      return NextResponse.json(
        { error: 'Page data is required' },
        { status: 400 }
      );
    }

    if (!body.userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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

    // Generate page ID if not provided
    const pageId = body.pageId || generatePageId(body.page.title);

    // Default options for deployment
    const defaultOptions = {
      minify: true,
      inlineCSS: true,
      includeAnalytics: process.env.NEXT_PUBLIC_GA_ID ? true : false,
      includeMeta: true,
      includeAnimations: true,
      optimizeImages: true,
      formService: 'custom' // Use custom API for form submissions
    };

    const options = { ...defaultOptions, ...body.options };

    // Step 1: Generate HTML
    const generator = new HTMLGenerator(options);
    const htmlResult = await generator.generate(body.page);

    if (!htmlResult.html) {
      throw new Error('HTML generation failed');
    }

    // Step 2: Deploy to GitHub
    const deployResult = await githubService.deployPage(
      body.userId,
      pageId,
      htmlResult.html,
      {
        title: body.page.title,
        description: body.page.metadata.description || 'Landing page created with Landing Page Builder',
        createdAt: new Date().toISOString()
      }
    );

    if (!deployResult.success) {
      throw new Error(deployResult.error || 'Deployment failed');
    }

    // Step 3: Return success response
    return NextResponse.json({
      success: true,
      data: {
        pageId,
        url: deployResult.url,
        netlifyUrl: deployResult.netlifyUrl,
        commitSha: deployResult.commitSha,
        deploymentId: deployResult.deploymentId,
        htmlSize: htmlResult.size,
        htmlSizeFormatted: formatFileSize(htmlResult.size),
        warnings: htmlResult.warnings,
        metadata: htmlResult.metadata,
        deployedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Deployment error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Deployment failed',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get list of deployed pages for user
    const pages = await githubService.getPagesList(userId);

    return NextResponse.json({
      success: true,
      data: {
        pages,
        count: pages.length
      }
    });

  } catch (error) {
    console.error('Get pages error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get pages',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const pageId = searchParams.get('pageId');

    if (!userId || !pageId) {
      return NextResponse.json(
        { error: 'User ID and Page ID are required' },
        { status: 400 }
      );
    }

    // Delete page from GitHub
    const success = await githubService.deletePage(userId, pageId);

    if (!success) {
      throw new Error('Failed to delete page');
    }

    return NextResponse.json({
      success: true,
      message: 'Page deleted successfully'
    });

  } catch (error) {
    console.error('Delete page error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to delete page',
        success: false 
      },
      { status: 500 }
    );
  }
}

// Utility functions
function generatePageId(title: string): string {
  const timestamp = Date.now();
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);
  
  return `${cleanTitle}-${timestamp}`;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}