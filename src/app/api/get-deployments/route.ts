import { NextRequest, NextResponse } from 'next/server';
import { githubService } from '@/lib/github-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user-1756285754259'; // Using your timestamp
    
    console.log('Fetching deployments for userId:', userId);
    
    // Get list of deployed pages
    const pages = await githubService.getPagesList(userId);
    
    const response = {
      success: true,
      userId,
      deployments: pages.map(page => ({
        pageId: page.pageId,
        title: page.title,
        githubPagesUrl: `https://BOMBEZZANG.github.io/landing-pages-deploy/sites/${userId}/${page.pageId}`,
        netlifyMainUrl: `https://landing-pages-deploy.netlify.app/sites/${userId}/${page.pageId}`,
        githubRepoUrl: `https://github.com/BOMBEZZANG/landing-pages-deploy/tree/main/sites/${userId}/${page.pageId}`,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt
      }))
    };
    
    // Also return the specific deployment info
    const latestDeployment = {
      pageId: 'untitled-landing-page-1756285754259',
      githubPagesUrl: `https://BOMBEZZANG.github.io/landing-pages-deploy/sites/${userId}/untitled-landing-page-1756285754259`,
      netlifyMainUrl: `https://landing-pages-deploy.netlify.app/sites/${userId}/untitled-landing-page-1756285754259`,
      netlifyDeployUrl: 'https://86fd19d--landing-pages-deploy.netlify.app',
      repoUrl: 'https://github.com/BOMBEZZANG/landing-pages-deploy',
      directFileUrl: `https://raw.githubusercontent.com/BOMBEZZANG/landing-pages-deploy/main/sites/${userId}/untitled-landing-page-1756285754259/index.html`
    };
    
    return NextResponse.json({
      ...response,
      latestDeployment
    });
    
  } catch (error) {
    console.error('Error fetching deployments:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch deployments'
    }, { status: 500 });
  }
}