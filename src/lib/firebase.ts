export function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_measurementId
  };
}

export function generateFirebaseAnalyticsScript(): string {
  const firebaseConfig = getFirebaseConfig();
  
  if (!firebaseConfig.apiKey || !firebaseConfig.appId) {
    console.warn('Firebase configuration is incomplete. Analytics will not be initialized.');
    return '';
  }

  return `
    <!-- Firebase Analytics -->
    <script type="module">
      // Import the functions you need from the SDKs you need
      import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
      import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
      
      // Your web app's Firebase configuration
      const firebaseConfig = {
        apiKey: "${firebaseConfig.apiKey}",
        authDomain: "${firebaseConfig.authDomain}",
        projectId: "${firebaseConfig.projectId}",
        storageBucket: "${firebaseConfig.storageBucket}",
        messagingSenderId: "${firebaseConfig.messagingSenderId}",
        appId: "${firebaseConfig.appId}",
        measurementId: "${firebaseConfig.measurementId}"
      };
      
      // Initialize Firebase
      const app = initializeApp(firebaseConfig);
      const analytics = getAnalytics(app);
      
      // Log page view
      logEvent(analytics, 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      });
      
      // Track form submissions
      document.addEventListener('DOMContentLoaded', function() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
          form.addEventListener('submit', function(e) {
            logEvent(analytics, 'form_submit', {
              form_id: form.id || 'contact_form',
              form_name: form.name || 'Contact Form'
            });
          });
        });
        
        // Track button clicks
        const buttons = document.querySelectorAll('button, a.btn, a[role="button"]');
        buttons.forEach(button => {
          button.addEventListener('click', function(e) {
            const buttonText = button.textContent || button.innerText || 'Unknown';
            logEvent(analytics, 'button_click', {
              button_text: buttonText.trim(),
              button_id: button.id || 'no_id',
              button_class: button.className || 'no_class'
            });
          });
        });
      });
      
      console.log('Firebase Analytics initialized successfully');
    </script>`;
}