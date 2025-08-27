# Phase 3 Development Request: HTML Generation & Deployment System

## Document Information
- **Phase**: 3 - HTML Generation & Static Site Deployment
- **Components**: HTML Generator, CSS Processor, Form Handler, Deployment Pipeline
- **Priority**: Critical (Core Functionality)
- **Estimated Duration**: 2 weeks
- **Prerequisites**: Phase 1-2 completed, GitHub/Netlify configured

---

## Executive Summary

Implement a complete HTML generation system that converts the builder's React components and state into standalone, optimized HTML files ready for deployment. The generated HTML must be self-contained, responsive, and functional without any external dependencies.

## System Architecture Overview

```
Builder State → HTML Generator → Optimization → GitHub Push → Netlify Deploy
     ↓              ↓                ↓              ↓              ↓
  PageData    HTML String      Minified HTML   Committed     Live URL
```

## 1. HTML Template System Implementation

### 1.1 Core HTML Generator Module

#### Create `/src/lib/html-generator/index.ts`

```typescript
import { PageState, Section } from '@/types/builder.types';
import { generateHeroHTML } from './templates/hero';
import { generateContentHTML } from './templates/content';
import { generateCTAHTML } from './templates/cta';
import { generateCSS } from './css-generator';
import { generateFormHandler } from './form-handler';
import { optimizeHTML } from './optimizer';

export interface GeneratorOptions {
  minify?: boolean;
  inlineCSS?: boolean;
  includeAnalytics?: boolean;
  formService?: 'formspree' | 'custom' | 'netlify-forms';
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
      formService: 'formspree',
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
      const css = generateCSS(pageState);
      
      // 4. Generate JavaScript (form handler)
      const javascript = this.generateJavaScript(pageState);
      
      // 5. Combine everything
      let html = this.combineHTML(baseHTML, sectionsHTML, css, javascript);
      
      // 6. Optimize if enabled
      if (this.options.minify) {
        html = optimizeHTML(html);
      }
      
      // 7. Validate output
      const validationWarnings = this.validateHTML(html);
      warnings.push(...validationWarnings);
      
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
      throw new Error(`HTML generation failed: ${error.message}`);
    }
  }
  
  private generateBaseStructure(pageState: PageState): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    
    <!-- SEO Meta Tags -->
    <title>${this.escapeHTML(pageState.title || 'Landing Page')}</title>
    <meta name="description" content="${this.escapeHTML(pageState.metadata?.description || '')}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${this.escapeHTML(pageState.title || '')}">
    <meta property="og:description" content="${this.escapeHTML(pageState.metadata?.description || '')}">
    <meta property="og:type" content="website">
    
    <!-- Favicon -->
    ${pageState.metadata?.favicon ? `<link rel="icon" href="${pageState.metadata.favicon}">` : ''}
    
    <!-- Preconnect to external domains -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://res.cloudinary.com">
    
    <!-- STYLES_PLACEHOLDER -->
</head>
<body>
    <!-- CONTENT_PLACEHOLDER -->
    <!-- SCRIPTS_PLACEHOLDER -->
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
    
    // Find CTA section with form
    const ctaSection = pageState.sections.find(s => s.type === 'cta');
    if (ctaSection?.data.formEnabled) {
      scripts.push(generateFormHandler(ctaSection, this.options.formService));
    }
    
    // Add smooth scroll behavior
    scripts.push(this.generateSmoothScroll());
    
    // Add analytics if enabled
    if (this.options.includeAnalytics) {
      scripts.push(this.generateAnalytics());
    }
    
    return scripts.length > 0 
      ? `<script>${scripts.join('\n')}</script>`
      : '';
  }
  
  private combineHTML(base: string, sections: string, css: string, js: string): string {
    return base
      .replace('<!-- STYLES_PLACEHOLDER -->', `<style>${css}</style>`)
      .replace('<!-- CONTENT_PLACEHOLDER -->', sections)
      .replace('<!-- SCRIPTS_PLACEHOLDER -->', js);
  }
  
  private escapeHTML(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
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
  
  private validateHTML(html: string): string[] {
    const warnings: string[] = [];
    
    // Check size
    const size = new Blob([html]).size;
    if (size > 100 * 1024) {
      warnings.push(`HTML size (${(size / 1024).toFixed(2)}KB) exceeds recommended 100KB`);
    }
    
    // Check for required elements
    if (!html.includes('<title>')) {
      warnings.push('Missing <title> tag');
    }
    
    if (!html.includes('viewport')) {
      warnings.push('Missing viewport meta tag');
    }
    
    return warnings;
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
    // Placeholder for Google Analytics or other tracking
    return `
    // Analytics placeholder
    console.log('Page view tracked');`;
  }
}
```

### 1.2 Section Template Modules

#### Create `/src/lib/html-generator/templates/hero.ts`

```typescript
import { HeroSection } from '@/types/builder.types';

export function generateHeroHTML(section: HeroSection): string {
  const { data } = section;
  
  // Determine background style
  const backgroundStyle = data.backgroundType === 'image' && data.backgroundImage
    ? `background-image: url('${data.backgroundImage}'); background-size: cover; background-position: center;`
    : data.backgroundType === 'gradient' && data.backgroundGradient
    ? `background: ${data.backgroundGradient};`
    : `background-color: ${data.backgroundColor};`;
  
  return `
    <section id="hero" class="hero-section" style="${backgroundStyle}">
      <div class="hero-content" style="text-align: ${data.alignment};">
        <h1 class="hero-title" style="color: ${data.textColor};">
          ${escapeHTML(data.headline)}
        </h1>
        <p class="hero-subtitle" style="color: ${data.textColor};">
          ${escapeHTML(data.subheadline)}
        </p>
        ${data.buttonText ? `
          <button class="hero-button" style="background-color: ${data.buttonColor};">
            ${escapeHTML(data.buttonText)}
          </button>
        ` : ''}
      </div>
    </section>
  `;
}

function escapeHTML(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
```

#### Create `/src/lib/html-generator/templates/content.ts`

```typescript
import { ContentSection } from '@/types/builder.types';

export function generateContentHTML(section: ContentSection): string {
  const { data } = section;
  
  const imageHTML = data.imageUrl ? `
    <div class="content-image">
      <img src="${data.imageUrl}" alt="${data.title}" loading="lazy">
    </div>
  ` : '';
  
  const textHTML = `
    <div class="content-text">
      <h2 class="content-title">${escapeHTML(data.title)}</h2>
      <div class="content-body">${escapeHTML(data.content)}</div>
    </div>
  `;
  
  const contentOrder = data.imagePosition === 'left' || data.imagePosition === 'top'
    ? `${imageHTML}${textHTML}`
    : `${textHTML}${imageHTML}`;
  
  return `
    <section id="content" class="content-section" style="background-color: ${data.backgroundColor};">
      <div class="content-container content-${data.imagePosition}">
        ${contentOrder}
      </div>
    </section>
  `;
}
```

#### Create `/src/lib/html-generator/templates/cta.ts`

```typescript
import { CTASection } from '@/types/builder.types';

export function generateCTAHTML(section: CTASection): string {
  const { data } = section;
  
  const formFields = [];
  
  if (data.formFields.name) {
    formFields.push(`
      <div class="form-group">
        <input type="text" name="name" placeholder="Your Name" required>
      </div>
    `);
  }
  
  if (data.formFields.email) {
    formFields.push(`
      <div class="form-group">
        <input type="email" name="email" placeholder="Your Email" required>
      </div>
    `);
  }
  
  if (data.formFields.phone) {
    formFields.push(`
      <div class="form-group">
        <input type="tel" name="phone" placeholder="Your Phone" required>
      </div>
    `);
  }
  
  return `
    <section id="cta" class="cta-section" style="background-color: ${data.backgroundColor};">
      <div class="cta-container">
        <h2 class="cta-title" style="color: ${data.textColor};">
          ${escapeHTML(data.title)}
        </h2>
        <p class="cta-description" style="color: ${data.textColor};">
          ${escapeHTML(data.description)}
        </p>
        
        ${data.formEnabled ? `
          <form id="contact-form" class="cta-form" data-email="${data.recipientEmail}">
            ${formFields.join('')}
            <button type="submit" class="cta-button" style="background-color: ${data.buttonColor};">
              ${escapeHTML(data.buttonText)}
            </button>
          </form>
          <div id="form-message" class="form-message"></div>
        ` : ''}
      </div>
    </section>
  `;
}
```

