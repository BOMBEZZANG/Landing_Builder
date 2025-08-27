import { PageState, Section, HeroSection, ContentSection, CTASection } from '@/types/builder.types';
import { promises as fs } from 'fs';
import path from 'path';
import { minify } from 'html-minifier-terser';

interface GeneratorOptions {
  minify: boolean;
  inlineCSS: boolean;
  includeAnalytics: boolean;
  includeMeta: boolean;
  includeAnimations: boolean;
  optimizeImages: boolean;
}

interface GeneratedHTML {
  html: string;
  css: string;
  js: string;
  size: number;
  warnings: string[];
  assets: string[];
}

interface PageMetadata {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  favicon?: string;
  url?: string;
}

export class HTMLGenerator {
  private templates: Map<string, string> = new Map();
  private styles: Map<string, string> = new Map();
  private scripts: Map<string, string> = new Map();

  async initialize() {
    try {
      // Load templates
      await this.loadTemplate('base', 'base.html');
      
      // Load styles
      await this.loadStyle('reset', 'styles/reset.css');
      await this.loadStyle('utilities', 'styles/utilities.css');
      await this.loadStyle('responsive', 'styles/responsive.css');
      
      // Load scripts
      await this.loadScript('form', 'scripts/form.js');
    } catch (error) {
      console.error('Failed to initialize HTML generator:', error);
      throw new Error('HTML generator initialization failed');
    }
  }

  async generateHTML(
    page: PageState, 
    options: GeneratorOptions = {
      minify: true,
      inlineCSS: true,
      includeAnalytics: false,
      includeMeta: true,
      includeAnimations: true,
      optimizeImages: true
    }
  ): Promise<GeneratedHTML> {
    const warnings: string[] = [];
    const assets: string[] = [];

    try {
      // Initialize if not already done
      if (this.templates.size === 0) {
        await this.initialize();
      }

      // Generate sections HTML
      const sectionsHTML = this.generateSectionsHTML(page.sections, options);
      
      // Generate CSS
      const css = this.generateCSS(page, options);
      
      // Generate JavaScript
      const js = this.generateJS(page, options);
      
      // Generate metadata
      const metadata = this.generateMetadata(page, options);
      
      // Get base template
      const baseTemplate = this.templates.get('base');
      if (!baseTemplate) {
        throw new Error('Base template not found');
      }
      
      // Replace template variables
      let html = baseTemplate
        .replace('{{TITLE}}', this.escapeHtml(metadata.title))
        .replace('{{DESCRIPTION}}', this.escapeHtml(metadata.description))
        .replace('{{OG_TITLE}}', this.escapeHtml(metadata.ogTitle || metadata.title))
        .replace('{{OG_DESCRIPTION}}', this.escapeHtml(metadata.ogDescription || metadata.description))
        .replace('{{OG_IMAGE}}', metadata.ogImage || '')
        .replace('{{TWITTER_TITLE}}', this.escapeHtml(metadata.twitterTitle || metadata.title))
        .replace('{{TWITTER_DESCRIPTION}}', this.escapeHtml(metadata.twitterDescription || metadata.description))
        .replace('{{TWITTER_IMAGE}}', metadata.twitterImage || metadata.ogImage || '')
        .replace('{{URL}}', metadata.url || '')
        .replace('{{FAVICON}}', metadata.favicon || '')
        .replace('{{CSS}}', css)
        .replace('{{BODY_CONTENT}}', sectionsHTML)
        .replace('{{SCRIPTS}}', js)
        .replace('{{ANALYTICS}}', options.includeAnalytics ? this.generateAnalytics() : '');

      // Collect assets
      const imageUrls = this.extractImageUrls(sectionsHTML);
      assets.push(...imageUrls);

      // Minify if requested
      if (options.minify) {
        html = await this.minifyHTML(html);
      }

      // Validate HTML
      const validationWarnings = this.validateHTML(html);
      warnings.push(...validationWarnings);

      return {
        html,
        css,
        js,
        size: Buffer.byteLength(html, 'utf8'),
        warnings,
        assets
      };

    } catch (error) {
      console.error('HTML generation error:', error);
      throw new Error(`HTML generation failed: ${(error as Error).message}`);
    }
  }

