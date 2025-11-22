#!/bin/bash

echo "Installing Mosaic Screen GPIO version..."

# Check if running on Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
    echo "Warning: Not running on Raspberry Pi - GPIO functionality may not work"
fi

# Update system
sudo apt update

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install build dependencies for native modules
sudo apt-get install -y build-essential python3-dev libc6-dev

# Install npm dependencies
npm install

# Test if rpi-ws281x-native compiled successfully
if node -e "require('rpi-ws281x-native')" 2>/dev/null; then
    echo "Installation complete!"
else
    echo "Warning: GPIO module may not have compiled correctly"
fi

echo "Run with: npm start"
echo "Note: Requires sudo for GPIO access"