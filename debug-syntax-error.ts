import { HTMLGenerator } from './src/lib/html-generator/index';
import { generateFormHandler } from './src/lib/html-generator/form-handler';
import { CTASection } from './src/types/builder.types';
import fs from 'fs';

// Test the form handler directly
const testCTASection: CTASection = {
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
};

console.log('=== Testing Form Handler Generation ===');
const formJS = generateFormHandler(testCTASection, 'custom');
console.log('\n--- Generated Form JavaScript ---');
console.log(formJS.substring(0, 500) + '...');

// Check for the specific POST issue
if (formJS.includes('method: POST') && !formJS.includes("method: 'POST'")) {
  console.log('\n❌ ERROR: Found unquoted POST in form handler!');
  const problemLines = formJS.split('\n').filter(line => line.includes('method: POST'));
  console.log('Problem lines:', problemLines);
} else {
  console.log('\n✅ Form handler looks good - POST is properly quoted');
}

// Test full HTML generation
console.log('\n=== Testing Full HTML Generation ===');
const testPageState = {
  title: 'Debug Test Page',
  sections: [testCTASection],
  globalStyles: {
    fontFamily: 'modern',
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981'
  },
  metadata: {
    description: 'Debug test for syntax error'
  }
};

async function testFullGeneration() {
  try {
    const generator = new HTMLGenerator({
      minify: false,
      formService: 'custom'
    });
    
    const result = await generator.generate(testPageState);
    
    // Write to file for inspection
    fs.writeFileSync('./debug-generated.html', result.html);
    console.log('Generated HTML written to debug-generated.html');
    
    // Check for problematic patterns in the full HTML
    if (result.html.includes('method: POST') && !result.html.includes("method: 'POST'")) {
      console.log('\n❌ ERROR: Found unquoted POST in generated HTML!');
      
      // Find the exact location
      const lines = result.html.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('method: POST') && !line.includes("method: 'POST'")) {
          console.log(`Line ${index + 1}: ${line.trim()}`);
        }
      });
    } else {
      console.log('\n✅ Full HTML generation looks good - no unquoted POST found');
    }
    
  } catch (error) {
    console.error('❌ Full generation failed:', error);
  }
}

testFullGeneration();