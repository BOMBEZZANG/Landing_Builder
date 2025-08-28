// Test script to debug email configuration
const API_BASE = 'https://easy-landing-omega.vercel.app';

async function testEmailDebug(recipientEmail) {
  console.log(`\nTesting email to: ${recipientEmail}`);
  console.log('Using API:', `${API_BASE}/api/debug-resend`);
  
  try {
    const response = await fetch(`${API_BASE}/api/debug-resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipientEmail
      })
    });

    const result = await response.json();
    
    console.log('\n=== Response ===');
    console.log('Status:', response.status);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ Email sent successfully!');
      console.log('Email ID:', result.emailId);
      console.log('Check your inbox and spam folder');
    } else {
      console.log('\n❌ Email failed');
      console.log('Error:', result.error);
      console.log('Details:', result.errorDetails);
      console.log('Suggestion:', result.suggestion);
    }
    
    if (result.config) {
      console.log('\n=== Configuration ===');
      console.log('From Address:', result.config.fromAddress);
      console.log('Has API Key:', result.config.hasApiKey);
    }
    
  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
  }
}

async function checkConfig() {
  console.log('Checking email configuration...\n');
  
  try {
    const response = await fetch(`${API_BASE}/api/debug-resend`);
    const result = await response.json();
    
    console.log('=== Current Configuration ===');
    console.log(JSON.stringify(result.currentConfig, null, 2));
    
    console.log('\n=== Suggestions ===');
    result.suggestions.forEach(s => console.log(`• ${s}`));
    
  } catch (error) {
    console.error('Failed to check config:', error.message);
  }
}

async function runTests() {
  // First check configuration
  await checkConfig();
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test with different emails
  await testEmailDebug('bombezzang100@gmail.com');
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  await testEmailDebug('test@example.com');
}

runTests().catch(console.error);