#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔒 Frontend Security Guard - Scanning for secrets...\n');

// Look for secrets in current directory
const files = fs.readdirSync('.');
let foundSecrets = false;

files.forEach(file => {
  if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx')) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('sk-')) {
        console.log(`🚨 SECRET FOUND in ${file}: OpenAI/Anthropic API key detected!`);
        foundSecrets = true;
      }
      if (content.includes('AIza')) {
        console.log(`🚨 SECRET FOUND in ${file}: Google API key detected!`);
        foundSecrets = true;
      }
    } catch (e) {
      // Skip files we can't read
    }
  }
});

if (foundSecrets) {
  console.log('\n❌ Build blocked for security reasons!');
  process.exit(1);
} else {
  console.log('✅ No security issues found!');
  console.log('🔒 Frontend is secure and ready for build.');
}
