import { PageState } from '@/types/builder.types';

interface GeneratorOptions {
  includeAnimations?: boolean;
}

export function generateCSS(pageState: PageState, options: GeneratorOptions = {}): string {
  const { globalStyles } = pageState;
  
  // Font configurations
  const fontFamilies = {
    modern: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    classic: '"Georgia", "Times New Roman", serif',
    playful: '"Comic Sans MS", cursive, sans-serif'
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
    
    /* CSS Variables */
    :root {
      --primary-color: ${globalStyles.primaryColor};
      --secondary-color: ${globalStyles.secondaryColor};
      --text-dark: #1f2937;
      --text-light: #6b7280;
      --bg-light: #f9fafb;
      --border-color: #e5e7eb;
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
    
    /* Content Section Styles */
    .content-section {
      padding: 80px 20px;
    }
    
    .content-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .content-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 40px;
      align-items: center;
    }
    
    .content-stacked {
      display: flex;
      flex-direction: column;
      gap: 40px;
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
    
    .content-body p {
      margin-bottom: 1rem;
    }
    
    .content-image img {
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      width: 100%;
      height: auto;
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
    
    /* Form Styles */
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 500px;
      margin: 0 auto;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-field {
      width: 100%;
      padding: 14px 20px;
      font-size: 16px;
      border: 2px solid var(--border-color);
      border-radius: 8px;
      transition: all 0.3s ease;
      font-family: inherit;
      background: white;
    }
    
    .form-field:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .form-field::placeholder {
      color: var(--text-light);
    }
    
    .form-message {
      margin-top: 1rem;
      padding: 12px;
      border-radius: 8px;
      font-weight: 500;
    }
    
    .form-message.success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    
    .form-message.error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    
    /* Success Modal Styles */
    .success-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .modal-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      -webkit-backdrop-filter: blur(4px);
      backdrop-filter: blur(4px);
    }
    
    .modal-content {
      position: relative;
      background: white;
      border-radius: 12px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      max-width: 400px;
      width: 90%;
      margin: 0 20px;
      animation: modalSlideIn 0.3s ease-out;
    }
    
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 24px 0;
    }
    
    .modal-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #16a34a;
      margin: 0;
    }
    
    .modal-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #6b7280;
      padding: 4px;
      line-height: 1;
      transition: color 0.2s;
    }
    
    .modal-close:hover {
      color: #374151;
    }
    
    .modal-body {
      padding: 16px 24px 24px;
    }
    
    .modal-body p {
      margin: 0 0 12px;
      color: #374151;
      line-height: 1.5;
    }
    
    .modal-body p:last-child {
      margin-bottom: 0;
    }
    
    .modal-footer {
      padding: 0 24px 24px;
      text-align: center;
    }
    
    .modal-ok-btn {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .modal-ok-btn:hover {
      background: color-mix(in srgb, var(--primary-color) 90%, black);
      transform: translateY(-1px);
    }
    
    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    /* Button Styles */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 14px 32px;
      font-size: 1.1rem;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: white;
      text-decoration: none;
      min-height: 48px;
      font-family: inherit;
    }
    
    .btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }
    
    .btn:active {
      transform: translateY(0);
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
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
    @media (min-width: 768px) {
      .hero-section {
        padding: 60px 40px;
      }
      
      .content-section,
      .cta-section {
        padding: 100px 40px;
      }
      
      .content-grid {
        grid-template-columns: 1fr 1fr;
        gap: 60px;
      }
      
      .form-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        align-items: start;
      }
      
      .form-container button {
        grid-column: 1 / -1;
      }
      
      .form-message {
        grid-column: 1 / -1;
      }
    }
    
    @media (max-width: 768px) {
      .hero-section {
        min-height: 80vh;
        padding: 30px 15px;
      }
      
      .content-section,
      .cta-section {
        padding: 60px 15px;
      }
      
      .btn {
        width: 100%;
        padding: 16px 24px;
      }
      
      .form-field {
        font-size: 16px; /* Prevents zoom on iOS */
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
    
    /* Utility Classes */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }
    
    .relative {
      position: relative;
    }
    
    .absolute {
      position: absolute;
    }
    
    .inset-0 {
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }
    
    .z-10 {
      z-index: 10;
    }
    
    .flex {
      display: flex;
    }
    
    .items-center {
      align-items: center;
    }
    
    .justify-center {
      justify-content: center;
    }
    
    .text-left {
      text-align: left;
    }
    
    .text-center {
      text-align: center;
    }
    
    .text-right {
      text-align: right;
    }
    
    .font-bold {
      font-weight: 700;
    }
    
    .font-light {
      font-weight: 300;
    }
    
    .bg-black {
      background-color: black;
    }
    
    .bg-opacity-30 {
      background-color: rgba(0, 0, 0, 0.3);
    }
    
    /* Accessibility */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation: none !important;
        transition: none !important;
      }
      
      html {
        scroll-behavior: auto;
      }
    }
    
    /* Focus styles for accessibility */
    .btn:focus-visible,
    .form-field:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 2px;
    }
    
    /* Print Styles */
    @media print {
      .hero-section {
        min-height: auto;
        page-break-inside: avoid;
      }
      
      .btn,
      .form-container {
        display: none !important;
      }
      
      * {
        color: black !important;
        background: white !important;
        box-shadow: none !important;
      }
      
      h1, h2, h3 {
        color: black !important;
      }
    }
  `;

  // Add animation styles if enabled
  let animationCSS = '';
  if (options.includeAnimations) {
    animationCSS = `
    /* Animation Styles */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-50px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(50px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    .animate-fade-in {
      animation: fadeIn 0.8s ease-out;
    }
    
    .animate-slide-in-left {
      animation: slideInLeft 0.8s ease-out;
    }
    
    .animate-slide-in-right {
      animation: slideInRight 0.8s ease-out;
    }
    `;
  }
  
  return (baseCSS + animationCSS).trim();
}