import { NextRequest, NextResponse } from 'next/server';

interface VerificationResult {
  domain: string;
  checks: {
    adsenseCodeDeployed: boolean;
    adsTxtExists: boolean;
    robotsTxtExists: boolean;
    clientIdMatches: boolean;
    metaTagPresent: boolean;
  };
  recommendations: string[];
  status: 'ready' | 'issues' | 'not_ready';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain') || 'kanomsoft.com';
  const baseUrl = `https://${domain}`;

  const result: VerificationResult = {
    domain,
    checks: {
      adsenseCodeDeployed: false,
      adsTxtExists: false,
      robotsTxtExists: false,
      clientIdMatches: false,
      metaTagPresent: false
    },
    recommendations: [],
    status: 'not_ready'
  };

  const expectedClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  try {
    // Check main page for AdSense code
    try {
      const mainPageResponse = await fetch(baseUrl, { 
        headers: { 'User-Agent': 'AdSense-Verification-Bot/1.0' }
      });
      if (mainPageResponse.ok) {
        const html = await mainPageResponse.text();
        result.checks.adsenseCodeDeployed = html.includes('pagead2.googlesyndication.com');
        result.checks.clientIdMatches = expectedClientId ? html.includes(expectedClientId) : false;
        result.checks.metaTagPresent = html.includes('google-adsense-account') || html.includes(expectedClientId || '');
        
        if (!result.checks.adsenseCodeDeployed) {
          result.recommendations.push('AdSense script not found in HTML - republish your landing page');
        }
        if (!result.checks.clientIdMatches) {
          result.recommendations.push(`Client ID ${expectedClientId} not found in page`);
        }
      }
    } catch (error) {
      result.recommendations.push(`Cannot access ${baseUrl} - check domain configuration`);
    }

    // Check ads.txt
    try {
      const adsTxtResponse = await fetch(`${baseUrl}/ads.txt`);
      result.checks.adsTxtExists = adsTxtResponse.ok;
      if (!result.checks.adsTxtExists) {
        result.recommendations.push('ads.txt file not found - republish to deploy it');
      }
    } catch (error) {
      result.recommendations.push('ads.txt file check failed');
    }

    // Check robots.txt  
    try {
      const robotsTxtResponse = await fetch(`${baseUrl}/robots.txt`);
      result.checks.robotsTxtExists = robotsTxtResponse.ok;
      if (!result.checks.robotsTxtExists) {
        result.recommendations.push('robots.txt file not found - republish to deploy it');
      }
    } catch (error) {
      result.recommendations.push('robots.txt file check failed');
    }

    // Determine overall status
    const allCriticalChecks = [
      result.checks.adsenseCodeDeployed,
      result.checks.adsTxtExists,
      result.checks.robotsTxtExists,
      result.checks.clientIdMatches
    ];

    if (allCriticalChecks.every(Boolean)) {
      result.status = 'ready';
      result.recommendations.push('✅ All checks passed! Try AdSense verification now.');
    } else if (allCriticalChecks.some(Boolean)) {
      result.status = 'issues';
      result.recommendations.push('⚠️ Some issues found. Fix them before trying AdSense verification.');
    } else {
      result.status = 'not_ready';
      result.recommendations.push('❌ Multiple issues found. Republish your landing page first.');
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
      data: result
    }, { status: 500 });
  }
}