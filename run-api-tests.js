#!/usr/bin/env node

/**
 * This script runs the Jest tests for the API only
 */

const { execSync } = require('child_process');

console.log('Running API tests...');
try {
  execSync('npx jest __tests__/api', { stdio: 'inherit' });
  console.log('All API tests passed!');
} catch (error) {
  console.error('API tests failed!');
  process.exit(1);
}