## 2. CSS Generation System

### Create `/src/lib/html-generator/css-generator.ts`

```typescript
import { PageState } from '@/types/builder.types';

export function generateCSS(pageState: PageState): string {
  const { globalStyles } = pageState;
  
  // Font configurations
  const fontFamilies = {
    modern: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    classic: '"Georgia", "Times New Roman", serif',
    playful: '"Comic Neue", "Comic Sans MS", cursive'
  };
  
  const baseCSS = `
    /* Reset and Base Styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html {
      scroll-behavior: smooth;
    }
    
    body {
      font-family: ${fontFamilies[globalStyles.fontFamily]};
      line-height: 1.6;
      color: #333;
      overflow-x: hidden;
    }
    
    img {
      max-width: 100%;
      height: auto;
      display: block;
    }
    
    /* Hero Section Styles */
    .hero-section {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      position: relative;
    }
    
    .hero-content {
      max-width: 800px;
      width: 100%;
      z-index: 1;
    }
    
    .hero-title {
      font-size: clamp(2rem, 5vw, 4rem);
      font-weight: 700;
      margin-bottom: 1rem;
      line-height: 1.2;
    }
    
    .hero-subtitle {
      font-size: clamp(1rem, 2.5vw, 1.5rem);
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    
    .hero-button {
      padding: 14px 32px;
      font-size: 1.1rem;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      color: white;
      display: inline-block;
    }
    
    .hero-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }
    
    /* Content Section Styles */
    .content-section {
      padding: 80px 20px;
    }
    
    .content-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      gap: 40px;
      align-items: center;
    }
    
    .content-left,
    .content-right {
      grid-template-columns: 1fr 1fr;
    }
    
    .content-top,
    .content-bottom {
      grid-template-columns: 1fr;
    }
    
    .content-title {
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      margin-bottom: 1rem;
      color: inherit;
    }
    
    .content-body {
      font-size: 1.1rem;
      line-height: 1.8;
    }
    
    .content-image img {
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    
    /* CTA Section Styles */
    .cta-section {
      padding: 80px 20px;
      text-align: center;
    }
    
    .cta-container {
      max-width: 600px;
      margin: 0 auto;
    }
    
    .cta-title {
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      margin-bottom: 1rem;
    }
    
    .cta-description {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    
    .cta-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .form-group input {
      width: 100%;
      padding: 14px 20px;
      font-size: 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      transition: border-color 0.3s;
      font-family: inherit;
    }
    
    .form-group input:focus {
      outline: none;
      border-color: ${globalStyles.primaryColor};
    }
    
    .cta-button {
      padding: 14px 32px;
      font-size: 1.1rem;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s, opacity 0.2s;
      color: white;
    }
    
    .cta-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }
    
    .cta-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .form-message {
      margin-top: 1rem;
      padding: 12px;
      border-radius: 8px;
      display: none;
      font-weight: 500;
    }
    
    .form-message.success {
      display: block;
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    
    .form-message.error {
      display: block;
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    
    /* Loading Spinner */
    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-section {
        min-height: 80vh;
        padding: 30px 15px;
      }
      
      .content-section,
      .cta-section {
        padding: 60px 15px;
      }
      
      .content-container {
        grid-template-columns: 1fr;
      }
      
      .content-left .content-image,
      .content-right .content-image {
        order: -1;
      }
      
      .hero-button,
      .cta-button {
        width: 100%;
      }
    }
    
    @media (max-width: 480px) {
      .hero-section {
        min-height: 70vh;
      }
      
      .content-section,
      .cta-section {
        padding: 40px 15px;
      }
    }
    
    /* Accessibility */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation: none !important;
        transition: none !important;
      }
    }
    
    /* Print Styles */
    @media print {
      .hero-section {
        min-height: auto;
      }
      
      .hero-button,
      .cta-button,
      .cta-form {
        display: none;
      }
    }
  `;
  
  return baseCSS.trim();
}
```

## 3. Form Handler JavaScript

### Create `/src/lib/html-generator/form-handler.ts`

