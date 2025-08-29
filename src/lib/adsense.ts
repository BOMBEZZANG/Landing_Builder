export function getAdSenseConfig() {
  return {
    clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
  };
}

export function generateAdSenseScript(): string {
  const config = getAdSenseConfig();
  
  if (!config.clientId) {
    console.warn('AdSense client ID is not configured. AdSense will not be included.');
    return '';
  }
  
  return `
    <!-- Google AdSense - Enhanced for Verification -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.clientId}"
            crossorigin="anonymous"
            data-ad-client="${config.clientId}"
            data-checked-head="true"></script>`;
}

export function generateAdSenseAutoAds(): string {
  const config = getAdSenseConfig();
  
  if (!config.clientId) {
    return '';
  }
  
  return `
    <!-- AdSense Auto Ads - Enhanced Configuration -->
    <script>
      (adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: "${config.clientId}",
        enable_page_level_ads: true,
        overlays: {bottom: true},
        auto_ad_client: "${config.clientId}"
      });
      
      // AdSense verification helper
      window.adsbygoogle = window.adsbygoogle || [];
    </script>`;
}

export function generateAdSenseDisplayAd(options: {
  slotId?: string;
  style?: string;
  format?: string;
  responsive?: boolean;
}): string {
  const config = getAdSenseConfig();
  
  if (!config.clientId) {
    return '';
  }
  
  const {
    slotId = '',
    style = 'display:block',
    format = 'auto',
    responsive = true
  } = options;
  
  return `
    <!-- AdSense Display Ad -->
    <ins class="adsbygoogle"
         style="${style}"
         data-ad-client="${config.clientId}"
         ${slotId ? `data-ad-slot="${slotId}"` : ''}
         data-ad-format="${format}"
         ${responsive ? 'data-full-width-responsive="true"' : ''}></ins>
    <script>
         (adsbygoogle = window.adsbygoogle || []).push({});
    </script>`;
}