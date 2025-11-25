# Project Structure

## Overview
The mosaic-screen project has been reorganized for better maintainability and clarity.

## Directory Structure

```
mosaic-screen-d/
├── src/                          # Source code
│   ├── lib/                      # Core libraries
│   │   └── simple-canvas.js      # Lightweight canvas implementation
│   └── utils/                    # Utility scripts
│       ├── service.js            # Systemd service management
│       ├── setup.js              # Dependency installation
│       └── generate-font-pngs.js # Font sprite generation
├── tests/                        # Test suite
│   ├── test-runner.js            # Standardized test framework
│   ├── canvas.test.js            # Canvas rendering tests
│   ├── font.test.js              # Font rendering tests
│   └── text-overlay.test.js      # Text overlay tests
├── interface/                    # Web interface
│   ├── components/               # UI components
│   ├── app.js                    # Main application
│   └── index.html                # Web interface
├── fonts/                        # Font definitions
│   ├── mini-font.json
│   ├── medium-font.json
│   └── big-font.json
├── images/                       # Assets
│   └── animations/               # Sprite sheets
├── index.js                      # Main server application
├── package.json                  # Dependencies and scripts
└── README.md                     # Documentation
```

## Key Changes

### 1. Organized Source Code
- Moved `simple-canvas.js` to `src/lib/`
- Moved utility scripts to `src/utils/`
- Updated all import paths accordingly

### 2. Standardized Tests
- Created `tests/test-runner.js` for consistent testing
- Unified test format across all test files
- Eliminated code duplication
- All tests now use the same assertion and rendering utilities

### 3. Updated Scripts
All npm scripts updated to reflect new structure:
- `npm test` - Run all tests
- `npm run test:canvas` - Test canvas rendering
- `npm run test:font` - Test font rendering
- `npm run test:overlay` - Test text overlay system
- `npm run setup` - Install system dependencies
- `npm run generate-fonts` - Generate font sprite sheets
- Service management scripts remain unchanged

## Test Framework

The new `TestRunner` class provides:
- Consistent test structure
- Built-in assertions
- Visual rendering utilities
- Pass/fail tracking
- Summary reporting

Example usage:
```javascript
const { TestRunner, SimpleCanvas } = require('./test-runner');

const runner = new TestRunner('My Tests');

runner.test('Description', () => {
  const canvas = new SimpleCanvas(15, 15);
  runner.assert(condition, 'Error message');
  runner.assertEqual(actual, expected);
});

process.exit(runner.summary() ? 0 : 1);
```

## Migration Notes

- All existing functionality preserved
- No breaking changes to API
- Tests now exit with proper status codes
- Visual test output improved