```typescript
export function generateFormHandler(
  ctaSection: CTASection,
  service: 'formspree' | 'custom' | 'netlify-forms'
): string {
  
  if (service === 'formspree') {
    return generateFormspreeHandler(ctaSection);
  } else if (service === 'netlify-forms') {
    return generateNetlifyHandler(ctaSection);
  } else {
    return generateCustomHandler(ctaSection);
  }
}

function generateFormspreeHandler(ctaSection: CTASection): string {
  // Generate unique Formspree endpoint
  const formspreeId = generateFormspreeId(ctaSection.data.recipientEmail);
  
  return `
    (function() {
      const form = document.getElementById('contact-form');
      const message = document.getElementById('form-message');
      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      
      // Update form action
      form.action = 'https://formspree.io/f/${formspreeId}';
      form.method = 'POST';
      
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Disable button and show loading
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner"></span> Sending...';
        
        try {
          const response = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            // Success
            message.className = 'form-message success';
            message.textContent = 'Thank you! Your submission has been received.';
            form.reset();
            
            // Track conversion if analytics is present
            if (typeof gtag !== 'undefined') {
              gtag('event', 'form_submit', {
                'event_category': 'engagement',
                'event_label': 'contact_form'
              });
            }
          } else {
            // Error
            message.className = 'form-message error';
            message.textContent = 'Oops! There was a problem submitting your form.';
          }
        } catch (error) {
          message.className = 'form-message error';
          message.textContent = 'Network error. Please try again later.';
        } finally {
          // Re-enable button
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      });
      
      // Clear message when user starts typing
      form.addEventListener('input', function() {
        message.style.display = 'none';
      });
    })();
  `;
}

function generateNetlifyHandler(ctaSection: CTASection): string {
  return `
    (function() {
      const form = document.getElementById('contact-form');
      const message = document.getElementById('form-message');
      
      // Add Netlify attributes
      form.setAttribute('data-netlify', 'true');
      form.setAttribute('data-netlify-honeypot', 'bot-field');
      
      // Add hidden field for Netlify
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.name = 'form-name';
      hiddenInput.value = 'contact-form';
      form.appendChild(hiddenInput);
      
      // Add honeypot field
      const honeypot = document.createElement('input');
      honeypot.name = 'bot-field';
      honeypot.style.display = 'none';
      form.appendChild(honeypot);
      
      form.addEventListener('submit', function(e) {
        // Netlify handles the submission
        setTimeout(() => {
          message.className = 'form-message success';
          message.textContent = 'Thank you! Your submission has been received.';
          form.reset();
        }, 100);
      });
    })();
  `;
}

function generateCustomHandler(ctaSection: CTASection): string {
  return `
    (function() {
      const form = document.getElementById('contact-form');
      const message = document.getElementById('form-message');
      const recipientEmail = '${ctaSection.data.recipientEmail}';
      
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Add metadata
        data.recipientEmail = recipientEmail;
        data.pageUrl = window.location.href;
        data.timestamp = new Date().toISOString();
        
        try {
          // Custom endpoint would go here
          const response = await fetch('/api/submit-form', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
          
          if (response.ok) {
            message.className = 'form-message success';
            message.textContent = 'Thank you! Your submission has been received.';
            form.reset();
          } else {
            throw new Error('Submission failed');
          }
        } catch (error) {
          message.className = 'form-message error';
          message.textContent = 'There was an error. Please try again.';
        }
      });
    })();
  `;
}

function generateFormspreeId(email: string): string {
  // This would be replaced with actual Formspree form creation API
  // For now, return a placeholder
  return 'xyzabc123';
}
```

## 4. HTML Optimization Module

### Create `/src/lib/html-generator/optimizer.ts`

