#!/usr/bin/env node

/**
 * This script runs the ESLint checks and Jest tests for the project
 */

const { execSync } = require('child_process');

console.log('Running ESLint checks...');
try {
  execSync('npx eslint . --ext .js,.jsx,.ts,.tsx', { stdio: 'inherit' });
  console.log('ESLint checks passed!');
} catch (error) {
  console.error('ESLint checks failed!');
  process.exit(1);
}

console.log('\nRunning Jest tests...');
try {
  execSync('npx jest', { stdio: 'inherit' });
  console.log('All tests passed!');
} catch (error) {
  console.error('Tests failed!');
  process.exit(1);
}

console.log('\nAll checks passed successfully!');