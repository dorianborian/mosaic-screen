const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');

const isRaspberryPi = () => {
  try {
    return fs.readFileSync('/proc/cpuinfo', 'utf8').includes('Raspberry Pi');
  } catch {
    return false;
  }
};

const isDarwin = () => os.platform() === 'darwin';
const isLinux = () => os.platform() === 'linux';

console.log('Setting up mosaic-screen dependencies...');

if (isRaspberryPi()) {
  console.log('Raspberry Pi detected - installing canvas dependencies');
  try {
    execSync('sudo apt-get update && sudo apt-get install -y libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++ pkg-config libpixman-1-dev', { stdio: 'inherit' });
  } catch (err) {
    console.error('Failed to install Pi dependencies:', err.message);
    process.exit(1);
  }
} else if (isDarwin()) {
  console.log('macOS detected - development mode (canvas may need: brew install pkg-config cairo pango libpng jpeg giflib librsvg)');
} else if (isLinux()) {
  console.log('Linux detected - installing canvas dependencies');
  try {
    execSync('sudo apt-get update && sudo apt-get install -y libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++ pkg-config libpixman-1-dev', { stdio: 'inherit' });
  } catch (err) {
    console.log('Could not install dependencies automatically - you may need to install canvas dependencies manually');
  }
} else {
  console.log('Unknown platform - you may need to install canvas dependencies manually');
}

console.log('Setup complete!');