// Test the form handler generation directly
const { generateFormHandler } = require('./src/lib/html-generator/form-handler.ts');

const mockCTASection = {
  id: 'cta-1',
  type: 'cta',
  order: 0,
  data: {
    recipientEmail: 'test@example.com',
    buttonText: 'Send Message'
  }
};

console.log('Testing form handler generation...');
const result = generateFormHandler(mockCTASection, 'custom');
console.log('Generated handler (first 1000 chars):');
console.log(result.substring(0, 1000));

console.log('\nLooking for API endpoint...');
const apiEndpointStart = result.indexOf('apiEndpoint');
if (apiEndpointStart !== -1) {
  console.log('API endpoint line:', result.substring(apiEndpointStart, apiEndpointStart + 150));
} else {
  console.log('apiEndpoint not found in generated handler');
}