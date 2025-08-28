// Test script to verify form submission to production API
const https = require('https');

const testData = {
  formData: {
    name: "Test User",
    email: "test@example.com",
    phone: "1234567890"
  },
  recipientEmail: "bombezzang100@gmail.com", // Change this to your test email
  pageId: "test-landing-page",
  timestamp: new Date().toISOString()
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'easy-landing-omega.vercel.app',
  port: 443,
  path: '/api/submit-form',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Accept': 'application/json'
  }
};

console.log('Testing form submission to:', `https://${options.hostname}${options.path}`);
console.log('Sending data:', JSON.stringify(testData, null, 2));

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response status:', res.statusCode);
    console.log('Response headers:', res.headers);
    console.log('Response body:', data);
    
    try {
      const jsonResponse = JSON.parse(data);
      if (jsonResponse.success) {
        console.log('\n✅ SUCCESS: Form submission accepted!');
        console.log('Submission ID:', jsonResponse.submissionId);
        console.log('\n📧 Check the email at:', testData.recipientEmail);
      } else {
        console.log('\n❌ ERROR: Form submission failed');
        console.log('Error message:', jsonResponse.error);
      }
    } catch (e) {
      console.log('\n❌ ERROR: Invalid JSON response');
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('\n❌ ERROR: Request failed');
  console.error(e);
});

req.write(postData);
req.end();