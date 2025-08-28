import { CTASection } from '@/types/builder.types';

export function generateFormHandler(
  ctaSection: CTASection,
  service?: 'formspree' | 'custom' | 'netlify-forms'
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
  // Generate unique Formspree endpoint based on recipient email
  const formspreeId = generateFormspreeId(ctaSection.data.recipientEmail);
  
  return `
    (function() {
      const form = document.getElementById('contact-form');
      if (!form) return;
      
      const message = document.getElementById('form-message');
      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonText = submitButton ? submitButton.textContent : 'Submit';
      
      // Update form action for Formspree
      form.action = 'https://formspree.io/f/${formspreeId}';
      form.method = 'POST';
      
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Disable button and show loading
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.innerHTML = '<span class="spinner"></span> Sending...';
        }
        
        // Hide any existing messages
        if (message) {
          message.style.display = 'none';
        }
        
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
            if (message) {
              message.className = 'form-message success';
              message.textContent = 'Thank you! Your message has been sent successfully.';
              message.style.display = 'block';
            }
            form.reset();
            
            // Track conversion if analytics is present
            if (typeof gtag !== 'undefined') {
              gtag('event', 'form_submit', {
                'event_category': 'engagement',
                'event_label': 'contact_form',
                'value': 1
              });
            }
          } else {
            throw new Error('Form submission failed');
          }
        } catch (error) {
          // Error
          if (message) {
            message.className = 'form-message error';
            message.textContent = 'Sorry, there was an error sending your message. Please try again.';
            message.style.display = 'block';
          }
          console.error('Form submission error:', error);
        } finally {
          // Re-enable button
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
          }
        }
      });
      
      // Clear message when user starts typing
      form.addEventListener('input', function() {
        if (message && message.style.display !== 'none') {
          message.style.display = 'none';
        }
      });
    })();
  `.trim();
}

function generateNetlifyHandler(ctaSection: CTASection): string {
  return `
    (function() {
      const form = document.getElementById('contact-form');
      if (!form) return;
      
      const message = document.getElementById('form-message');
      
      // Add Netlify attributes
      form.setAttribute('data-netlify', 'true');
      form.setAttribute('data-netlify-honeypot', 'bot-field');
      form.setAttribute('name', 'contact-form');
      
      // Add hidden field for Netlify
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.name = 'form-name';
      hiddenInput.value = 'contact-form';
      form.appendChild(hiddenInput);
      
      // Add honeypot field (invisible spam protection)
      const honeypot = document.createElement('input');
      honeypot.name = 'bot-field';
      honeypot.style.display = 'none';
      honeypot.setAttribute('tabindex', '-1');
      honeypot.setAttribute('autocomplete', 'off');
      form.appendChild(honeypot);
      
      form.addEventListener('submit', function(e) {
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Show loading state
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.innerHTML = '<span class="spinner"></span> Sending...';
        }
        
        // Netlify handles the submission automatically
        // Show success message after a brief delay
        setTimeout(() => {
          if (message) {
            message.className = 'form-message success';
            message.textContent = 'Thank you! Your message has been sent successfully.';
            message.style.display = 'block';
          }
          
          // Track conversion
          if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
              'event_category': 'engagement',
              'event_label': 'netlify_form'
            });
          }
          
          form.reset();
          
          // Re-enable button
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Message Sent!';
            
            // Reset button text after 3 seconds
            setTimeout(() => {
              if (submitButton) {
                submitButton.textContent = '${ctaSection.data.buttonText}';
              }
            }, 3000);
          }
        }, 1000);
      });
    })();
  `.trim();
}

function generateCustomHandler(ctaSection: CTASection): string {
  // IMPORTANT: This URL must point to your deployed landing page builder API
  // The generated HTML will use this URL to submit forms
  const apiUrl = 'https://easy-landing-omega.vercel.app';
  return `
    (function() {
      const form = document.getElementById('contact-form');
      if (!form) return;
      
      const message = document.getElementById('form-message');
      const recipientEmail = '${ctaSection.data.recipientEmail}';
      
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton ? submitButton.textContent : 'Submit';
        
        // Disable form and show loading state
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.innerHTML = '<span class="spinner"></span> Sending...';
        }
        
        // Hide any existing messages
        if (message) {
          message.style.display = 'none';
        }
        
        // Collect form data
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
          data[key] = value;
        });
        
        // Add metadata
        const submissionData = {
          formData: data,
          recipientEmail: recipientEmail,
          pageUrl: window.location.href,
          pageTitle: document.title,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer || 'Direct',
          pageId: form.getAttribute('data-page-id') || 'unknown'
        };
        
        try {
          // Use absolute URL for the API endpoint to ensure it works on deployed static sites
          const apiEndpoint = '${apiUrl}/api/submit-form';
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            mode: 'cors',
            body: JSON.stringify(submissionData)
          });
          
          const result = await response.json();
          
          if (response.ok && result.success) {
            // Success
            if (message) {
              message.className = 'form-message success';
              message.textContent = result.message || 'Thank you! Your message has been sent successfully.';
              message.style.display = 'block';
            }
            form.reset();
            
            // Track successful submission
            if (typeof gtag !== 'undefined') {
              gtag('event', 'form_submit', {
                'event_category': 'engagement',
                'event_label': 'custom_form',
                'custom_parameters': {
                  'recipient_email': recipientEmail
                }
              });
            }
          } else {
            throw new Error(result.error || 'Submission failed');
          }
        } catch (error) {
          // Error handling
          if (message) {
            message.className = 'form-message error';
            message.textContent = 'Sorry, there was an error sending your message. Please try again or contact us directly.';
            message.style.display = 'block';
          }
          console.error('Form submission error:', error);
          
          // Track error
          if (typeof gtag !== 'undefined') {
            gtag('event', 'form_error', {
              'event_category': 'error',
              'event_label': 'form_submission_failed'
            });
          }
        } finally {
          // Re-enable form
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
          }
        }
      });
      
      // Real-time form validation
      const inputs = form.querySelectorAll('input[required]');
      inputs.forEach(input => {
        input.addEventListener('blur', function() {
          validateField(this);
        });
        
        input.addEventListener('input', function() {
          if (this.classList.contains('error')) {
            validateField(this);
          }
        });
      });
      
      function validateField(field) {
        const isValid = field.checkValidity();
        
        if (isValid) {
          field.classList.remove('error');
          field.style.borderColor = 'var(--border-color)';
        } else {
          field.classList.add('error');
          field.style.borderColor = '#dc2626';
        }
      }
      
      // Clear message when user starts typing
      form.addEventListener('input', function() {
        if (message && message.style.display !== 'none') {
          message.style.display = 'none';
        }
      });
    })();
  `.trim();
}

function generateFormspreeId(email: string): string {
  // This would be replaced with actual Formspree form creation API
  // For now, return a placeholder that could be configured
  const hash = email.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return Math.abs(hash).toString(36).substring(0, 8);
}