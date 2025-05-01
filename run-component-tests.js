#!/usr/bin/env node

/**
 * This script runs the Jest tests for the components only
 */

const { execSync } = require('child_process');

console.log('Running component tests...');
try {
  execSync('npx jest client/src/components/__tests__', { stdio: 'inherit' });
  console.log('All component tests passed!');
} catch (error) {
  console.error('Component tests failed!');
  process.exit(1);
}