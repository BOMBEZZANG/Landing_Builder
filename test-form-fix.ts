import { HTMLGenerator } from './src/lib/html-generator/index';
import { PageState } from './src/types/builder.types';
import fs from 'fs';

const testPageState: PageState = {
  title: 'Form Fix Test',
  sections: [
    {
      id: 'cta-1',
      type: 'cta',
      order: 0,
      data: {
        title: 'Contact Us',
        description: 'Test form with API endpoint fix',
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
    description: 'Test form endpoint fix'
  }
};

async function testFormFix() {
  try {
    console.log('Testing form endpoint fix...');
    
    const generator = new HTMLGenerator({
      minify: false,
      formService: 'custom'
    });
    
    const result = await generator.generate(testPageState);
    
    // Write to file for inspection
    fs.writeFileSync('./test-form-fix-output.html', result.html);
    console.log('Generated HTML written to test-form-fix-output.html');
    
    // Check form action and hidden fields
    if (result.html.includes('action="https://easy-landing-omega.vercel.app/api/submit-form"')) {
      console.log('✅ Form action is set to correct API endpoint');
    } else {
      console.log('❌ Form action is not set correctly');
    }
    
    if (result.html.includes('name="recipientEmail"') && result.html.includes('name="pageId"')) {
      console.log('✅ Hidden fields for metadata are present');
    } else {
      console.log('❌ Hidden fields are missing');
    }
    
    console.log('\nGeneration successful!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFormFix();