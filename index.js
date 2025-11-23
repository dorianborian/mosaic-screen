/**
 * @file Main file for Mosaic Screen! Your friendly neopixel screen controller
 */
const { SimpleCanvas } = require('./simple-canvas');
const createCanvas = (w, h) => new SimpleCanvas(w, h);

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
// Initial values here represent default startup state.
const globalState = {
  brightness: 10,
  mode: 'ball',
  options: 'red',
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
const app = express();
const httpServer = http.createServer(app);

// CONTROL API: ===============================================================
let currentInterval = null; // Interval for the currently running mode
let rotationModeInterval = null; // Interval within the rotation mode
function changeScreen(change) {
  console.log('Mode change request:', change);

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
  }
}

// Set Brightness State helper
function updateStateBrightness(level) {
  globalState.brightness = level;
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
      animImage(change.image).then(done);
    } else if (change.ball) {
      // Bounce the ball
      done(ballBounce(change.ball));
    } else if (change.scroll) {
      // Scroll text!
      done(scrollText(change.scroll));
    } else if (change.color) {
      // Solid color!
      done(changeColor(change.color));
    } else if (change.clock) {
      // Clock!
      done(changeClock(change.clock));
    } else if (change.plasma) {
      // Magic rainbow plasma
      done(plasma(change.plasma));
    } else if (change.power) {
      // Shut down/restart!
      done(hostPower(change.power));
    } else if (change.rotate) {
      // Rotate through
      done(rotateModes(change.rotate));
    } else {
      fail();
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

// Clock mode!
function changeClock({ color = "red" }) {
  let counter = 0;

  // Dont Repeat Yourself
  function clockLoop() {
    clearScreen();
    drawClock(color);
  }
  clockLoop();

  return setInterval(clockLoop, 1000);
}

// Rotation mode.
function rotateModes(seconds) {
  let lastPick = null;
  const options = [
    { image: "heart" },
    { image: "bird" },
    { image: "eye" },
    { image: "flower" },
    { image: "fire" },
    { image: "pumpkin" },
    { image: "skeleton" },
    { image: "pickaxe" },
    { image: "nyan" },
    { image: "maker" },

    { plasma: {} },
    { plasma: {} },
    { plasma: {} },
    { plasma: {} },
  ];

  const pickNext = () => {
    const pick = getRand(options.length, lastPick);
    lastPick = pick;

    clearInterval(rotationModeInterval);
    runScreen(options[pick]).then((interval) => {
      rotationModeInterval = interval;
    });
  };

  pickNext();
  return setInterval(pickNext, seconds * 1000);
}

function scrollText({ color = "blue", text, size = "small", speed = 2 }) {
  ctx.fillStyle = color;
  ctx.font = size === "big" ? "big" : size === "medium" ? "medium" : "";
  const textSize = ctx.measureText(text);
  const y = Math.floor((height - (size === "big" ? 13 : size === "medium" ? 6 : 5)) / 2);
  let x = width;
  
  return setInterval(() => {
    clearScreen();
    ctx.fillText(text, Math.floor(x), y);
    x -= speed / 10;
    if (x < -textSize.width) x = width;
  }, Math.round(1000 / 30));
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
    clearScreen();

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

// Animate a horizontal sprite sheet image over 15px square.
function animImage(name) {
  if (!appData.images[name]) {
    name = "fire";
  }

  const { fps } = appData.images[name];
  return new Promise((done) => {
    loadImage(`${animPath}/${name}_${fps}.gif`).then((image) => {
      const frames = Math.floor(image.width / width);
      let frame = 0;
      
      const interval = setInterval(() => {
        if (frame >= frames) {
          frame = 0;
        }

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (image.data && image.data.length > 0) {
          ctx.drawImage(image, frame * 15, 0, 15, 15, 0, 0, 15, 15);
        } else {
          // Fallback: draw colored square
          ctx.fillStyle = frame % 2 ? '#ff0000' : '#00ff00';
          ctx.fillRect(5, 5, 5, 5);
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
    clearScreen();
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
      clearScreen();
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
function plasma({ 
  modA = Math.random() * 64, 
  modB = Math.random() * 64, 
  modC = Math.random() * 64,
  withClock = false, 
  invert = false,
  clockColor = '#ffffff',
  bgColor = '#000000',
  plasmaBrightness = 1.0
}) {
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
  const bgRGB = hexToRGB(bgColor);
  const clockRGB = hexToRGB(clockColor);

  return setInterval(() => {
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var hue = hueShift + (plasma[y][x] % 1);
        var rgb = HSVtoRGB(hue, plasma[y][x], plasma[y][x] * plasmaBrightness);
        var pos = (y * w + x) * 4;
        
        ctx.pixels[pos] = rgb.r;
        ctx.pixels[pos + 1] = rgb.g;
        ctx.pixels[pos + 2] = rgb.b;
        ctx.pixels[pos + 3] = 255;
      }
    }
    
    if (withClock) {
      const time = new Date();
      const minutes = time.getMinutes().toString().padStart(2, '0');
      let hours = time.getHours();
      let isPM = hours >= 12;
      
      if (hours > 12) hours = hours - 12;
      if (hours === 0) hours = 12;

      const hoursStr = hours.toString().padStart(2, '0');
      const minutesStr = minutes + (isPM ? '.' : ' ');
      
      ctx.fillStyle = invert ? clockColor : bgColor;
      ctx.font = 'medium';
      ctx.fillText(hoursStr, 2, 1);
      ctx.fillText(minutesStr, 2, 8);
      
      if (invert) {
        const imageData = ctx.getImageData(0, 0, w, h);
        for (var y = 0; y < h; y++) {
          for (var x = 0; x < w; x++) {
            var pos = (y * w + x) * 4;
            if (imageData.data[pos + 3] > 0) {
              var hue = hueShift + (plasma[y][x] % 1);
              var rgb = HSVtoRGB(hue, plasma[y][x], plasma[y][x] * plasmaBrightness);
              ctx.pixels[pos] = rgb.r;
              ctx.pixels[pos + 1] = rgb.g;
              ctx.pixels[pos + 2] = rgb.b;
            } else {
              ctx.pixels[pos] = clockRGB.r;
              ctx.pixels[pos + 1] = clockRGB.g;
              ctx.pixels[pos + 2] = clockRGB.b;
            }
          }
        }
      }
    }

    hueShift = (hueShift + 0.01) % 1;
  }, Math.round(1000 / 60));
}

function hexToRGB(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
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
  process.stdout.write(output);
}

// Update pixels and render to GPIO.
function renderFrame() {
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
  
  // Test: Set first 5 pixels to red
  if (channel) {
    console.log('Testing first 5 pixels red...');
    for (let i = 0; i < 5; i++) {
      channel.array[i] = 0xFF0000; // Red
    }
    ws281x.render();
    
    setTimeout(() => {
      console.log('Test complete, starting normal rendering...');
    }, 2000);
  }
} catch (err) {
  console.log('GPIO initialization skipped - dev mode');
}

// Read the schedule.
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
// ======================== Setup Server Endpoint ==============================
// =============================================================================
httpServer.listen(serverPort, '0.0.0.0', () => {
  // Properly close down server on fail/close
  process.on("SIGTERM", (err) => {
    httpServer.close();
  });
});
app.use("/", express.static("./interface/"));

const nm = `./node_modules`;

app.use("/images", express.static(`./images/`));
app.use(express.json());

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
