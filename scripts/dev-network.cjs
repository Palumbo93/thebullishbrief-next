const os = require('os');
const { spawn } = require('child_process');

// Get the local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '0.0.0.0';
}

const localIP = getLocalIP();
console.log(`\uD83C\uDF10 Starting Next.js development server...`);
console.log(`\uD83D\uDCF1 Access from your phone: http://${localIP}:3000`);
console.log(`\uD83D\uDCBB Local access: http://localhost:3000`);
console.log('');

// Start Next.js with network access
const nextProcess = spawn('npx', ['next', 'dev', '--hostname', '0.0.0.0', '--port', '3000'], {
  stdio: 'inherit',
  shell: true
});

nextProcess.on('error', (error) => {
  console.error('Failed to start Next.js:', error);
  process.exit(1);
}); 