  private generateSectionsHTML(sections: Section[], options: GeneratorOptions): string {
    const sortedSections = [...sections].sort((a, b) => a.order - b.order);
    
    return sortedSections.map((section, index) => {
      switch (section.type) {
        case 'hero':
          return this.generateHeroHTML(section as HeroSection, index, options);
        case 'content':
          return this.generateContentHTML(section as ContentSection, index, options);
        case 'cta':
          return this.generateCTAHTML(section as CTASection, index, options);
        default:
          return '';
      }
    }).join('\n');
  }

  private generateHeroHTML(section: HeroSection, index: number, options: GeneratorOptions): string {
    const { data } = section;
    const animationAttr = options.includeAnimations ? 'data-animate="fade-in"' : '';
    const backgroundStyle = this.getBackgroundStyle(data.backgroundType, data.backgroundColor, data.backgroundGradient, data.backgroundImage);
    
    return `
<section id="hero-${index}" class="hero-section relative flex items-center justify-center text-${data.alignment}" style="${backgroundStyle}" ${animationAttr}>
  ${data.backgroundImage ? '<div class="absolute inset-0 bg-black bg-opacity-30"></div>' : ''}
  <div class="container relative z-10">
    <h1 class="hero-title font-bold" style="color: ${data.textColor}">
      ${this.escapeHtml(data.headline)}
    </h1>
    <p class="hero-subtitle font-light" style="color: ${data.textColor}">
      ${this.escapeHtml(data.subheadline)}
    </p>
    ${this.generateButton(data.buttonText, data.buttonColor, data.buttonAction, 'hero-button')}
  </div>
</section>`;
  }

  private generateContentHTML(section: ContentSection, index: number, options: GeneratorOptions): string {
    const { data } = section;
    const animationAttr = options.includeAnimations ? 'data-animate="fade-in"' : '';
    const paddingClass = `py-${data.padding === 'small' ? '8' : data.padding === 'large' ? '24' : '16'}`;
    
    const imageHTML = data.imageUrl ? `
      <div class="image-container">
        <img src="${data.imageUrl}" alt="${this.escapeHtml(data.title)}" 
             class="responsive-image" 
             ${options.optimizeImages ? 'data-lazy="' + data.imageUrl + '"' : ''}>
      </div>` : '';

    const contentHTML = `
      <div>
        <h2 class="content-title font-bold" style="color: ${data.textColor}">
          ${this.escapeHtml(data.title)}
        </h2>
        <div class="content-text" style="color: ${data.textColor}">
          ${this.formatText(data.content)}
        </div>
      </div>`;

    const isImageLeft = data.imagePosition === 'left';
    const isImageRight = data.imagePosition === 'right';
    const isImageTop = data.imagePosition === 'top';
    const isImageBottom = data.imagePosition === 'bottom';

    let gridHTML = '';
    
    if (data.imageUrl && (isImageLeft || isImageRight)) {
      gridHTML = `
        <div class="content-grid">
          ${isImageLeft ? imageHTML + contentHTML : contentHTML + imageHTML}
        </div>`;
    } else if (data.imageUrl && isImageTop) {
      gridHTML = imageHTML + contentHTML;
    } else if (data.imageUrl && isImageBottom) {
      gridHTML = contentHTML + imageHTML;
    } else {
      gridHTML = contentHTML;
    }

    return `
<section id="content-${index}" class="content-section ${paddingClass}" style="background-color: ${data.backgroundColor}" ${animationAttr}>
  <div class="container">
    ${gridHTML}
  </div>
</section>`;
  }

