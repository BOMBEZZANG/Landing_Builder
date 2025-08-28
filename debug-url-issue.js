// Debug script to identify where the URL is getting corrupted

const fs = require('fs');

// Test template string like in form handler
const apiUrl = 'https://easy-landing-omega.vercel.app';
const testTemplate = `
  const apiEndpoint = '${apiUrl}/api/submit-form';
  console.log('URL:', apiEndpoint);
`;

console.log('Original template:');
console.log(testTemplate);

// Test escaping functions
function escapeScriptContent(scriptContent) {
  return scriptContent
    .replace(/<\/script>/gi, '<\\/script>')
    .replace(/<!--/g, '\\x3C!--')
    .replace(/-->/g, '--\\x3E');
}

console.log('\nAfter escapeScriptContent:');
const escaped = escapeScriptContent(testTemplate);
console.log(escaped);

// Test within HTML context
const htmlTemplate = `<script>${escaped}</script>`;
console.log('\nInside HTML:');
console.log(htmlTemplate);

// Test what might be breaking it
const problematicRegex = /https:\//g;
if (htmlTemplate.match(problematicRegex)) {
  console.log('\nFound https:// pattern');
  console.log('Match locations:', [...htmlTemplate.matchAll(/https:\/\//g)].map(m => m.index));
}

// Check if any replacement is causing issues
const testReplacements = [
  { name: 'comment removal', regex: /\/\/.*$/gm, replacement: '' },
  { name: 'whitespace', regex: /\s+/g, replacement: ' ' },
  { name: 'colon space', regex: /:\s+/g, replacement: ':' }
];

testReplacements.forEach(test => {
  const result = htmlTemplate.replace(test.regex, test.replacement);
  if (result.includes('https:')) {
    console.log(`\n❌ ${test.name} breaks URL:`, result.substring(result.indexOf('https:'), result.indexOf('https:') + 50));
  }
});