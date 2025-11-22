#!/bin/bash

echo "Installing Mosaic Screen GPIO version..."

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install npm dependencies (preinstall script handles system deps)
npm install

echo "Installation complete!"
echo "Run with: npm start"
echo "Note: Requires sudo for GPIO access"