// Test script to check Resend API behavior
const API_BASE = 'https://easy-landing-omega.vercel.app';

async function testEmail(recipientEmail, description) {
  console.log(`\n=== Testing ${description} ===`);
  console.log(`Recipient: ${recipientEmail}`);
  
  try {
    const response = await fetch(`${API_BASE}/api/test-resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipientEmail,
        testMessage: `Test for ${description}`
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS:', result);
    } else {
      console.log('❌ FAILED:', result);
    }
  } catch (error) {
    console.error('❌ REQUEST ERROR:', error.message);
  }
}

async function runTests() {
  console.log('Starting Resend API tests...\n');
  
  // Test 1: Working email
  await testEmail('bombezzang100@gmail.com', 'Known Working Email');
  
  // Test 2: Different email  
  await testEmail('test@example.com', 'Test Email');
  
  // Test 3: Another email
  await testEmail('user@gmail.com', 'Gmail User');
  
  console.log('\n=== Tests completed ===');
}

runTests().catch(console.error);