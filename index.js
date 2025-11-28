/**
 * @file Main file for Mosaic Screen! Your friendly neopixel screen controller
 */
const { SimpleCanvas } = require('./src/lib/simple-canvas');
const createCanvas = (w, h) => new SimpleCanvas(w, h);
const pixelTest = require('./src/utils/pixel-test');

// Load PNG sprite sheets
const loadImage = (path) => {
  return new Promise((resolve) => {
    try {
      const fs = require('fs');
      const { PNG } = require('pngjs');
      
      // Convert .gif path to .png
      const pngPath = path.replace('.gif', '.png');
      
      if (fs.existsSync(pngPath)) {
        const buffer = fs.readFileSync(pngPath);
        const png = PNG.sync.read(buffer);
        
        resolve({
          width: png.width,
          height: png.height,
          data: png.data
        });
      } else {
        console.log(`PNG file not found: ${pngPath}`);
        resolve({ width: 60, height: 15, data: new Uint8ClampedArray(60 * 15 * 4) });
      }
    } catch (err) {
      console.log('PNG loading error:', err.message);
      resolve({ width: 60, height: 15, data: new Uint8ClampedArray(60 * 15 * 4) });
    }
  });
};

console.log('Using simple canvas implementation');
const fs = require('fs');
const path = require('path');
let ws281x;
try {
  ws281x = require('rpi-ws281x-native');
} catch (err) {
  console.log('Running in dev mode - GPIO disabled');
  ws281x = {
    init: () => {},
    setBrightness: () => {},
    render: () => {},
    reset: () => {}
  };
}
const { _extend } = require('util');
const { exec } = require("child_process");
const options = {
  gpio: 18,
  leds: 225,
  brightness: 100,
  stripType: ws281x.stripType?.WS2812 || 0x00100800
};

const FRAME_RATE = 60; // In Frame updates per second
const FRAME_RATE_TIME = Math.round(1000 / FRAME_RATE);
const animPath = path.join(__dirname, 'images', 'animations');
const width = 15;
const height = 15;
let pixelData = new Uint32Array(225);
const serverPort = 80;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Manage state.
const stateFile = './state.json';
const presetsDir = './presets';
const groupsDir = './preset-groups';
let globalState = {
  brightness: 10,
  mode: 'ball',
  options: 'red',
  presetName: '',
};

// Ensure directories exist
if (!fs.existsSync(presetsDir)) fs.mkdirSync(presetsDir);
if (!fs.existsSync(groupsDir)) fs.mkdirSync(groupsDir);

// Global text overlay state
let textState = {
  enabled: false,
  text: '',
  font: 'medium',
  color: '#000000ff',
  scroll: false,
  speed: 2,
  bgColor: '#000000cc',
  useClock: false,
  invert: false,
  x: 0
};

// Object of schedule items keyed by time.
const scheduleFile = './schedule.json';
let schedule = {};

const appData = {
  images: {}, // Loaded dynamically.
};

// Load images.
const images = fs.readdirSync(animPath);
images.forEach(file => {
  if (file.endsWith('.png')) {
    const name = file.split('.')[0];
    const parts = name.split('_');
    appData.images[parts[0]] = { fps: parts[1]};
  }
});


// Server stuff
const express = require("express");
const http = require("http");
const WebSocket = require('ws');
const app = express();
const httpServer = http.createServer(app);
const wss = new WebSocket.Server({ server: httpServer });

// CONTROL API: ===============================================================
let currentInterval = null; // Interval for the currently running mode
let rotationModeInterval = null; // Interval within the rotation mode
function changeScreen(change) {
  // Run the screen promise, then reset the current global interval.
  runScreen(change).then((interval) => {
    clearInterval(currentInterval);
    if (!change.rotate) clearInterval(rotationModeInterval);
    currentInterval = interval;
  });
}

// Get Time Helper.
function getTime() {
  const time = new Date();
  const hours = `${time.getHours()}`.padStart(2, '0');
  const mins = `${time.getMinutes()}`.padStart(2, '0');
  return `${hours}:${mins}`;
}

// Set State Helper
function updateStateFromChange(change) {
  const key = Object.keys(change)[0];

  if (key) {
    globalState.mode = key;
    globalState.options = change[key];
    writeState();
  }
}

// Set Brightness State helper
function updateStateBrightness(level) {
  globalState.brightness = level;
  writeState();
}

