import { NextRequest, NextResponse } from 'next/server';
import { githubService } from '@/lib/github-service';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing GitHub connection...');
    
    // Test GitHub connection
    const connectionTest = await githubService.testConnection();
    console.log('Connection test result:', connectionTest);
    
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: 'GitHub connection failed',
        details: connectionTest.error
      });
    }
    
    // Get rate limit info
    const rateLimit = await githubService.getRateLimit();
    console.log('Rate limit info:', rateLimit);
    
    return NextResponse.json({
      success: true,
      data: {
        connection: 'OK',
        rateLimit: rateLimit,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Test deployment error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simple test deployment with minimal page data
    const testPage = {
      id: 'test-page',
      title: 'Test Page',
      sections: [
        {
          id: 'hero-1',
          type: 'hero' as const,
          order: 0,
          data: {
            headline: 'Test Page',
            subheadline: 'This is a test deployment',
            buttonText: 'Get Started',
            buttonAction: 'scroll' as const,
            backgroundType: 'color' as const,
            backgroundColor: '#3b82f6',
            textColor: '#ffffff',
            buttonColor: '#10b981',
            alignment: 'center' as const
          }
        }
      ],
      globalStyles: {
        primaryColor: '#3b82f6',
        secondaryColor: '#10b981',
        fontFamily: 'modern' as const
      },
      metadata: {
        description: 'Test deployment page'
      }
    };
    
    console.log('Testing deployment with test page...');
    
    const deployResult = await githubService.deployPage(
      'test-user',
      'test-page-' + Date.now(),
      '<html><head><title>Test</title></head><body><h1>Test Page</h1></body></html>',
      {
        title: 'Test Page',
        description: 'Test deployment',
        createdAt: new Date().toISOString()
      }
    );
    
    console.log('Deploy result:', deployResult);
    
    return NextResponse.json({
      success: true,
      deployResult
    });
    
  } catch (error) {
    console.error('Test POST deployment error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}