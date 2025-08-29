import { PageState, Section } from '@/types/builder.types';
import { generateHeroHTML } from './templates/hero';
import { generateContentHTML } from './templates/content';
import { generateCTAHTML } from './templates/cta';
import { generateCSS } from './css-generator';
import { generateFormHandler } from './form-handler';
import { optimizeHTML, validateOptimizedHTML } from './optimizer';
import { generateFirebaseAnalyticsScript } from '@/lib/firebase';
import { generateAdSenseScript, generateAdSenseAutoAds } from '@/lib/adsense';

export interface GeneratorOptions {
  minify?: boolean;
  inlineCSS?: boolean;
  includeAnalytics?: boolean;
  includeAdSense?: boolean;
  formService?: 'formspree' | 'custom' | 'netlify-forms';
  includeAnimations?: boolean;
}

export interface GeneratedOutput {
  html: string;
  size: number;
  warnings: string[];
  metadata: {
    generatedAt: string;
    version: string;
    checksum: string;
  };
}

export class HTMLGenerator {
  private options: GeneratorOptions;
  
  constructor(options: GeneratorOptions = {}) {
    this.options = {
      minify: true,
      inlineCSS: true,
      includeAnalytics: false,
      includeAdSense: false,
      formService: 'custom', // Changed to use our custom API
      includeAnimations: true,
      ...options
    };
  }
  
  async generate(pageState: PageState): Promise<GeneratedOutput> {
    const warnings: string[] = [];
    
    try {
      // 1. Generate base HTML structure
      const baseHTML = this.generateBaseStructure(pageState);
      
      // 2. Generate sections HTML
      const sectionsHTML = this.generateSectionsHTML(pageState.sections);
      
      // 3. Generate CSS
      const css = generateCSS(pageState, this.options);
      
      // 4. Generate JavaScript (form handler)
      const javascript = this.generateJavaScript(pageState);
      
      // 5. Combine everything
      let html = this.combineHTML(baseHTML, sectionsHTML, css, javascript);
      
      // 6. Optimize if enabled
      if (this.options.minify) {
        html = optimizeHTML(html);
      }
      
      // 7. Validate output
      const validation = validateOptimizedHTML(html);
      if (!validation.isValid) {
        warnings.push(...validation.errors);
      }
      
      return {
        html,
        size: new Blob([html]).size,
        warnings,
        metadata: {
          generatedAt: new Date().toISOString(),
          version: '1.0.0',
          checksum: this.generateChecksum(html)
        }
      };
    } catch (error) {
      throw new Error(`HTML generation failed: ${(error as Error).message}`);
    }
  }
  
  private generateBaseStructure(pageState: PageState): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    
    <!-- Content Security Policy - Allow inline scripts, eval for deployment platforms, Firebase, AdSense, and external API calls -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://www.googleadservices.com; connect-src 'self' https://easy-landing-omega.vercel.app https://api.resend.com https://vercel.live wss://vercel.live https://vitals.vercel-insights.com https://firebaseinstallations.googleapis.com https://www.google-analytics.com https://analytics.google.com https://firebase.googleapis.com https://firebaselogging.googleapis.com https://www.googleadservices.com https://googleads.g.doubleclick.net; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com;">
    
    <!-- SEO Meta Tags -->
    <title>${this.escapeHTML(pageState.title || 'Landing Page')}</title>
    <meta name="description" content="${this.escapeHTML(pageState.metadata?.description || '')}">
    ${this.options.includeAdSense ? `<meta name="google-adsense-account" content="${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || ''}">` : ''}
    
    <!-- Open Graph -->
    <meta property="og:title" content="${this.escapeHTML(pageState.title || '')}">
    <meta property="og:description" content="${this.escapeHTML(pageState.metadata?.description || '')}">
    <meta property="og:type" content="website">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${this.escapeHTML(pageState.title || '')}">
    <meta name="twitter:description" content="${this.escapeHTML(pageState.metadata?.description || '')}">
    
    <!-- Favicon -->
    ${pageState.metadata?.favicon ? `<link rel="icon" href="${pageState.metadata.favicon}">` : ''}
    
