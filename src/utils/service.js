const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SERVICE_NAME = 'mosaic-screen';
const SERVICE_PATH = `/etc/systemd/system/${SERVICE_NAME}.service`;
const WORKING_DIR = require('path').join(__dirname, '..');

const serviceContent = `[Unit]
Description=Mosaic Screen NeoPixel Display
After=network.target
StartLimitIntervalSec=300
StartLimitBurst=5

[Service]
Type=simple
User=root
WorkingDirectory=${WORKING_DIR}
ExecStart=/usr/local/bin/node ${path.join(WORKING_DIR, 'index.js')}
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
`;

const command = process.argv[2];

if (command === 'install') {
  fs.writeFileSync(SERVICE_PATH, serviceContent);
  execSync('systemctl daemon-reload');
  console.log(`✓ Service installed at ${SERVICE_PATH}`);
  console.log('✓ Restart limit: 5 attempts in 5 minutes');
  console.log('Run "npm run service:enable" to start on boot');
  console.log('Run "npm run service:start" to start now');
} else if (command === 'uninstall') {
  try {
    execSync(`systemctl stop ${SERVICE_NAME}`);
    execSync(`systemctl disable ${SERVICE_NAME}`);
  } catch (e) {}
  if (fs.existsSync(SERVICE_PATH)) {
    fs.unlinkSync(SERVICE_PATH);
  }
  execSync('systemctl daemon-reload');
  console.log('✓ Service uninstalled');
} else {
  console.log('Usage: node service.js [install|uninstall]');
  process.exit(1);
}
