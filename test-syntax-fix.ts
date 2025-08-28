import { HTMLGenerator } from './src/lib/html-generator/index';
import { PageState } from './src/types/builder.types';
import fs from 'fs';

// Test page state with CTA form
const testPageState: PageState = {
  title: 'Test Landing Page',
  sections: [
    {
      id: 'cta-1',
      type: 'cta',
      order: 0,
      data: {
        title: 'Contact Us',
        description: 'Get in touch',
        buttonText: 'Send Message',
        buttonColor: '#3b82f6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        formEnabled: true,
        formFields: {
          name: true,
          email: true,
          phone: true
        },
        recipientEmail: 'test@example.com'
      }
    }
  ],
  globalStyles: {
    fontFamily: 'modern',
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981'
  },
  metadata: {
    description: 'Test landing page for syntax error fix'
  }
};

async function testGeneration() {
  try {
    console.log('Testing HTML generation with syntax error fix...');
    
    const generator = new HTMLGenerator({
      minify: false, // Keep unminified for easier inspection
      formService: 'custom'
    });
    
    const result = await generator.generate(testPageState);
    
    console.log('Generation successful!');
    console.log('HTML size:', result.size, 'bytes');
    console.log('Warnings:', result.warnings.length);
    
    // Check if the HTML contains the problematic patterns
    if (result.html.includes('method: POST') && !result.html.includes("method: 'POST'")) {
      console.error('❌ ERROR: Unquoted POST found in generated HTML!');
    } else {
      console.log('✅ SUCCESS: No unquoted POST found - syntax error should be fixed!');
    }
    
    // Write the generated HTML to a file for inspection
    fs.writeFileSync('./test-syntax-fix-output.html', result.html);
    console.log('Generated HTML written to test-syntax-fix-output.html');
    
  } catch (error) {
    console.error('❌ Generation failed:', (error as Error).message);
  }
}

testGeneration();