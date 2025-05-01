// Simple script to run Next.js directly on port 5000 for Replit
const { exec } = require('child_process');

console.log('🚀 Starting Next.js directly on port 5000 for Replit...');

// Run Next.js directly on port 5000
const nextProcess = exec('PORT=5000 npx next dev -p 5000', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});

// Forward stdout and stderr
nextProcess.stdout.on('data', (data) => {
  console.log(data);
});

nextProcess.stderr.on('data', (data) => {
  console.error(data);
});

// Handle process exit
nextProcess.on('exit', (code) => {
  console.log(`Next.js process exited with code ${code}`);
});