// Load state from file
function readState() {
  if (fs.existsSync(stateFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(stateFile));
      if (data.globalState) globalState = data.globalState;
      if (data.textState) {
        textState = Object.assign({
          enabled: false,
          text: '',
          font: 'medium',
          color: '#000000ff',
          scroll: false,
          speed: 2,
          bgColor: '#000000cc',
          useClock: false,
          invert: false,
          x: 0
        }, data.textState);
      }
    } catch (error) {
      console.error('Problem loading state file:', error);
      fs.renameSync(stateFile, `${stateFile}.backup-${Date.now()}`);
    }
  }
}

// Save state to file
function writeState() {
  fs.writeFileSync(stateFile, JSON.stringify({ globalState, textState }, null, 2));
  // Broadcast will be called after WebSocket setup
  setImmediate(() => {
    if (typeof broadcastState === 'function') broadcastState();
  });
}

// Setup the schedule global array from the JSON file.
function readSchedule() {
  let data = {};
  if (fs.existsSync(scheduleFile)) {
    try {
      data = JSON.parse(fs.readFileSync(scheduleFile));
    } catch (error) {
      console.error(`Problem loading schedule JSON file:`, error);
    }
  }

  schedule = data;
  writeSchedule();
}

// Write the whole schedule out.
function writeSchedule() {
  const times = Object.keys(schedule).sort();
  const newSchedule = {};
  times.forEach(time => newSchedule[time] = schedule[time]);
  schedule = newSchedule;
  fs.writeFileSync(scheduleFile, JSON.stringify(schedule, null, 2));
}

// Add to the schedule with a time
function addScheduleState(time) {
  if (!time) time = getTime();
  schedule[time] = _extend({}, globalState);
  writeSchedule();
}

// Remove from the schedule.
function removeSchedule(time) {
  if (schedule[time]) {
    delete schedule[time];
    writeSchedule();
  }
}

// Set the brightness and mode froma state object.
function setFromState({ brightness, mode, options}) {
  // Set Brightness.
  setBrightness(brightness);

  // Start an animation to show it's on.
  changeScreen({ [mode]: options });
}

// Run on every tick, check if we have some state to run.
let lastCheckTime = getTime();
function checkSetStateFromSchedule() {
  const checkTime = getTime();
  if (lastCheckTime !== checkTime && schedule[checkTime]) {
    setFromState(schedule[checkTime]);
    lastCheckTime = checkTime;
  }
}

// Handler for running a change, returns a promise that resolves the interval.
function runScreen(change) {
  return new Promise((resolve, fail) => {
    try {
      animBuffer = null;
      
      // Unified rsolve handler for confirming state.
      function done(intervalID) {
        updateStateFromChange(change);
        resolve(intervalID);
      }

      // Stop and clear all.
      if (change.stop) {
        clearScreen();
        done(null);
      } else if (change.image) {
        // Set an animated image
        animImage(change.image).then(done).catch(fail);
      } else if (change.ball) {
        // Bounce the ball
        done(ballBounce(change.ball));

      } else if (change.color) {
        // Solid color!
        done(changeColor(change.color));

      } else if (change.plasma) {
        // Magic rainbow plasma
        const params = typeof change.plasma === 'object' ? change.plasma : {};
        done(plasma(params));
      } else if (change.power) {
        // Shut down/restart!
        done(hostPower(change.power));
      } else if (change.shuffle) {
        // Shuffle through presets
        done(shufflePresets(change.shuffle));
      } else {
        fail(new Error('Unknown change type'));
      }
    } catch (err) {
      console.error('Error in runScreen:', err);
      fail(err);
    }
  });
}

// Get a random number excluding one.
const getRand = (max, exclude) => {
  let picked = exclude;
  while (picked == exclude) {
    picked = Math.floor(Math.random() * max);
  }
  return picked;
};

// Draw a clock with a color.
function drawClock(color) {
  const time = new Date();
  const minutes = time.getMinutes().toString().padStart(2, '0');
  let hours = time.getHours();
  let isPM = hours >= 12;
  
  if (hours > 12) {
    hours = hours - 12;
  }
  if (hours === 0) {
    hours = 12;
  }

  const hoursStr = hours.toString().padStart(2, '0');
  const minutesStr = minutes + (isPM ? '.' : ' ');
  
  ctx.fillStyle = color;
  ctx.font = 'medium';
  
  // Medium font layout for 2-line clock: each line fits 2 digits
  // Hours: position to fit 2 digits in top half
  ctx.fillText(hoursStr, 2, 1);     
  // Minutes: position to fit 2 digits + dot in bottom half  
  ctx.fillText(minutesStr, 2, 8);   
}



// Generate hash for preset ID
function generatePresetHash(name) {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(`${name}-${Date.now()}`).digest('hex').substring(0, 12);
}

