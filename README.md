# mosaic-screen

A high-performance NeoPixel display controller for Raspberry Pi, streaming at 30-60fps to Adafruit NeoPixel displays via GPIO.

**Version 2.0**: Now runs directly on Raspberry Pi via GPIO instead of serial communication!

## Features

### Display Modes
- **Animated Sprites** - Display animated GIF sprites from a library of 15+ animations
- **Bouncing Ball** - Physics-based bouncing ball with customizable colors
- **Scrolling Text** - Smooth scrolling text with multiple font sizes
- **Digital Clock** - 12-hour clock display with AM/PM indicator
- **Plasma Effects** - Real-time animated plasma with customizable parameters
- **Solid Colors** - Simple solid color display
- **Shuffle Mode** - Auto-shuffle through saved presets

### Text Overlay System
- **Multiple Fonts** - Mini (5px), Medium (6px), and Big (13px) fonts
- **Scrolling Text** - Smooth horizontal scrolling with adjustable speed
- **Clock Mode** - Dedicated clock display with 2-line format
- **Customizable Colors** - Foreground and background color control
- **Alpha Blending** - Adjustable background transparency
- **Invert Mode** - Invert text rendering for creative effects
- **Positioning** - Precise X/Y positioning for static text

### Control & Automation
- **Web Interface** - Full-featured browser-based control panel with icons
- **Live Preview** - Real-time display preview in browser
- **Preset System** - Save and manage display state presets with thumbnails
- **Brightness Control** - Adjustable LED brightness (0-255)
- **Scheduler** - Time-based automation for display modes
- **Remote Power** - Shutdown/restart Raspberry Pi from web interface
- **WebSocket API** - Real-time communication for live updates

### Technical Features
- **60 FPS Rendering** - Smooth animations and transitions
- **Snake Pattern Support** - Optimized for serpentine LED layouts
- **GPIO Control** - Direct hardware control via GPIO 18
- **Systemd Service** - Run as system service with auto-start
- **State Persistence** - Saves and restores display state on restart
- **Development Mode** - Terminal-based preview for testing without hardware

## Hardware Setup

- **Display**: 15x15 (225 pixel) NeoPixel matrix in snake pattern
- **Connection**: NeoPixel data line to GPIO 18 (pin 12)
- **Power**: Connect NeoPixel power and ground appropriately
- **Platform**: Raspberry Pi (any model with GPIO)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mosaic-screen-d
   ```

2. Run the installation script:
   ```bash
   ./install.sh
   ```

3. Start the server:
   ```bash
   npm start
   ```
   (requires sudo for GPIO access)

4. Open browser to `http://your-pi-ip` to control the display

## Configuration

Edit `index.js` to customize:
- **GPIO pin** (default: 18)
- **Number of LEDs** (default: 225 for 15x15)
- **Display dimensions** (default: 15x15)
- **Frame rate** (default: 60 FPS)
- **Server port** (default: 80)

## Project Structure

```
mosaic-screen-d/
├── src/
│   ├── lib/
│   │   └── simple-canvas.js      # Lightweight canvas implementation
│   └── utils/
│       ├── service.js             # Systemd service management
│       ├── setup.js               # Dependency installation
│       └── generate-font-pngs.js  # Font sprite generation
├── tests/
│   ├── test-runner.js             # Standardized test framework
│   ├── canvas.test.js             # Canvas rendering tests
│   ├── font.test.js               # Font rendering tests
│   └── text-overlay.test.js       # Text overlay tests
├── interface/
│   ├── components/                # UI components
│   ├── app.js                     # Main application
│   └── index.html                 # Web interface
├── fonts/                         # Font definitions (JSON + PNG)
├── images/
│   └── animations/                # Sprite sheets
├── index.js                       # Main server application
└── package.json                   # Dependencies and scripts
```

## Available Scripts

### Running
- `npm start` - Start server with GPIO access (requires sudo)
- `npm run dev` - Start in development mode (no GPIO)

### Testing
- `npm test` - Run all tests
- `npm run test:canvas` - Test canvas rendering
- `npm run test:font` - Test font rendering
- `npm run test:overlay` - Test text overlay system

### Setup
- `npm run setup` - Install system dependencies
- `npm run generate-fonts` - Generate font sprite sheets

### Service Management
- `npm run service:install` - Install systemd service
- `npm run service:uninstall` - Remove systemd service
- `npm run service:start` - Start service
- `npm run service:stop` - Stop service
- `npm run service:restart` - Restart service
- `npm run service:status` - Check service status
- `npm run service:logs` - View service logs
- `npm run service:enable` - Enable auto-start on boot
- `npm run service:disable` - Disable auto-start

## API Endpoints

### Display Control
- `POST /data` - Change display mode
  ```json
  { "image": "fire" }
  { "ball": "#ff0000" }
  { "color": "#00ff00" }
  { "plasma": {} }
  { "shuffle": ["preset1", "preset2"] }
  { "stop": true }
  ```

- `GET /data` - Get available animations

### Text Overlay
- `POST /text` - Set text overlay
  ```json
  {
    "enabled": true,
    "text": "Hello",
    "font": "medium",
    "color": "#ffffff",
    "scroll": false,
    "speed": 2,
    "bgColor": "#000000",
    "bgAlpha": 0.8,
    "useClock": false,
    "invert": false,
    "x": 0
  }
  ```

- `GET /text` - Get current text overlay state

### Brightness
- `POST /bright` - Set brightness
  ```json
  { "brightness": 100 }
  ```

### Schedule
- `GET /schedule` - Get scheduled states
- `POST /schedule` - Add scheduled state
  ```json
  { "time": "14:30" }
  ```
- `PUT /schedule/:time` - Activate scheduled state
- `DELETE /schedule/:time` - Remove scheduled state

### Presets
- `GET /presets` - Get all saved presets
- `POST /presets` - Save a new preset
  ```json
  { "name": "My Preset", "matrix": {...} }
  ```
- `DELETE /presets/:name` - Delete a preset

### Live Preview
- `GET /peek` - Live preview interface
- `GET /matrix` - Raw pixel data (JSON)
- WebSocket `/peek` - Real-time pixel stream

## Available Animations

- beachball (20 frames)
- bird (6 frames)
- eye (10 frames)
- fire (8 frames)
- flower (2 frames)
- happy (30 frames)
- heart (3 frames)
- hearts (15 frames)
- maker (8 frames)
- nyan (5 frames)
- parrot (30 frames)
- pickaxe (5 frames)
- pumpkin (8 frames)
- rainbow (24 frames)
- redsus (10 frames)
- skeleton (8 frames)

## Development

### Running Tests
```bash
npm test
```

### Adding New Fonts
1. Create font definition in `fonts/your-font.json`
2. Run `npm run generate-fonts` to create sprite sheet
3. Font will be automatically available in the system

### Adding New Animations
1. Place PNG sprite sheet in `images/animations/`
2. Name format: `name_fps.png` (e.g., `fire_8.png`)
3. Sprite sheet should be horizontal strip of 15x15 frames

## Legacy Arduino Code

The original Arduino/Teensy serial-based code is preserved in the README for reference. Version 2.0 uses direct GPIO control for improved performance and reliability.

## License

MIT

## Author

techninja
