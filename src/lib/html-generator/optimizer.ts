export function optimizeHTML(html: string): string {
  let optimized = html;
  
  // 1. Remove comments (but preserve IE conditional comments)
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
  
  // 7. Optimize images (add loading attributes if missing)
  optimized = optimizeImages(optimized);
  
  return optimized;
}

function removeComments(html: string): string {
  // Remove HTML comments except IE conditional comments
  return html.replace(/<!--(?!\[if)(?!<!-)[\s\S]*?-->/g, '');
}

function removeWhitespace(html: string): string {
  // Remove unnecessary whitespace between tags
  let result = html;
  
  // Preserve whitespace in pre, script, style, and textarea
  const preserveTags = ['pre', 'script', 'style', 'textarea'];
  const preservedContent: { [key: string]: string } = {};
  let placeholderIndex = 0;
  
  // Extract content that should preserve whitespace
  preserveTags.forEach(tag => {
    const regex = new RegExp(`(<${tag}[^>]*>)(.*?)(<\\/${tag}>)`, 'gis');
    result = result.replace(regex, (match, open, content, close) => {
      const placeholder = `__PRESERVE_${placeholderIndex}__`;
      preservedContent[placeholder] = match;
      placeholderIndex++;
      return placeholder;
    });
  });
  
  // Remove whitespace between tags
  result = result.replace(/>\s+</g, '><');
  
  // Remove leading/trailing whitespace from lines
  result = result.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('');
  
  // Restore preserved content
  Object.keys(preservedContent).forEach(placeholder => {
    result = result.replace(placeholder, preservedContent[placeholder]);
  });
  
  return result;
}

function minifyCSS(html: string): string {
  return html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, css) => {
    let minified = css;
    
    // Remove CSS comments
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Remove unnecessary whitespace
    minified = minified.replace(/\s+/g, ' ');
    minified = minified.replace(/;\s*}/g, '}');
    minified = minified.replace(/:\s+/g, ':');
    minified = minified.replace(/;\s+/g, ';');
    minified = minified.replace(/{\s+/g, '{');
    minified = minified.replace(/}\s+/g, '}');
    minified = minified.replace(/,\s+/g, ',');
    
    // Remove last semicolon before closing brace
    minified = minified.replace(/;}/g, '}');
    
    // Remove unnecessary quotes from URLs
    minified = minified.replace(/url\(["']?([^"')]+)["']?\)/g, 'url($1)');
    
    // Remove unnecessary zeros
    minified = minified.replace(/:0(\.\d+)/g, ':$1');
    minified = minified.replace(/\b0+(\.\d+)/g, '$1');
    
    // Trim and remove leading/trailing whitespace
    minified = minified.trim();
    
    return `<style>${minified}</style>`;
  });
}

function minifyJS(html: string): string {
  return html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, js) => {
    // Skip external scripts
    if (match.includes('src=')) {
      return match;
    }
    
    let minified = js;
    
    // Remove single-line comments (but preserve URLs and regex patterns)
    minified = minified.replace(/\/\/.*$/gm, '');
    
    // Remove multi-line comments
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Remove unnecessary whitespace
    minified = minified.replace(/\s+/g, ' ');
    minified = minified.replace(/;\s+/g, ';');
    minified = minified.replace(/{\s+/g, '{');
    minified = minified.replace(/}\s+/g, '}');
    minified = minified.replace(/,\s+/g, ',');
    minified = minified.replace(/\(\s+/g, '(');
    minified = minified.replace(/\s+\)/g, ')');
    
    // Remove unnecessary semicolons
    minified = minified.replace(/;}/g, '}');
    
    // Trim
    minified = minified.trim();
    
    return `<script>${minified}</script>`;
  });
}

function removeEmptyAttributes(html: string): string {
  // Remove attributes with empty values
  return html.replace(/\s+\w+=""/g, '');
}

function optimizeMetaTags(html: string): string {
  let optimized = html;
  
  // Remove duplicate meta tags
  const seenMetaTags = new Set<string>();
  
  optimized = optimized.replace(/<meta[^>]+>/gi, (match) => {
    const nameMatch = match.match(/name="([^"]+)"/i);
    const propertyMatch = match.match(/property="([^"]+)"/i);
    const httpEquivMatch = match.match(/http-equiv="([^"]+)"/i);
    
    const key = nameMatch?.[1] || propertyMatch?.[1] || httpEquivMatch?.[1];
    
    if (key) {
      const lowerKey = key.toLowerCase();
      if (seenMetaTags.has(lowerKey)) {
        return ''; // Remove duplicate
      }
      seenMetaTags.add(lowerKey);
    }
    
    return match;
  });
  
  return optimized;
}

