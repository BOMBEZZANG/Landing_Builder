// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
  const forms = document.querySelectorAll('form[data-form-handler]');
  
  forms.forEach(function(form) {
    form.addEventListener('submit', handleFormSubmission);
  });
  
  function handleFormSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton ? submitButton.textContent : 'Submit';
    
    // Disable form and show loading state
    setFormLoading(form, true);
    if (submitButton) {
      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;
    }
    
    // Get form configuration
    const config = {
      endpoint: form.dataset.endpoint || '/api/submit-form',
      pageId: form.dataset.pageId || '',
      recipientEmail: form.dataset.recipientEmail || '',
      successMessage: form.dataset.successMessage || 'Thank you! Your message has been sent.',
      errorMessage: form.dataset.errorMessage || 'Sorry, there was an error sending your message. Please try again.'
    };
    
    // Convert FormData to regular object
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    
    // Submit form
    fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pageId: config.pageId,
        recipientEmail: config.recipientEmail,
        formData: data,
        timestamp: new Date().toISOString()
      })
    })
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(function(result) {
      if (result.success) {
        showFormMessage(form, config.successMessage, 'success');
        form.reset();
        
        // Track successful submission
        if (typeof gtag !== 'undefined') {
          gtag('event', 'form_submit', {
            event_category: 'engagement',
            event_label: 'landing_page_form'
          });
        }
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    })
    .catch(function(error) {
      console.error('Form submission error:', error);
      showFormMessage(form, config.errorMessage, 'error');
    })
    .finally(function() {
      // Re-enable form
      setFormLoading(form, false);
      if (submitButton) {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      }
    });
  }
  
  function setFormLoading(form, isLoading) {
    const inputs = form.querySelectorAll('input, textarea, select, button');
    inputs.forEach(function(input) {
      input.disabled = isLoading;
    });
    
    if (isLoading) {
      form.classList.add('form-loading');
    } else {
      form.classList.remove('form-loading');
    }
  }
  
  function showFormMessage(form, message, type) {
    // Remove existing messages
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // Create new message element
    const messageElement = document.createElement('div');
    messageElement.className = 'form-message form-message-' + type;
    messageElement.textContent = message;
    
    // Style the message
    messageElement.style.cssText = `
      padding: 12px 16px;
      border-radius: 6px;
      margin-top: 16px;
      font-size: 14px;
      font-weight: 500;
      text-align: center;
      animation: fadeIn 0.3s ease-in;
    `;
    
    if (type === 'success') {
      messageElement.style.backgroundColor = '#dcfce7';
      messageElement.style.color = '#166534';
      messageElement.style.border = '1px solid #bbf7d0';
    } else {
      messageElement.style.backgroundColor = '#fef2f2';
      messageElement.style.color = '#dc2626';
      messageElement.style.border = '1px solid #fecaca';
    }
    
    // Insert message after form
    form.parentNode.insertBefore(messageElement, form.nextSibling);
    
    // Auto-remove success messages after 5 seconds
    if (type === 'success') {
      setTimeout(function() {
        if (messageElement.parentNode) {
          messageElement.remove();
        }
      }, 5000);
    }
  }
});

// Smooth scroll functionality for anchor links
document.addEventListener('DOMContentLoaded', function() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(function(link) {
    link.addEventListener('click', function(event) {
      const href = link.getAttribute('href');
      
      // Skip if it's just "#"
      if (href === '#') return;
      
      const targetElement = document.querySelector(href);
      if (targetElement) {
        event.preventDefault();
        
        const offsetTop = targetElement.offsetTop - 20; // 20px offset
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
        
        // Track scroll action
        if (typeof gtag !== 'undefined') {
          gtag('event', 'scroll_to_section', {
            event_category: 'engagement',
            event_label: href
          });
        }
      }
    });
  });
});

// Intersection Observer for animations
document.addEventListener('DOMContentLoaded', function() {
  const animatedElements = document.querySelectorAll('[data-animate]');
  
  if (animatedElements.length === 0) return;
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const element = entry.target;
        const animationType = element.dataset.animate;
        
        // Add animation class
        element.classList.add('animate-' + animationType);
        
        // Stop observing this element
        observer.unobserve(element);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px'
  });
  
  animatedElements.forEach(function(element) {
    observer.observe(element);
  });
});

// Performance optimization: Lazy load images
document.addEventListener('DOMContentLoaded', function() {
  const lazyImages = document.querySelectorAll('img[data-lazy]');
  
  if (lazyImages.length === 0) return;
  
  const imageObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.lazy;
        img.classList.remove('lazy-loading');
        imageObserver.unobserve(img);
        
        img.addEventListener('load', function() {
          img.classList.add('lazy-loaded');
        });
      }
    });
  });
  
  lazyImages.forEach(function(img) {
    img.classList.add('lazy-loading');
    imageObserver.observe(img);
  });
});

// Add CSS for lazy loading
const lazyLoadCSS = `
  .lazy-loading {
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .lazy-loaded {
    opacity: 1;
  }
  
  .form-loading {
    opacity: 0.7;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const style = document.createElement('style');
style.textContent = lazyLoadCSS;
document.head.appendChild(style);