```typescript
export function optimizeHTML(html: string): string {
  let optimized = html;
  
  // 1. Remove comments
  optimized = removeComments(optimized);
  
  // 2. Remove unnecessary whitespace
  optimized = removeWhitespace(optimized);
  
  // 3. Minify inline CSS
  optimized = minifyCSS(optimized);
  
  // 4. Minify inline JavaScript
  optimized = minifyJS(optimized);
  
  // 5. Remove empty attributes
  optimized = removeEmptyAttributes(optimized);
  
  // 6. Optimize meta tags
  optimized = optimizeMetaTags(optimized);
  
  return optimized;
}

function removeComments(html: string): string {
  // Remove HTML comments except IE conditional comments
  return html.replace(/<!--(?!\[if).*?-->/gs, '');
}

function removeWhitespace(html: string): string {
  // Remove unnecessary whitespace between tags
  let result = html.replace(/>\s+</g, '><');
  
  // Preserve whitespace in pre, script, style, and textarea
  const preserveTags = ['pre', 'script', 'style', 'textarea'];
  preserveTags.forEach(tag => {
    const regex = new RegExp(`(<${tag}[^>]*>)(.*?)(<\/${tag}>)`, 'gs');
    result = result.replace(regex, (match, open, content, close) => {
      return open + content + close;
    });
  });
  
  // Remove leading/trailing whitespace
  result = result.trim();
  
  // Collapse multiple spaces to single space
  result = result.replace(/\s+/g, ' ');
  
  return result;
}

function minifyCSS(html: string): string {
  return html.replace(/<style[^>]*>(.*?)<\/style>/gs, (match, css) => {
    let minified = css;
    
    // Remove comments
    minified = minified.replace(/\/\*.*?\*\//gs, '');
    
    // Remove unnecessary whitespace
    minified = minified.replace(/\s+/g, ' ');
    minified = minified.replace(/:\s+/g, ':');
    minified = minified.replace(/;\s+/g, ';');
    minified = minified.replace(/\{\s+/g, '{');
    minified = minified.replace(/\}\s+/g, '}');
    minified = minified.replace(/,\s+/g, ',');
    
    // Remove last semicolon before closing brace
    minified = minified.replace(/;}/g, '}');
    
    // Remove unnecessary quotes
    minified = minified.replace(/url\(["']?([^"')]+)["']?\)/g, 'url($1)');
    
    return `<style>${minified}</style>`;
  });
}

function minifyJS(html: string): string {
  return html.replace(/<script[^>]*>(.*?)<\/script>/gs, (match, js) => {
    if (match.includes('src=')) {
      return match; // Don't modify external scripts
    }
    
    let minified = js;
    
    // Basic JS minification (for production, use proper minifier)
    // Remove comments
    minified = minified.replace(/\/\/.*$/gm, '');
    minified = minified.replace(/\/\*.*?\*\//gs, '');
    
    // Remove unnecessary whitespace
    minified = minified.replace(/\s+/g, ' ');
    minified = minified.replace(/;\s+/g, ';');
    minified = minified.replace(/\{\s+/g, '{');
    minified = minified.replace(/\}\s+/g, '}');
    
    return `<script>${minified}</script>`;
  });
}

function removeEmptyAttributes(html: string): string {
  // Remove attributes with empty values
  return html.replace(/\s+\w+=""/g, '');
}

function optimizeMetaTags(html: string): string {
  // Ensure charset is first in head
  let optimized = html;
  
  // Remove duplicate meta tags
  const metaTags: Set<string> = new Set();
  optimized = optimized.replace(/<meta[^>]+>/g, (match) => {
    const name = match.match(/name="([^"]+)"/)?.[1];
    const property = match.match(/property="([^"]+)"/)?.[1];
    const key = name || property;
    
    if (key && metaTags.has(key)) {
      return ''; // Remove duplicate
    }
    
    if (key) {
      metaTags.add(key);
    }
    
    return match;
  });
  
  return optimized;
}

export function validateOptimizedHTML(html: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check for required elements
  if (!html.includes('<!DOCTYPE html>')) {
    errors.push('Missing DOCTYPE declaration');
  }
  
  if (!html.includes('<html')) {
    errors.push('Missing html tag');
  }
  
  if (!html.includes('<head>')) {
    errors.push('Missing head tag');
  }
  
  if (!html.includes('<body>')) {
    errors.push('Missing body tag');
  }
  
  if (!html.includes('<title>')) {
    errors.push('Missing title tag');
  }
  
  if (!html.includes('viewport')) {
    errors.push('Missing viewport meta tag');
  }
  
  // Check for unclosed tags
  const openTags = html.match(/<([a-z]+)(?:\s|>)/gi) || [];
  const closeTags = html.match(/<\/([a-z]+)>/gi) || [];
  
  const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
  
  openTags.forEach(tag => {
    const tagName = tag.match(/<([a-z]+)/i)?.[1]?.toLowerCase();
    if (tagName && !selfClosing.includes(tagName)) {
      const closeTag = `</${tagName}>`;
      if (!html.includes(closeTag)) {
        errors.push(`Unclosed tag: ${tagName}`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

## 5. API Endpoint for HTML Generation

### Create `/src/app/api/generate-html/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { HTMLGenerator } from '@/lib/html-generator';
import { auth } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get page data from request
    const { pageState, options } = await request.json();
    
    if (!pageState) {
      return NextResponse.json(
        { error: 'Page state is required' },
        { status: 400 }
      );
    }
    
    // Generate HTML
    const generator = new HTMLGenerator(options);
    const result = await generator.generate(pageState);
    
    // Log generation for analytics
    console.log('HTML generated:', {
      pageId: pageState.id,
      size: result.size,
      warnings: result.warnings.length
    });
    
    return NextResponse.json({
      success: true,
      html: result.html,
      size: result.size,
      warnings: result.warnings,
      metadata: result.metadata
    });
    
  } catch (error) {
    console.error('HTML generation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate HTML', details: error.message },
      { status: 500 }
    );
  }
}