    <!-- Preconnect to external domains -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://res.cloudinary.com">
    <link rel="preconnect" href="https://www.gstatic.com">
    <link rel="preconnect" href="https://www.googletagmanager.com">
    <link rel="preconnect" href="https://pagead2.googlesyndication.com">
    <link rel="preconnect" href="https://tpc.googlesyndication.com">
    
    <!-- STYLES_PLACEHOLDER -->
    <!-- FIREBASE_ANALYTICS_PLACEHOLDER -->
    <!-- ADSENSE_HEAD_PLACEHOLDER -->
</head>
<body>
    <!-- CONTENT_PLACEHOLDER -->
    <!-- SCRIPTS_PLACEHOLDER -->
    <!-- ADSENSE_BODY_PLACEHOLDER -->
</body>
</html>`;
  }
  
  private generateSectionsHTML(sections: Section[]): string {
    return sections
      .sort((a, b) => a.order - b.order)
      .map(section => {
        switch (section.type) {
          case 'hero':
            return generateHeroHTML(section);
          case 'content':
            return generateContentHTML(section);
          case 'cta':
            return generateCTAHTML(section);
          default:
            return '';
        }
      })
      .join('\n');
  }
  
  private generateJavaScript(pageState: PageState): string {
    const scripts: string[] = [];
    
    // Add basic debug script to verify JavaScript is executing
    scripts.push(`console.log('🔧 Landing page JavaScript loaded successfully');`);
    
    // Find CTA section with form
    const ctaSection = pageState.sections.find(s => s.type === 'cta');
    console.log('Generating JavaScript - CTA section found:', !!ctaSection, 'Form enabled:', ctaSection?.type === 'cta' && ctaSection.data.formEnabled, 'Form service:', this.options.formService);
    if (ctaSection?.type === 'cta' && ctaSection.data.formEnabled) {
      const formHandler = generateFormHandler(ctaSection, this.options.formService);
      console.log('Form handler generated, length:', formHandler.length);
      
      
      scripts.push(formHandler);
    }
    
    // Add smooth scroll behavior
    scripts.push(this.generateSmoothScroll());
    
    // Add analytics if enabled
    if (this.options.includeAnalytics) {
      scripts.push(this.generateAnalytics());
    }
    
    return scripts.length > 0 
      ? `<script>\n${this.escapeScriptContent(scripts.join('\n\n'))}\n</script>`
      : '';
  }
  
  private combineHTML(base: string, sections: string, css: string, js: string): string {
    // Generate Firebase Analytics script if analytics is enabled
    const firebaseAnalytics = this.options.includeAnalytics ? generateFirebaseAnalyticsScript() : '';
    
    // Generate AdSense scripts if AdSense is enabled
    const adSenseHead = this.options.includeAdSense ? generateAdSenseScript() : '';
    const adSenseBody = this.options.includeAdSense ? generateAdSenseAutoAds() : '';
    
    return base
      .replace('<!-- STYLES_PLACEHOLDER -->', `<style>\n${css}\n</style>`)
      .replace('<!-- FIREBASE_ANALYTICS_PLACEHOLDER -->', firebaseAnalytics)
      .replace('<!-- ADSENSE_HEAD_PLACEHOLDER -->', adSenseHead)
      .replace('<!-- CONTENT_PLACEHOLDER -->', sections)
      .replace('<!-- SCRIPTS_PLACEHOLDER -->', js)
      .replace('<!-- ADSENSE_BODY_PLACEHOLDER -->', adSenseBody);
  }
  
  private escapeHTML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  private escapeScriptContent(scriptContent: string): string {
    // Escape script content to prevent HTML injection and ensure valid JavaScript
    return scriptContent
      // Escape closing script tags to prevent breaking out of the script block
      .replace(/<\/script>/gi, '<\\/script>')
      // Escape HTML comment sequences that could cause issues
      .replace(/<!--/g, '\\x3C!--')
      .replace(/-->/g, '--\\x3E');
  }
  
  private generateChecksum(html: string): string {
    // Simple checksum for version tracking
    let hash = 0;
    for (let i = 0; i < html.length; i++) {
      const char = html.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
  
  private generateSmoothScroll(): string {
    return `
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });`;
  }
  
  private generateAnalytics(): string {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (!gaId) return '';
    
    return `
    // Google Analytics
    (function() {
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=${gaId}';
      document.head.appendChild(script);
      
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
      
      // Track page view
      gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href
      });
    })();`;
  }
}