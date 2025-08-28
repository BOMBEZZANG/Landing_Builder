import { CTASection } from '@/types/builder.types';

export function generateCTAHTML(section: CTASection): string {
  const { data } = section;
  
  // Generate form fields if form is enabled
  const formFields = [];
  
  if (data.formEnabled) {
    if (data.formFields.name) {
      formFields.push(`
        <div class="form-group">
          <input type="text" name="name" placeholder="Your Name" class="form-field" autocomplete="name" required>
        </div>
      `);
    }
    
    if (data.formFields.email) {
      formFields.push(`
        <div class="form-group">
          <input type="email" name="email" placeholder="Your Email" class="form-field" autocomplete="email" required>
        </div>
      `);
    }
    
    if (data.formFields.phone) {
      formFields.push(`
        <div class="form-group">
          <input type="tel" name="phone" placeholder="Your Phone" class="form-field" autocomplete="tel" required>
        </div>
      `);
    }
  }
  
  // Generate form or button
  const actionHTML = data.formEnabled ? `
    <form id="contact-form" class="form-container" 
          data-form-handler="true"
          data-page-id="landing-page-${Date.now()}"
          data-recipient-email="${escapeHTML(data.recipientEmail)}">
      <!-- Hidden fields for form metadata -->
      <input type="hidden" name="recipientEmail" value="${escapeHTML(data.recipientEmail)}">
      <input type="hidden" name="pageId" value="landing-page-${Date.now()}">
      ${formFields.join('')}
      <button type="submit" class="btn cta-button" style="background-color: ${data.buttonColor}; color: white;">
        ${escapeHTML(data.buttonText)}
      </button>
      <div id="form-message" class="form-message" style="display: none;"></div>
    </form>
    
    <!-- Success Modal -->
    <div id="success-modal" class="success-modal" style="display: none;">
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>✅ Success!</h3>
          <button class="modal-close" type="button">&times;</button>
        </div>
        <div class="modal-body">
          <p>Thank you! Your message has been sent successfully.</p>
          <p>We'll get back to you soon.</p>
        </div>
        <div class="modal-footer">
          <button class="modal-ok-btn" type="button">OK</button>
        </div>
      </div>
    </div>
  ` : `
    <a href="#" class="btn cta-button" style="background-color: ${data.buttonColor}; color: white;">
      ${escapeHTML(data.buttonText)}
    </a>
  `;
  
  return `
    <section id="cta-${section.order}" class="cta-section text-center" style="background-color: ${data.backgroundColor};">
      <div class="cta-container">
        <h2 class="cta-title font-bold" style="color: ${data.textColor};">
          ${escapeHTML(data.title)}
        </h2>
        <p class="cta-description font-light" style="color: ${data.textColor};">
          ${escapeHTML(data.description)}
        </p>
        ${actionHTML}
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