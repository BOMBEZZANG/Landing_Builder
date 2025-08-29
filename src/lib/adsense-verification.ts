// AdSense verification helpers

export interface AdSenseVerificationOptions {
  method: 'code' | 'meta' | 'html-file';
  metaTag?: string; // For meta tag verification
  htmlContent?: string; // For HTML file verification
}

export function generateAdSenseVerificationMeta(metaTag: string): string {
  // AdSense verification meta tag
  // Example: <meta name="google-site-verification" content="your-verification-code" />
  return metaTag;
}

export function generateAdSenseVerificationHTML(htmlContent: string): string {
  // For HTML file verification method
  return htmlContent;
}

// Enhanced AdSense script with verification-friendly attributes
export function generateAdSenseScriptWithVerification(): string {
  const config = {
    clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
  };
  
  if (!config.clientId) {
    return '';
  }
  
  return `
    <!-- Google AdSense - Enhanced for Verification -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.clientId}"
            crossorigin="anonymous"
            data-ad-client="${config.clientId}"
            data-checked-head="true"></script>
    
    <!-- AdSense Auto Ads with Enhanced Configuration -->
    <script>
      (adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: "${config.clientId}",
        enable_page_level_ads: true,
        overlays: {bottom: true},
        auto_ad_client: "${config.clientId}"
      });
    </script>`;
}

export function getAdSenseVerificationStatus(): {
  hasClientId: boolean;
  clientId?: string;
  publisherId?: string;
} {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const publisherId = clientId?.replace('ca-pub-', '');
  
  return {
    hasClientId: !!clientId,
    clientId,
    publisherId
  };
}