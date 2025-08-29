// src/lib/ga4-analytics.ts

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export function getGA4Config() {
  return {
    measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
  };
}

/**
 * Generate GA4 script for static HTML pages
 */
export function generateGA4Script(): string {
  const config = getGA4Config();
  
  if (!config.measurementId) {
    console.warn('GA4 Measurement ID is not configured.');
    return '';
  }
  
  return `
    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${config.measurementId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${config.measurementId}');
      
      // Track page view
      gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      });
      
      // Track form submissions
      document.addEventListener('DOMContentLoaded', function() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
          form.addEventListener('submit', function(e) {
            gtag('event', 'form_submit', {
              event_category: 'engagement',
              event_label: form.id || 'contact_form'
            });
          });
        });
        
        // Track button clicks
        const buttons = document.querySelectorAll('button, a.btn, a[role="button"]');
        buttons.forEach(button => {
          button.addEventListener('click', function() {
            const buttonText = button.textContent || button.innerText || 'Unknown';
            gtag('event', 'click', {
              event_category: 'engagement',
              event_label: buttonText.trim().substring(0, 100)
            });
          });
        });
      });
      
      console.log('GA4 Analytics initialized');
    </script>`;
}

/**
 * Track custom events in the application
 */
export function trackEvent(
  eventName: string,
  parameters?: Record<string, any>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
}

/**
 * Track page views for SPAs
 */
export function trackPageView(url?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID!, {
      page_path: url || window.location.pathname,
    });
  }
}