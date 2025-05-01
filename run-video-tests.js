#!/usr/bin/env node

/**
 * This script runs the Jest tests for the video call related components and utilities
 */

const { execSync } = require('child_process');

console.log('Running video call component tests...');
try {
  execSync('npx jest client/src/components/__tests__/VideoCall.test.tsx', { stdio: 'inherit' });
  console.log('Video call component tests passed!');
} catch (error) {
  console.error('Video call component tests failed!');
  process.exit(1);
}

console.log('\nRunning WebRTC utility tests...');
try {
  execSync('npx jest client/src/lib/__tests__/webrtc.test.ts', { stdio: 'inherit' });
  console.log('WebRTC utility tests passed!');
} catch (error) {
  console.error('WebRTC utility tests failed!');
  process.exit(1);
}

console.log('\nAll video call related tests passed successfully!');