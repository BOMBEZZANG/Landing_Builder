'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/ga4-analytics';

export default function TestAnalytics() {
  const [analyticsStatus, setAnalyticsStatus] = useState<string>('Checking...');

  useEffect(() => {
    const checkAnalytics = () => {
      if (typeof window !== 'undefined') {
        const status = {
          gtag: typeof window.gtag !== 'undefined',
          dataLayer: Array.isArray(window.dataLayer),
          measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
        };
        
        setAnalyticsStatus(JSON.stringify(status, null, 2));
        console.log('Analytics Status:', status);
      }
    };

    // Check after a delay to ensure scripts are loaded
    setTimeout(checkAnalytics, 2000);
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">GA4 Analytics Test Page</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Analytics Status:</h2>
          <pre className="text-sm">{analyticsStatus}</pre>
        </div>

        <div className="space-x-4">
          <button
            onClick={() => {
              trackEvent('test_button_click', {
                event_category: 'test',
                event_label: 'Test Button 1'
              });
              alert('Event sent: test_button_click');
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Send Test Event
          </button>

          <button
            onClick={() => {
              trackEvent('form_submit', {
                event_category: 'test',
                form_name: 'test_form'
              });
              alert('Event sent: form_submit');
            }}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test Form Submit Event
          </button>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm">
            After clicking buttons, check Google Analytics Real-time reports at:
            <br />
            <a 
              href="https://analytics.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              https://analytics.google.com → Reports → Real-time
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}