// Shuffle through preset group.
function shufflePresets({ groupId }) {
  const groupPath = path.join(groupsDir, `${groupId}.json`);
  if (!fs.existsSync(groupPath)) return null;
  
  let group;
  try {
    group = JSON.parse(fs.readFileSync(groupPath));
  } catch (err) {
    console.error('Error reading group:', err);
    return null;
  }
  
  const validPresets = group.presets.filter(hash => 
    hash === '__random__' || fs.existsSync(path.join(presetsDir, `${hash}.json`))
  );
  
  if (validPresets.length === 0) return null;
  
  let lastPick = null;
  const pickNext = () => {
    const pick = group.randomize ? 
      getRand(validPresets.length, lastPick) : 
      (lastPick === null ? 0 : (lastPick + 1) % validPresets.length);
    lastPick = pick;
    const presetHash = validPresets[pick];
    
    try {
      if (presetHash === '__random__') {
        clearInterval(rotationModeInterval);
        runScreen({ image: 'random' }).then((interval) => {
          rotationModeInterval = interval;
        }).catch(err => {
          console.error('Error running screen:', err);
        });
      } else {
        const presetPath = path.join(presetsDir, `${presetHash}.json`);
        const preset = JSON.parse(fs.readFileSync(presetPath));
        globalState = preset.state || globalState;
        textState = Object.assign({
          enabled: false,
          text: '',
          font: 'medium',
          color: '#000000ff',
          scroll: false,
          speed: 2,
          bgColor: '#000000cc',
          useClock: false,
          invert: false,
          x: 0,
          y: 0
        }, preset.textState || {});
        writeState();
        
        clearInterval(rotationModeInterval);
        runScreen({ [preset.state.mode]: preset.state.options }).then((interval) => {
          rotationModeInterval = interval;
        }).catch(err => {
          console.error('Error running screen:', err);
        });
      }
    } catch (err) {
      console.error('Error loading preset:', err);
    }
  };

  pickNext();
  return setInterval(pickNext, group.seconds * 1000);
}



// Bounce a ball around the screen.
let ballPosition = { x: 7, y: 7 }; // Global for debugging
function ballBounce(color) {
  var p = {
    x: Math.ceil(Math.random() * 13) + 1,
    y: Math.ceil(Math.random() * 13) + 1,
  };
  var velo = 0.2,
    corner = 50,
    rad = 1;
  var ball = { x: p.x, y: p.y };
  var moveX = Math.cos((Math.PI / 180) * corner) * velo;
  var moveY = Math.sin((Math.PI / 180) * corner) * velo;

  function DrawMe() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (ball.x > canvas.width - rad || ball.x < rad) moveX = -moveX;
    if (ball.y > canvas.height - rad || ball.y < rad) moveY = -moveY;

    ball.x += moveX;
    ball.y += moveY;
    
    ballPosition.x = Math.floor(ball.x);
    ballPosition.y = Math.floor(ball.y);

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(ball.x, ball.y, rad, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
  }
  return setInterval(DrawMe, FRAME_RATE_TIME);
}

// Clear the screen.
function clearScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Apply background fade
function applyBackgroundFade() {
  if (textState.enabled) {
    const bgRGBA = hexToRGBA(textState.bgColor);
    if (bgRGBA.a > 0) {
      for (let i = 0; i < width * height; i++) {
        const pos = i * 4;
        ctx.pixels[pos] = bgRGBA.r * bgRGBA.a + ctx.pixels[pos] * (1 - bgRGBA.a);
        ctx.pixels[pos + 1] = bgRGBA.g * bgRGBA.a + ctx.pixels[pos + 1] * (1 - bgRGBA.a);
        ctx.pixels[pos + 2] = bgRGBA.b * bgRGBA.a + ctx.pixels[pos + 2] * (1 - bgRGBA.a);
      }
    }
  }
}

// Apply text overlay to current pixel buffer
let scrollX = width;
function applyTextOverlay() {
  if (!textState.enabled) return;
  
  let displayText = textState.text;
  
  if (textState.useClock) {
    const time = new Date();
    const minutes = time.getMinutes().toString().padStart(2, '0');
    let hours = time.getHours();
    let isPM = hours >= 12;
    if (hours > 12) hours = hours - 12;
    if (hours === 0) hours = 12;
    const hoursStr = hours.toString().padStart(2, '0');
    const minutesStr = minutes + (isPM ? '.' : ' ');
    displayText = hoursStr + '\n' + minutesStr;
  }
  
  if (!displayText) return;
  
  const tempCanvas = createCanvas(width, height, true);
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.fillStyle = 'white';
  tempCtx.font = textState.font;
  
  if (textState.scroll && !textState.useClock) {
    const textSize = tempCtx.measureText(displayText);
    const y = Math.floor((height - (textState.font === 'big' ? 13 : textState.font === 'medium' ? 6 : 5)) / 2) + (textState.y || 0);
    tempCtx.fillText(displayText, Math.floor(scrollX), y);
    scrollX -= textState.speed / 10;
    if (scrollX < -textSize.width) scrollX = width;
  } else {
    const lines = displayText.split('\n');
    const xOffset = textState.useClock ? 2 : 0;
    const yOffset = textState.useClock ? 1 : 0;
    lines.forEach((line, i) => {
      const lineHeight = textState.font === 'big' ? 13 : textState.font === 'medium' ? 7 : 6;
      tempCtx.fillText(line, xOffset + (textState.x || 0), yOffset + (textState.y || 0) + i * lineHeight);
    });
  }
  
  const fgRGBA = hexToRGBA(textState.color);
  for (let i = 0; i < width * height; i++) {
    const pos = i * 4;
    const isText = tempCanvas.pixels[pos] > 0 || tempCanvas.pixels[pos + 1] > 0 || tempCanvas.pixels[pos + 2] > 0;
    const shouldPaint = textState.invert ? !isText : isText;
    if (shouldPaint) {
      if (fgRGBA.a >= 1) {
        ctx.pixels[pos] = fgRGBA.r;
        ctx.pixels[pos + 1] = fgRGBA.g;
        ctx.pixels[pos + 2] = fgRGBA.b;
      } else {
        ctx.pixels[pos] = fgRGBA.r * fgRGBA.a + ctx.pixels[pos] * (1 - fgRGBA.a);
        ctx.pixels[pos + 1] = fgRGBA.g * fgRGBA.a + ctx.pixels[pos + 1] * (1 - fgRGBA.a);
        ctx.pixels[pos + 2] = fgRGBA.b * fgRGBA.a + ctx.pixels[pos + 2] * (1 - fgRGBA.a);
      }
    }
  }
}


// Animate a horizontal sprite sheet image over 15px square.
let animBuffer = null;
let randomAnimInterval = null;
function animImage(name) {
  if (name === 'random') {
    const imageNames = Object.keys(appData.images);
    let currentName = imageNames[Math.floor(Math.random() * imageNames.length)];
    let currentInterval = null;
    
    const switchAnim = () => {
      clearInterval(currentInterval);
      currentName = imageNames[Math.floor(Math.random() * imageNames.length)];
      const { fps } = appData.images[currentName];
      
      loadImage(`${animPath}/${currentName}_${fps}.gif`).then((image) => {
        const frames = Math.floor(image.width / width);
        let frame = 0;
        const tempCanvas = createCanvas(width, height);
        const tempCtx = tempCanvas.getContext('2d');
        animBuffer = tempCanvas.pixels;
        
        currentInterval = setInterval(() => {
          if (frame >= frames) frame = 0;
          if (image.data && image.data.length > 0) {
            tempCtx.drawImage(image, frame * 15, 0, 15, 15, 0, 0, 15, 15);
          }
          frame++;
        }, Math.round(1000 / fps));
      });
    };
    
    switchAnim();
    randomAnimInterval = setInterval(switchAnim, 10000);
    return Promise.resolve(randomAnimInterval);
  }
  
  if (!appData.images[name]) {
    name = "fire";
  }

  const { fps } = appData.images[name];
  return new Promise((done) => {
    loadImage(`${animPath}/${name}_${fps}.gif`).then((image) => {
      const frames = Math.floor(image.width / width);
      let frame = 0;
      const tempCanvas = createCanvas(width, height);
      const tempCtx = tempCanvas.getContext('2d');
      animBuffer = tempCanvas.pixels;
      
      const interval = setInterval(() => {
        if (frame >= frames) frame = 0;
        if (image.data && image.data.length > 0) {
          tempCtx.drawImage(image, frame * 15, 0, 15, 15, 0, 0, 15, 15);
        }
        frame++;
      }, Math.round(1000 / fps));
      done(interval);
    });
  });
}

// Raspberry pi shutdown/restart
function hostPower(option) {
  let countdown = 5 + 4;
  // Safety measure: unless we're running as root, these will just fail.
  const cmd = option === "shutdown" ? "/sbin/shutdown -h now" : "/sbin/reboot";

  return setInterval(() => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (countdown > 5) {
      if (countdown % 2) {
        ctx.fillStyle = "red";
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = "red";
        ctx.fillRect(6, 7, 2, 7);
        ctx.beginPath();
        ctx.arc(7, 7, 6, 0, Math.PI * 2, true);
        ctx.stroke();
      }
    } else if (countdown > -1) {
      // Show the countdown.
      ctx.font = `15px Impact`;
      ctx.fillText(countdown, 3, 13);
    } else if (countdown === -1) {
      // Clear the screen, wait one sec...
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (countdown === -2) {
      // Actually run the command.
      exec(cmd);
    }

    countdown--;
  }, 1000);
}

// Change solid color.
function changeColor(color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return 0;
}

// Run the random plasma animation at 60fps.
let currentPlasmaParams = { modA: 32, modB: 32, modC: 32 };
let plasmaInterval = null;
function plasma({ 
  modA = Math.random() * 64, 
  modB = Math.random() * 64, 
  modC = Math.random() * 64
}) {
  currentPlasmaParams.modA = modA;
  currentPlasmaParams.modB = modB;
  currentPlasmaParams.modC = modC;
  var w = canvas.width;
  var h = canvas.height;
  var buffer = new Array(h);
  const mod = [modA, modB, modC];

  for (var y = 0; y < h; y++) {
    buffer[y] = new Array(w);
    for (var x = 0; x < w; x++) {
      var value = Math.sin(x / 16.0 / mod[0]);
      value += Math.sin(y / 8.0 / mod[1]);
      value += Math.sin((x + y) / 16.0 / mod[0]);
      value += Math.sin(Math.sqrt(x * x + y * y) / 8.0 / mod[1]);
      value += 4 / mod[2];
      value /= 8 / mod[2];
      buffer[y][x] = value;
    }
  }

  var plasma = buffer;
  var hueShift = 0;

  clearInterval(plasmaInterval);
  plasmaInterval = setInterval(() => {
    const mod = [currentPlasmaParams.modA, currentPlasmaParams.modB, currentPlasmaParams.modC];
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var value = Math.sin(x / 16.0 / mod[0]);
        value += Math.sin(y / 8.0 / mod[1]);
        value += Math.sin((x + y) / 16.0 / mod[0]);
        value += Math.sin(Math.sqrt(x * x + y * y) / 8.0 / mod[1]);
        value += 4 / mod[2];
        value /= 8 / mod[2];
        var hue = hueShift + (value % 1);
        var rgb = HSVtoRGB(hue, value, value);
        var pos = (y * w + x) * 4;
        ctx.pixels[pos] = rgb.r;
        ctx.pixels[pos + 1] = rgb.g;
        ctx.pixels[pos + 2] = rgb.b;
        ctx.pixels[pos + 3] = 255;
      }
    }
    hueShift = (hueShift + 0.01) % 1;
  }, Math.round(1000 / 60));
  return plasmaInterval;
}

function hexToRGBA(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = hex.length >= 9 ? parseInt(hex.slice(7, 9), 16) / 255 : 1;
  return { r, g, b, a };
}

function hexToRGB(hex) {
  const rgba = hexToRGBA(hex);
  return { r: rgba.r, g: rgba.g, b: rgba.b };
}

// Convert Hue, Saturation, & Brightness to Red, Green, & Blue
function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;

  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// =============================================================================
// =============== Init Serial connection and frame sending ====================
// =============================================================================

// Set the brightness of the pixels directly via GPIO.
function setBrightness(level) {
  let bLevel = parseInt(level, 10);
  bLevel = bLevel > 255 ? 255 : bLevel;
  bLevel = bLevel < 0 ? 0 : bLevel;

  // Set brightness on the channel object
  if (channel && channel.brightness !== undefined) {
    channel.brightness = bLevel;
  }
  return bLevel;
}

// Convert canvas to pixel data for direct GPIO control.
function updatePixelData() {
  const imageData = ctx.getImageData(0, 0, width, height).data;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const canvasIndex = (y * width + x) * 4;
      
      // Snake pattern: odd rows go right-to-left
      let pixelIndex;
      if (y % 2 === 0) {
        // Even rows: left to right
        pixelIndex = y * width + x;
      } else {
        // Odd rows: right to left
        pixelIndex = y * width + (width - 1 - x);
      }

      const r = imageData[canvasIndex];
      const g = imageData[canvasIndex + 1];
      const b = imageData[canvasIndex + 2];
      
      pixelData[pixelIndex] = (r << 16) | (g << 8) | b;
    }
  }
}



// Terminal display for debugging
let lastDebugTime = 0;
function renderTerminal() {
  const imageData = ctx.getImageData(0, 0, width, height).data;
  let output = '\x1b[2J\x1b[H'; // Clear screen and move cursor to top
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      
      // Convert to ANSI color (simple 8-color mapping)
      let color = 0;
      if (r > 128) color += 1; // Red
      if (g > 128) color += 2; // Green  
      if (b > 128) color += 4; // Blue
      
      output += `\x1b[4${color}m  \x1b[0m`; // Colored background block
    }
    output += '\n';
  }
  
  const now = Date.now();
  if (now - lastDebugTime > 2000) {
    output += `\nText: enabled=${textState.enabled} clock=${textState.useClock} scroll=${textState.scroll} invert=${textState.invert}\n`;
    output += `Colors: fg=${textState.color} bg=${textState.bgColor}\n`;
    lastDebugTime = now;
  }
  
  process.stdout.write(output);
}

// Update pixels and render to GPIO.
let lastFrameTime = Date.now();
function renderFrame() {
  const now = Date.now();
  if (textState.scroll && now - lastFrameTime < 33) {
    setTimeout(renderFrame, FRAME_RATE_TIME);
    return;
  }
  lastFrameTime = now;
  
  if (animBuffer) {
    ctx.pixels.set(animBuffer);
  }
  
  applyBackgroundFade();
  applyTextOverlay();
  updatePixelData();
  checkSetStateFromSchedule();
  
  // Terminal debug display
  if (!channel) {
    renderTerminal();
  }
  
  if (channel) {
    // Copy pixel data to channel array
    for (let i = 0; i < pixelData.length; i++) {
      channel.array[i] = pixelData[i];
    }
    ws281x.render();
  }
  broadcastPeek();
  setTimeout(renderFrame, FRAME_RATE_TIME);
}



// Initialize GPIO NeoPixel control.
let channel;
try {
  channel = ws281x(options.leds, {
    gpio: options.gpio,
    brightness: options.brightness,
    stripType: options.stripType
  });
  
  console.log("GPIO NeoPixel initialized!");
  
  if (channel) {
    console.log('Running pixel test animation...');
    pixelTest(channel, ws281x, 2000);
  }
} catch (err) {
  console.log('GPIO initialization skipped - dev mode');
}

// Read state and schedule.
readState();
readSchedule();

// Setup the state from Global.
setFromState(globalState);

// Start rendering frames after a delay to let test complete
setTimeout(() => {
  console.log('Starting frame rendering...');
  renderFrame();
}, 3000);

console.log('Server starting, initial state:', globalState);
console.log(`Web interface available at http://192.168.86.57:${serverPort}`);

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // Don't exit - keep running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  // Don't exit - keep running
});

// Cleanup on exit
process.on('SIGINT', () => {
  ws281x.reset();
  process.exit(0);
});

process.on('SIGTERM', () => {
  ws281x.reset();
  process.exit(0);
});

// =============================================================================
// ======================== WebSocket Setup ====================================
// =============================================================================
const peekClients = new Set();
const stateClients = new Set();

// Hash state for comparison
function hashState() {
  const crypto = require('crypto');
  const stateStr = JSON.stringify({ globalState, textState });
  return crypto.createHash('md5').update(stateStr).digest('hex');
}

function broadcastState() {
  if (stateClients.size === 0) return;
  const msg = JSON.stringify({ hash: hashState() });
  stateClients.forEach(ws => ws.readyState === 1 && ws.send(msg));
}

// Get current state hash
app.get("/state-hash", (req, res) => {
  res.json({ hash: hashState() });
});

wss.on('connection', (ws, req) => {
  if (req.url === '/peek') {
    peekClients.add(ws);
    ws.on('close', () => peekClients.delete(ws));
    return;
  }
  
  if (req.url === '/state') {
    stateClients.add(ws);
    ws.send(JSON.stringify({ hash: hashState() }));
    ws.on('close', () => stateClients.delete(ws));
    return;
  }
  
  ws.on('message', (message) => {
    const str = message.toString();
    if (str === 'get') {
      ws.send(JSON.stringify({ type: 'plasma-state', params: currentPlasmaParams }));
    } else {
      const [a, b, c] = str.split(',').map(parseFloat);
      if (!isNaN(a) && !isNaN(b) && !isNaN(c)) {
        currentPlasmaParams.modA = a;
        currentPlasmaParams.modB = b;
        currentPlasmaParams.modC = c;
      }
    }
  });
});

function broadcastPeek() {
  if (peekClients.size === 0) return;
  const imageData = ctx.getImageData(0, 0, width, height).data;
  const compressed = [];
  let i = 0;
  while (i < 225) {
    const r = imageData[i * 4], g = imageData[i * 4 + 1], b = imageData[i * 4 + 2];
    let run = 1;
    while (i + run < 225 && run < 255 && 
           imageData[(i + run) * 4] === r && 
           imageData[(i + run) * 4 + 1] === g && 
           imageData[(i + run) * 4 + 2] === b) run++;
    compressed.push(run, r, g, b);
    i += run;
  }
  const buf = Buffer.from(compressed);
  peekClients.forEach(ws => ws.readyState === 1 && ws.send(buf));
}

// =============================================================================
// ======================== Setup Server Endpoint ==============================
// =============================================================================
httpServer.listen(serverPort, '0.0.0.0', () => {
  // Properly close down server on fail/close
  process.on("SIGTERM", (err) => {
    httpServer.close();
  });
});
app.use("/", express.static("./interface/"));

app.use("/images", express.static(`./images/`));
app.use("/icons", express.static(`./node_modules/lucide-static/icons`));
app.use(express.json());

// Peek interface
app.get("/peek", (req, res) => {
  res.sendFile(path.join(__dirname, 'interface', 'peek.html'));
});

// Raw matrix data API - returns current rendered frame with overlays
app.get("/matrix", (req, res) => {
  // Force a render to ensure we have the latest frame with text overlay
  if (animBuffer) ctx.pixels.set(animBuffer);
  applyBackgroundFade();
  applyTextOverlay();
  
  const imageData = ctx.getImageData(0, 0, width, height).data;
  const matrix = [];
  for (let i = 0; i < 225; i++) {
    matrix.push([imageData[i * 4], imageData[i * 4 + 1], imageData[i * 4 + 2]]);
  }
  res.json({ width, height, pixels: matrix });
});

// Data Output (read animations).
app.get("/data", (req, res) => {
  res.set("Content-Type", "application/json; charset=UTF-8");
  res.send(appData);
});

// Data Input (change mode).
app.post("/data", (req, res) => {
  const change = changeScreen(req.body);
  res.send({ status: "ok" });
});

// Set text overlay.
app.post("/text", (req, res) => {
  Object.assign(textState, req.body);
  writeState();
  res.send({ status: "ok" });
});

// Get text overlay state.
app.get("/text", (req, res) => {
  res.json(textState);
});

// Set brightness.
app.post("/bright", (req, res) => {
  updateStateBrightness(setBrightness(req.body.brightness));
  res.send({ status: "ok" });
});

// Read schedule state.
app.get("/schedule", (req, res) => {
  res.set("Content-Type", "application/json; charset=UTF-8");
  res.send(schedule);
});

// Add schedule state.
app.post("/schedule", (req, res) => {
  if (req.body.time) {
    addScheduleState(req.body.time);
    res.set("Content-Type", "application/json; charset=UTF-8");
    res.send(schedule);
  } else {
    res.send({error: 'Expected "time"'});
  }
});

// USE a schedule state.
app.put("/schedule/:time", (req, res) => {
  if (schedule[req.params.time]) {
    setFromState(schedule[req.params.time]);
  }
  res.set("Content-Type", "application/json; charset=UTF-8");
  res.send(schedule);
});

// Remove schedule item.
app.delete("/schedule/:time", (req, res) => {
  removeSchedule(req.params.time);
  res.set("Content-Type", "application/json; charset=UTF-8");
  res.send(schedule);
});

// Get all presets.
app.get("/presets", (req, res) => {
  const presets = [
    {
      name: 'Random Animation',
      hash: '__random__',
      preview: 'iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAP0lEQVR4nGNgGAWjYBSMAjwgPj7+PwMDA8N/fBgkBgYG/0FiYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYBgFQwsAAKmzBf/8/f8AAAAASUVORK5CYII=',
      builtin: true
    }
  ];
  
  if (fs.existsSync(presetsDir)) {
    const files = fs.readdirSync(presetsDir);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(presetsDir, file)));
          const hash = file.replace('.json', '');
          presets.push({ name: data.name, preview: data.preview, hash });
        } catch (err) {
          console.error('Error reading preset:', err);
        }
      }
    });
  }
  res.json(presets);
});