// Preview endpoint for testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pageId = searchParams.get('pageId');
  
  if (!pageId) {
    return new NextResponse('Page ID is required', { status: 400 });
  }
  
  // This would fetch the page from database
  // For now, return a test response
  return new NextResponse(
    '<html><body><h1>Preview Mode</h1></body></html>',
    {
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
}
```

## 6. Deployment Pipeline Integration

### Create `/src/lib/deployment/github-deploy.ts`

```typescript
import { Octokit } from '@octokit/rest';

export class GitHubDeployer {
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    this.owner = process.env.GITHUB_OWNER!;
    this.repo = process.env.GITHUB_REPO!;
  }
  
  async deployHTML(
    userId: string,
    pageId: string,
    html: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const path = `sites/${userId}/${pageId}/index.html`;
      
      // Check if file exists
      let sha: string | undefined;
      try {
        const existing = await this.octokit.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path
        });
        
        if (!Array.isArray(existing.data)) {
          sha = existing.data.sha;
        }
      } catch (e) {
        // File doesn't exist, will create new
      }
      
      // Create or update file
      const response = await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path,
        message: `Deploy page ${pageId} for user ${userId}`,
        content: Buffer.from(html).toString('base64'),
        sha
      });
      
      // Generate deployed URL
      const deployedUrl = `https://${this.owner}.github.io/${this.repo}/${userId}/${pageId}`;
      
      return {
        success: true,
        url: deployedUrl
      };
      
    } catch (error) {
      console.error('GitHub deployment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async checkDeploymentStatus(
    userId: string,
    pageId: string
  ): Promise<{ exists: boolean; lastUpdated?: string }> {
    try {
      const path = `sites/${userId}/${pageId}/index.html`;
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path
      });
      
      if (!Array.isArray(response.data)) {
        // Parse commit to get last updated time
        const commit = await this.octokit.repos.getCommit({
          owner: this.owner,
          repo: this.repo,
          ref: response.data.sha
        });
        
        return {
          exists: true,
          lastUpdated: commit.data.commit.author?.date
        };
      }
      
      return { exists: false };
      
    } catch (error) {
      return { exists: false };
    }
  }
}
```

### Create `/src/app/api/deploy/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { HTMLGenerator } from '@/lib/html-generator';
import { GitHubDeployer } from '@/lib/deployment/github-deploy';

