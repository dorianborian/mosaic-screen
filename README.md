# mosaic-screen
A single day hack app to stream at ~30-60fps to a Adafruit Neopixel display

**Version 2.0**: Now runs directly on Raspberry Pi via GPIO instead of serial communication!

Yup, just like it says. Made this with my son Dorian in a day or so. Code
quality is terrible, but very performant.

## Installation

1. Run the installation script: `./install.sh`
2. Start the server: `npm start` (requires sudo for GPIO access)
3. Open browser to `http://your-pi-ip` to control the display

## Hardware Setup

- Connect NeoPixel data line to GPIO 18 (pin 12)
- Connect NeoPixel power and ground appropriately
- Supports 15x15 (225 pixel) display in snake pattern

## Configuration

Edit `index.js` to change:
- GPIO pin (default: 18)
- Number of LEDs (default: 225 for 15x15)
- Display dimensions

## Legacy Arduino Code

The original Arduino/Teensy code is preserved below for reference:

```c++
// Simple byte based linear stream for FAST 256* color display.
#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
 #include <avr/power.h> // Required for 16 MHz Adafruit Trinket
#endif

// Which pin on the Arduino is connected to the NeoPixels?
#define LED_PIN    0

// How many NeoPixels are attached to the Arduino?
#define LED_COUNT 225

int pixel = 0;
int lastPixel = 0;
int counter = 0;
int bright = 100;
bool setBright = false;

// Declare our NeoPixel strip object:
Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

// setup() function -- runs once at startup --------------------------------
void setup() {
  // These lines are specifically to support the Adafruit Trinket 5V 16 MHz.
  // Any other board, you can remove this part (but no harm leaving it):
#if defined(__AVR_ATtiny85__) && (F_CPU == 16000000)
  clock_prescale_set(clock_div_1);
#endif
  // END of Trinket-specific code.
  Serial.begin(115200);
  strip.begin();           // INITIALIZE NeoPixel strip object (REQUIRED)
  strip.show();            // Turn OFF all pixels ASAP
  strip.setBrightness(bright); // Set BRIGHTNESS
}


// loop() function -- runs repeatedly as long as board is on ---------------

void loop() {
  // 1. Read a byte through the serial port
  // 2. If it's a trigger byte, run strip show and reset counter
  // 3. Otherwise, read what color the byte is, and set the counter pixel
  while (Serial.available()) {
    pixel = Serial.read();
    if (pixel == 255) {
      if (lastPixel == 255) {
        // Trying to set the brightness!
        setBright = true;
      } else {
        // New frame! Display the last one, reset counter.
        strip.show();
        counter = 0;
      }
    } else {
      if (setBright) {
        bright = pixel;
        setBright = false;
        strip.setBrightness(bright);
      } else {
        uint32_t color = strip.Color((pixel >> 5) * 32, ((pixel & 28) >> 2) * 32, (pixel & 3) * 64, bright);
        strip.setPixelColor(counter, color);
        counter++;

        // Sane byte overflow protection.
        if (counter > strip.numPixels() - 1) {
          counter = 0;
        }
      }
    }
    lastPixel = pixel;
  }
}
```

## Features

- Web-based control interface
- Animated GIFs and sprites
- Bouncing ball animation
- Scrolling text
- Digital clock
- Plasma effects
- Solid colors
- Scheduled automation
- Remote power control

