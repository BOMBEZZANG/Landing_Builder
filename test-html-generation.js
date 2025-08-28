// Test HTML generation to see what form handler code is being generated
const https = require('https');

const testPageData = {
  page: {
    id: "test-page",
    title: "Test Landing Page",
    sections: [
      {
        id: "cta-1",
        type: "cta",
        order: 1,
        data: {
          title: "Contact Us",
          description: "Get in touch with us",
          formEnabled: true,
          formFields: {
            name: true,
            email: true,
            phone: true
          },
          buttonText: "Send Message",
          recipientEmail: "bombezzang100@gmail.com",
          emailVerified: true,
          backgroundColor: "#f8f9fa",
          textColor: "#333333",
          buttonColor: "#007bff"
        }
      }
    ],
    globalStyles: {
      primaryColor: "#007bff",
      secondaryColor: "#6c757d",
      fontFamily: "modern"
    },
    metadata: {
      description: "Test landing page"
    }
  },
  options: {
    minify: false, // Don't minify so we can read the output
    formService: "custom"
  }
};

const postData = JSON.stringify(testPageData);

const options = {
  hostname: 'easy-landing-omega.vercel.app',
  port: 443,
  path: '/api/generate-html',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Accept': 'application/json'
  }
};

console.log('Testing HTML generation...');
console.log('Requesting form service: custom');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response status:', res.statusCode);
    
    try {
      const jsonResponse = JSON.parse(data);
      if (jsonResponse.success && jsonResponse.data.html) {
        console.log('\n✅ HTML Generation successful');
        
        // Extract the form JavaScript from the generated HTML
        const html = jsonResponse.data.html;
        
        // Look for the form handler script
        const scriptMatch = html.match(/<script>\s*([\s\S]*?)\s*<\/script>/);
        if (scriptMatch) {
          console.log('\n📄 Generated JavaScript:');
          console.log('-----------------------------------');
          console.log(scriptMatch[1]);
          console.log('-----------------------------------');
          
          // Check if it contains our production URL
          if (scriptMatch[1].includes('https://easy-landing-omega.vercel.app')) {
            console.log('\n✅ GOOD: Using production API URL');
          } else {
            console.log('\n❌ PROBLEM: Not using production API URL');
          }
          
          // Check for form submission endpoint
          if (scriptMatch[1].includes('/api/submit-form')) {
            console.log('✅ GOOD: Form submission endpoint found');
          } else {
            console.log('❌ PROBLEM: Form submission endpoint not found');
          }
          
        } else {
          console.log('\n❌ No JavaScript found in generated HTML');
        }
        
      } else {
        console.log('\n❌ HTML Generation failed');
        console.log('Response:', jsonResponse);
      }
    } catch (e) {
      console.log('\n❌ Invalid JSON response');
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('\n❌ Request failed');
  console.error(e);
});

req.write(postData);
req.end();