  private generateCTAHTML(section: CTASection, index: number, options: GeneratorOptions): string {
    const { data } = section;
    const animationAttr = options.includeAnimations ? 'data-animate="fade-in"' : '';
    
    const formHTML = data.formEnabled ? `
      <form class="form-container" 
            data-form-handler="true"
            data-page-id="landing-page-${Date.now()}"
            data-recipient-email="${this.escapeHtml(data.recipientEmail)}"
            data-endpoint="/api/submit-form">
        ${data.formFields.name ? '<input type="text" name="name" placeholder="Your Name" class="form-field" required>' : ''}
        ${data.formFields.email ? '<input type="email" name="email" placeholder="Your Email" class="form-field" required>' : ''}
        ${data.formFields.phone ? '<input type="tel" name="phone" placeholder="Your Phone" class="form-field" required>' : ''}
        ${this.generateButton(data.buttonText, data.buttonColor, 'form', 'cta-button', 'submit')}
      </form>` : this.generateButton(data.buttonText, data.buttonColor, 'link', 'cta-button');

    return `
<section id="cta-${index}" class="cta-section text-center" style="background-color: ${data.backgroundColor}" ${animationAttr}>
  <div class="container">
    <h2 class="cta-title font-bold" style="color: ${data.textColor}">
      ${this.escapeHtml(data.title)}
    </h2>
    <p class="cta-description font-light" style="color: ${data.textColor}">
      ${this.escapeHtml(data.description)}
    </p>
    ${formHTML}
  </div>
</section>`;
  }

  private generateButton(
    text: string, 
    color: string, 
    action: string, 
    className: string = 'btn', 
    type: string = 'button'
  ): string {
    const href = action === 'scroll' ? '#content-0' : action === 'form' ? '#cta-0' : '#';
    const buttonType = type === 'submit' ? 'submit' : 'button';
    
    if (type === 'submit') {
      return `
        <button type="${buttonType}" class="btn ${className}" style="background-color: ${color}; color: white;">
          ${this.escapeHtml(text)}
        </button>`;
    } else {
      return `
        <a href="${href}" class="btn ${className}" style="background-color: ${color}; color: white;">
          ${this.escapeHtml(text)}
        </a>`;
    }
  }

  private generateCSS(page: PageState, options: GeneratorOptions): string {
    let css = '';
    
    // Base styles
    css += this.styles.get('reset') || '';
    css += this.styles.get('utilities') || '';
    css += this.styles.get('responsive') || '';
    
    // Font family
    const fontFamily = this.getFontFamily(page.globalStyles.fontFamily);
    css += `
      body {
        font-family: ${fontFamily};
        color: #333333;
        line-height: 1.6;
        overflow-x: hidden;
      }
    `;
    
    // CSS variables for theme colors
    css += `
      :root {
        --primary-color: ${page.globalStyles.primaryColor};
        --secondary-color: ${page.globalStyles.secondaryColor};
        --text-dark: #1f2937;
        --text-light: #6b7280;
        --bg-light: #f9fafb;
        --border-color: #e5e7eb;
      }
    `;

    // Enhanced responsive form styles
    css += `
      .form-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 500px;
        margin: 0 auto;
      }
      
      .form-field {
        width: 100%;
        padding: 14px 16px;
        border: 2px solid var(--border-color);
        border-radius: 8px;
        font-size: 16px;
        font-family: inherit;
        transition: all 0.3s ease;
        background: white;
      }
      
      .form-field:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      .form-field:invalid {
        border-color: #dc2626;
      }
      
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 14px 28px;
        font-size: 16px;
        font-weight: 600;
        text-align: center;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.2s ease;
        min-height: 48px;
        font-family: inherit;
      }
      
      .btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
      }
      
      .btn:active {
        transform: translateY(0);
      }
      
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
      }
      
      @media (max-width: 768px) {
        .btn {
          width: 100%;
          padding: 16px 24px;
        }
        
        .form-field {
          font-size: 16px; /* Prevents zoom on iOS */
        }
      }
    `;

    // Animation styles
    if (options.includeAnimations) {
      css += `
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `;
    }
    
    // Accessibility and performance optimizations
    css += `
      @media (prefers-reduced-motion: reduce) {
        * {
          animation: none !important;
          transition: none !important;
        }
      }
      
      /* Print styles */
      @media print {
        .hero-section {
          min-height: auto !important;
        }
        
        .btn,
        .form-container {
          display: none !important;
        }
        
        * {
          color: black !important;
          background: white !important;
        }
      }
    `;
    
    return css;
  }

  private generateJS(page: PageState, options: GeneratorOptions): string {
    let js = '';
    
    // Form handler script
    js += this.scripts.get('form') || '';
    
    return js;
  }

  private generateMetadata(page: PageState, options: GeneratorOptions): PageMetadata {
    return {
      title: page.title || 'Landing Page',
      description: page.metadata.description || 'A beautiful landing page created with our builder',
      ogTitle: page.title,
      ogDescription: page.metadata.description,
      twitterTitle: page.title,
      twitterDescription: page.metadata.description,
      favicon: page.metadata.favicon
    };
  }

  private generateAnalytics(): string {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (!gaId) return '';
    
    return `
      <!-- Google Analytics -->
      <script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      </script>`;
  }

  private getBackgroundStyle(
    type: string, 
    backgroundColor: string, 
    gradient?: string, 
    image?: string
  ): string {
    switch (type) {
      case 'gradient':
        return `background: ${gradient || backgroundColor}`;
      case 'image':
        return image 
          ? `background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${image}'); background-size: cover; background-position: center; background-attachment: fixed;`
          : `background-color: ${backgroundColor}`;
      default:
        return `background-color: ${backgroundColor}`;
    }
  }

  private getFontFamily(fontType: string): string {
    switch (fontType) {
      case 'modern':
        return "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      case 'classic':
        return "'Georgia', 'Times New Roman', serif";
      case 'playful':
        return "'Comic Sans MS', cursive, sans-serif";
      default:
        return "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    }
  }

  private formatText(text: string): string {
    return text.split('\n')
      .map(paragraph => `<p>${this.escapeHtml(paragraph)}</p>`)
      .join('');
  }

  private escapeHtml(text: string): string {
    if (typeof window !== 'undefined') {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    } else {
      // Server-side HTML escaping
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  }

  private extractImageUrls(html: string): string[] {
    const urls: string[] = [];
    const imgRegex = /src="([^"]+)"/g;
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
      urls.push(match[1]);
    }
    
    return urls;
  }

  private async minifyHTML(html: string): Promise<string> {
    return await minify(html, {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
      minifyCSS: true,
      minifyJS: true
    });
  }

  private validateHTML(html: string): string[] {
    const warnings: string[] = [];
    
    // Basic validation checks
    if (!html.includes('<!DOCTYPE html>')) {
      warnings.push('Missing DOCTYPE declaration');
    }
    
    if (!html.includes('<title>')) {
      warnings.push('Missing title tag');
    }
    
    if (!html.includes('viewport')) {
      warnings.push('Missing viewport meta tag');
    }
    
    if (html.length > 500000) { // 500KB
      warnings.push('HTML file is very large (>500KB)');
    }
    
    return warnings;
  }

  // Template loading methods
  private async loadTemplate(name: string, filePath: string): Promise<void> {
    try {
      const templatePath = path.join(process.cwd(), 'src', 'templates', filePath);
      const content = await fs.readFile(templatePath, 'utf-8');
      this.templates.set(name, content);
    } catch (error) {
      console.error(`Failed to load template ${name}:`, error);
      // Fallback templates can be added here
    }
  }

  private async loadStyle(name: string, filePath: string): Promise<void> {
    try {
      const stylePath = path.join(process.cwd(), 'src', 'templates', filePath);
      const content = await fs.readFile(stylePath, 'utf-8');
      this.styles.set(name, content);
    } catch (error) {
      console.error(`Failed to load style ${name}:`, error);
    }
  }

  private async loadScript(name: string, filePath: string): Promise<void> {
    try {
      const scriptPath = path.join(process.cwd(), 'src', 'templates', filePath);
      const content = await fs.readFile(scriptPath, 'utf-8');
      this.scripts.set(name, content);
    } catch (error) {
      console.error(`Failed to load script ${name}:`, error);
    }
  }
}

// Export singleton instance
export const htmlGenerator = new HTMLGenerator();