export async function POST(request: NextRequest) {
  try {
    const { pageState, userId } = await request.json();
    
    // Validate input
    if (!pageState || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Step 1: Generate HTML
    const generator = new HTMLGenerator({
      minify: true,
      inlineCSS: true,
      formService: 'formspree'
    });
    
    const generatedHTML = await generator.generate(pageState);
    
    if (generatedHTML.warnings.length > 0) {
      console.warn('HTML generation warnings:', generatedHTML.warnings);
    }
    
    // Step 2: Deploy to GitHub
    const deployer = new GitHubDeployer();
    const deployResult = await deployer.deployHTML(
      userId,
      pageState.id,
      generatedHTML.html
    );
    
    if (!deployResult.success) {
      throw new Error(deployResult.error || 'Deployment failed');
    }
    
    // Step 3: Save deployment info to database (optional)
    // await saveDeploymentInfo(userId, pageState.id, deployResult.url);
    
    return NextResponse.json({
      success: true,
      url: deployResult.url,
      size: generatedHTML.size,
      warnings: generatedHTML.warnings,
      deployedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Deployment error:', error);
    
    return NextResponse.json(
      { error: 'Deployment failed', details: error.message },
      { status: 500 }
    );
  }
}
```

## 7. Testing Requirements

### Unit Tests

```typescript
// __tests__/html-generator.test.ts
describe('HTMLGenerator', () => {
  describe('generate()', () => {
    it('should generate valid HTML5 document');
    it('should include all sections in correct order');
    it('should escape HTML in user content');
    it('should inline all CSS');
    it('should include form handler for CTA sections');
    it('should optimize HTML when minify option is true');
    it('should generate valid meta tags');
  });
  
  describe('validateHTML()', () => {
    it('should detect missing required elements');
    it('should detect unclosed tags');
    it('should check file size limits');
  });
});

describe('CSS Generator', () => {
  it('should generate responsive styles');
  it('should apply global styles correctly');
  it('should include print styles');
  it('should support all font families');
});

describe('Form Handler', () => {
  it('should generate Formspree integration');
  it('should generate Netlify Forms integration');
  it('should include validation logic');
  it('should handle submission states');
});

describe('Optimizer', () => {
  it('should remove comments');
  it('should minify CSS');
  it('should minify JavaScript');
  it('should preserve functionality after optimization');
});
```

### Integration Tests

```typescript
describe('Deployment Pipeline', () => {
  it('should generate and deploy HTML successfully');
  it('should handle GitHub API errors gracefully');
  it('should update existing files');
  it('should generate correct URLs');
});
```

## 8. Performance Requirements

| Metric | Target | Maximum |
|--------|--------|---------|
| HTML Generation | < 500ms | 2s |
| Optimization | < 200ms | 1s |
| Total Size | < 50KB | 100KB |
| GitHub Push | < 2s | 5s |
| Total Deployment | < 5s | 10s |

## 9. Deliverables

### Files to Create
1. `/src/lib/html-generator/index.ts`
2. `/src/lib/html-generator/templates/hero.ts`
3. `/src/lib/html-generator/templates/content.ts`
4. `/src/lib/html-generator/templates/cta.ts`
5. `/src/lib/html-generator/css-generator.ts`
6. `/src/lib/html-generator/form-handler.ts`
7. `/src/lib/html-generator/optimizer.ts`
8. `/src/lib/deployment/github-deploy.ts`
9. `/src/app/api/generate-html/route.ts`
10. `/src/app/api/deploy/route.ts`

### Updated Components
1. Update Toolbar component with "Publish" button
2. Add deployment status indicator
3. Create PublishModal component
4. Add deployment history tracking

## 10. Success Criteria

### Must Have
- [ ] Generate valid HTML5 documents
- [ ] All user content properly escaped
- [ ] Forms submit correctly
- [ ] Mobile responsive design works
- [ ] Deployment to GitHub successful
- [ ] Live URL accessible via Netlify

### Should Have
- [ ] HTML size under 100KB
- [ ] PageSpeed score > 90
- [ ] Proper SEO meta tags
- [ ] Analytics integration ready
- [ ] Cross-browser compatibility

### Nice to Have
- [ ] Progressive enhancement
- [ ] AMP version generation
- [ ] Multiple language support
- [ ] A/B testing ready

## Timeline
- HTML template system
- CSS generation and inlining
- Form handler implementation
- Optimization module
- GitHub deployment integration
- Testing and debugging
- Documentation and cleanup

## Risk Mitigation

1. **Large HTML Size**: Implement aggressive minification
2. **Form Submission Failures**: Provide fallback email links
3. **GitHub API Limits**: Implement rate limiting and queuing
4. **Browser Compatibility**: Test on multiple browsers
5. **Performance Issues**: Cache generated HTML


*This phase is critical for making the landing pages actually deployable and functional. All generated HTML must be self-contained and work without any external dependencies.*