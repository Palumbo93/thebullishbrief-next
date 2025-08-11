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
console.log(`\uD83C\uDF10 Starting Vite development server...`);
console.log(`\uD83D\uDCF1 Access from your phone: http://${localIP}:5173`);
console.log(`\uD83D\uDCBB Local access: http://localhost:5173`);
console.log('');

// Start Vite
const viteProcess = spawn('npm', ['run', 'dev', '--', '--host'], {
  stdio: 'inherit',
  shell: true
});

viteProcess.on('error', (error) => {
  console.error('Failed to start Vite:', error);
  process.exit(1);
}); 