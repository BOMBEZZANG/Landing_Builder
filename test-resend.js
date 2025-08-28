// Test Resend API key directly
const https = require('https');

const RESEND_API_KEY = 're_KHbrNQhp_LhvxCoCYxnQUcxz6jVGrbCBF';

const emailData = {
  from: 'onboarding@resend.dev', // Use Resend's test domain
  to: 'bombezzang100@gmail.com',
  subject: 'Test Email from Landing Page Builder',
  html: '<h1>Test Email</h1><p>This is a test email to verify Resend API is working.</p>',
  text: 'Test Email - This is a test email to verify Resend API is working.'
};

const postData = JSON.stringify(emailData);

const options = {
  hostname: 'api.resend.com',
  port: 443,
  path: '/emails',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Testing Resend API directly...');
console.log('Sending to:', emailData.to);
console.log('From:', emailData.from);

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\nResponse status:', res.statusCode);
    console.log('Response:', data);
    
    try {
      const jsonResponse = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log('\n✅ SUCCESS: Email sent successfully!');
        console.log('Email ID:', jsonResponse.id);
      } else {
        console.log('\n❌ ERROR: Email sending failed');
        console.log('Error:', jsonResponse);
      }
    } catch (e) {
      console.log('\n❌ ERROR: Invalid response');
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