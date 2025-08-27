import { HeroSection } from '@/types/builder.types';

export function generateHeroHTML(section: HeroSection): string {
  const { data } = section;
  
  // Determine background style
  const backgroundStyle = data.backgroundType === 'image' && data.backgroundImage
    ? `background-image: url('${data.backgroundImage}'); background-size: cover; background-position: center; background-attachment: fixed;`
    : data.backgroundType === 'gradient' && data.backgroundGradient
    ? `background: ${data.backgroundGradient};`
    : `background-color: ${data.backgroundColor};`;
  
  // Add overlay for better text readability when using background images
  const overlay = data.backgroundType === 'image' && data.backgroundImage 
    ? '<div class="absolute inset-0 bg-black bg-opacity-30"></div>'
    : '';
    
  // Determine button link based on action
  const buttonHref = data.buttonAction === 'scroll' ? '#content-0' : 
                    data.buttonAction === 'form' ? '#cta-0' : '#';
  
  return `
    <section id="hero" class="hero-section relative flex items-center justify-center text-${data.alignment}" style="${backgroundStyle}">
      ${overlay}
      <div class="container relative z-10">
        <h1 class="hero-title font-bold" style="color: ${data.textColor};">
          ${escapeHTML(data.headline)}
        </h1>
        <p class="hero-subtitle font-light" style="color: ${data.textColor};">
          ${escapeHTML(data.subheadline)}
        </p>
        ${data.buttonText ? `
          <a href="${buttonHref}" class="btn hero-button" style="background-color: ${data.buttonColor}; color: white;">
            ${escapeHTML(data.buttonText)}
          </a>
        ` : ''}
      </div>
    </section>
  `.trim();
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}