// Save a preset.
app.post("/presets", (req, res) => {
  const { name, matrix, hash } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  
  try {
    const { PNG } = require('pngjs');
    const png = new PNG({ width: 15, height: 15 });
    
    for (let i = 0; i < matrix.pixels.length; i++) {
      const [r, g, b] = matrix.pixels[i];
      png.data[i * 4] = r;
      png.data[i * 4 + 1] = g;
      png.data[i * 4 + 2] = b;
      png.data[i * 4 + 3] = 255;
    }
    
    const preview = PNG.sync.write(png).toString('base64');
    const presetHash = hash || generatePresetHash(name);
    
    // Capture current plasma params if in plasma mode
    const state = { ...globalState };
    if (state.mode === 'plasma') {
      state.options = { ...currentPlasmaParams };
    }
    
    const preset = {
      name,
      preview,
      state,
      textState: { ...textState }
    };
    
    fs.writeFileSync(path.join(presetsDir, `${presetHash}.json`), JSON.stringify(preset, null, 2));
    res.json({ status: 'ok', hash: presetHash });
  } catch (err) {
    console.error('Error saving preset:', err);
    res.status(500).json({ error: 'Failed to save preset' });
  }
});

// Load a preset
app.post("/presets/:hash/load", (req, res) => {
  if (req.params.hash === '__random__') {
    changeScreen({ image: 'random' });
    return res.json({ status: 'ok' });
  }
  
  const presetPath = path.join(presetsDir, `${req.params.hash}.json`);
  if (fs.existsSync(presetPath)) {
    try {
      const preset = JSON.parse(fs.readFileSync(presetPath));
      globalState = preset.state || globalState;
      textState = Object.assign({
        enabled: false,
        text: '',
        font: 'medium',
        color: '#000000ff',
        scroll: false,
        speed: 2,
        bgColor: '#000000cc',
        useClock: false,
        invert: false,
        x: 0,
        y: 0
      }, preset.textState || {});
      setFromState(globalState);
      res.json({ status: 'ok' });
    } catch (err) {
      console.error('Error loading preset:', err);
      res.status(500).json({ error: 'Failed to load preset' });
    }
  } else {
    res.status(404).json({ error: 'Preset not found' });
  }
});

// Update preset name
app.put("/presets/:hash", (req, res) => {
  const presetPath = path.join(presetsDir, `${req.params.hash}.json`);
  if (fs.existsSync(presetPath)) {
    try {
      const preset = JSON.parse(fs.readFileSync(presetPath));
      preset.name = req.body.name;
      fs.writeFileSync(presetPath, JSON.stringify(preset, null, 2));
      res.json({ status: 'ok' });
    } catch (err) {
      console.error('Error updating preset:', err);
      res.status(500).json({ error: 'Failed to update preset' });
    }
  } else {
    res.status(404).json({ error: 'Preset not found' });
  }
});

// Delete a preset.
app.delete("/presets/:hash", (req, res) => {
  if (req.params.hash === '__random__') {
    return res.status(400).json({ error: 'Cannot delete builtin preset' });
  }
  
  const presetPath = path.join(presetsDir, `${req.params.hash}.json`);
  if (fs.existsSync(presetPath)) {
    fs.unlinkSync(presetPath);
    // Clean up groups
    if (fs.existsSync(groupsDir)) {
      fs.readdirSync(groupsDir).forEach(file => {
        try {
          const groupPath = path.join(groupsDir, file);
          const group = JSON.parse(fs.readFileSync(groupPath));
          group.presets = group.presets.filter(p => p !== req.params.hash);
          fs.writeFileSync(groupPath, JSON.stringify(group, null, 2));
        } catch (err) {
          console.error('Error updating group:', err);
        }
      });
    }
  }
  res.json({ status: 'ok' });
});

// Get preset groups
app.get("/preset-groups", (req, res) => {
  const groups = [];
  if (fs.existsSync(groupsDir)) {
    fs.readdirSync(groupsDir).forEach(file => {
      if (file.endsWith('.json')) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(groupsDir, file)));
          groups.push(data);
        } catch (err) {
          console.error('Error reading group:', err);
        }
      }
    });
  }
  res.json(groups);
});

// Save preset group
app.post("/preset-groups", (req, res) => {
  const group = req.body;
  if (!group.id) return res.status(400).json({ error: 'ID required' });
  fs.writeFileSync(path.join(groupsDir, `${group.id}.json`), JSON.stringify(group, null, 2));
  res.json({ status: 'ok' });
});

// Delete preset group
app.delete("/preset-groups/:id", (req, res) => {
  const groupPath = path.join(groupsDir, `${req.params.id}.json`);
  if (fs.existsSync(groupPath)) {
    fs.unlinkSync(groupPath);
  }
  res.json({ status: 'ok' });
});
