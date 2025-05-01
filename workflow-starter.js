// Simple script that starts the workflow
// This is just a way to override the package.json script without directly editing it
// Run this file with: node workflow-starter.js

// Use the child_process module to run our startup script
const { execSync } = require('child_process');

console.log('🏥 Medical Consultation App - Starting workflow...');

try {
  // Run our Replit startup script
  execSync('./replit-start.sh', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to start the application:', error);
  process.exit(1);
}