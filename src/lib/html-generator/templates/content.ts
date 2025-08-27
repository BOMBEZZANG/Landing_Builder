import { ContentSection } from '@/types/builder.types';

export function generateContentHTML(section: ContentSection): string {
  const { data } = section;
  
  const imageHTML = data.imageUrl ? `
    <div class="content-image">
      <img src="${data.imageUrl}" alt="${escapeHTML(data.title)}" class="responsive-image" loading="lazy">
    </div>
  ` : '';
  
  const textHTML = `
    <div class="content-text">
      <h2 class="content-title" style="color: ${data.textColor};">${escapeHTML(data.title)}</h2>
      <div class="content-body" style="color: ${data.textColor};">${formatText(data.content)}</div>
    </div>
  `;
  
  // Determine layout based on image position
  let containerClass = 'content-container';
  let contentOrder = '';
  
  if (data.imageUrl) {
    switch (data.imagePosition) {
      case 'left':
        containerClass += ' content-grid';
        contentOrder = imageHTML + textHTML;
        break;
      case 'right':
        containerClass += ' content-grid';
        contentOrder = textHTML + imageHTML;
        break;
      case 'top':
        containerClass += ' content-stacked';
        contentOrder = imageHTML + textHTML;
        break;
      case 'bottom':
        containerClass += ' content-stacked';
        contentOrder = textHTML + imageHTML;
        break;
      default:
        contentOrder = textHTML + imageHTML;
    }
  } else {
    contentOrder = textHTML;
  }
  
  // Determine padding class
  const paddingClass = data.padding === 'small' ? 'py-8' : 
                      data.padding === 'large' ? 'py-24' : 'py-16';
  
  return `
    <section id="content-${section.order}" class="content-section ${paddingClass}" style="background-color: ${data.backgroundColor};">
      <div class="${containerClass}">
        ${contentOrder}
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

function formatText(text: string): string {
  return text.split('\n')
    .filter(line => line.trim()) // Remove empty lines
    .map(paragraph => `<p>${escapeHTML(paragraph.trim())}</p>`)
    .join('');
}