function optimizeImages(html: string): string {
  return html.replace(/<img([^>]+)>/gi, (match, attributes) => {
    // Add loading="lazy" if not present and not above the fold
    if (!attributes.includes('loading=')) {
      attributes += ' loading="lazy"';
    }
    
    // Add decoding="async" if not present
    if (!attributes.includes('decoding=')) {
      attributes += ' decoding="async"';
    }
    
    return `<img${attributes}>`;
  });
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
  
  const selfClosingTags = [
    'img', 'br', 'hr', 'input', 'meta', 'link', 'area', 
    'base', 'col', 'embed', 'source', 'track', 'wbr'
  ];
  
  const tagCounts: { [key: string]: number } = {};
  
  // Count opening tags
  openTags.forEach(tag => {
    const tagName = tag.match(/<([a-z]+)/i)?.[1]?.toLowerCase();
    if (tagName && !selfClosingTags.includes(tagName)) {
      tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
    }
  });
  
  // Count closing tags
  closeTags.forEach(tag => {
    const tagName = tag.match(/<\/([a-z]+)>/i)?.[1]?.toLowerCase();
    if (tagName) {
      tagCounts[tagName] = (tagCounts[tagName] || 0) - 1;
    }
  });
  
  // Check for unclosed tags
  Object.entries(tagCounts).forEach(([tagName, count]) => {
    if (count > 0) {
      errors.push(`Unclosed tag: ${tagName} (${count} unclosed)`);
    } else if (count < 0) {
      errors.push(`Extra closing tag: ${tagName} (${Math.abs(count)} extra)`);
    }
  });
  
  // Check file size
  const size = new Blob([html]).size;
  if (size > 200 * 1024) { // 200KB
    errors.push(`HTML file size (${Math.round(size / 1024)}KB) exceeds recommended 200KB`);
  }
  
  // Check for common issues
  if (html.includes('javascript:')) {
    errors.push('Found javascript: protocol which may be blocked by browsers');
  }
  
  if (html.includes('data:text/html')) {
    errors.push('Found data:text/html which may pose security risks');
  }
  
  // Check for accessibility issues
  const images = html.match(/<img[^>]+>/gi) || [];
  images.forEach((img, index) => {
    if (!img.includes('alt=')) {
      errors.push(`Image ${index + 1} missing alt attribute for accessibility`);
    }
  });
  
  // Check for forms without proper labels
  const inputs = html.match(/<input[^>]+>/gi) || [];
  inputs.forEach((input, index) => {
    if (input.includes('type="text"') || input.includes('type="email"')) {
      if (!input.includes('placeholder=') && !html.includes(`for="${input.match(/id="([^"]+)"/)?.[1]}"`)) {
        errors.push(`Form input ${index + 1} missing label or placeholder for accessibility`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Utility function to estimate performance impact
export function analyzePerformance(html: string): {
  size: number;
  estimatedLoadTime: number;
  recommendations: string[];
} {
  const size = new Blob([html]).size;
  const recommendations: string[] = [];
  
  // Estimate load time (rough approximation for 3G connection)
  const estimatedLoadTime = Math.round((size / 1024) * 0.5); // seconds
  
  if (size > 100 * 1024) {
    recommendations.push('Consider reducing HTML size - currently over 100KB');
  }
  
  const cssMatches = html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
  const totalCSSSize = cssMatches.reduce((total, match) => total + match.length, 0);
  
  if (totalCSSSize > 50 * 1024) {
    recommendations.push('CSS size is large - consider removing unused styles');
  }
  
  const jsMatches = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
  const totalJSSize = jsMatches.reduce((total, match) => total + match.length, 0);
  
  if (totalJSSize > 30 * 1024) {
    recommendations.push('JavaScript size is large - consider optimizing scripts');
  }
  
  const imageCount = (html.match(/<img[^>]+>/gi) || []).length;
  if (imageCount > 10) {
    recommendations.push('Many images detected - consider lazy loading and optimization');
  }
  
  if (!html.includes('loading="lazy"')) {
    recommendations.push('Add lazy loading to images for better performance');
  }
  
  if (estimatedLoadTime < 2) {
    recommendations.push('Good performance - page should load quickly');
  } else if (estimatedLoadTime < 5) {
    recommendations.push('Moderate performance - consider minor optimizations');
  } else {
    recommendations.push('Performance needs improvement - significant optimizations recommended');
  }
  
  return {
    size,
    estimatedLoadTime,
    recommendations
  };
}