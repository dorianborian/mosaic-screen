const { SimpleCanvas } = require('./simple-canvas');

function renderToTerminal(canvas) {
  const chars = ' .:-=+*#%@';
  for (let y = 0; y < canvas.height; y++) {
    let row = '';
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      const brightness = (canvas.pixels[i] + canvas.pixels[i+1] + canvas.pixels[i+2]) / 3;
      const charIndex = Math.floor((brightness / 255) * (chars.length - 1));
      row += chars[charIndex] + chars[charIndex];
    }
    console.log(row);
  }
}

console.log('Testing Text Overlay States\n');

// Test 1: Basic text rendering
console.log('=== Test 1: Basic Text (mini font) ===');
const canvas1 = new SimpleCanvas(15, 15);
const ctx1 = canvas1.getContext('2d');
ctx1.fillStyle = '#ffffff';
ctx1.font = 'mini';
ctx1.fillText('Hi', 0, 0);
renderToTerminal(canvas1);

// Test 2: Medium font
console.log('\n=== Test 2: Medium Font ===');
const canvas2 = new SimpleCanvas(15, 15);
const ctx2 = canvas2.getContext('2d');
ctx2.fillStyle = '#ffffff';
ctx2.font = 'medium';
ctx2.fillText('AB', 0, 0);
renderToTerminal(canvas2);

// Test 3: Big font
console.log('\n=== Test 3: Big Font ===');
const canvas3 = new SimpleCanvas(15, 15);
const ctx3 = canvas3.getContext('2d');
ctx3.fillStyle = '#ffffff';
ctx3.font = 'big';
ctx3.fillText('X', 0, 0);
renderToTerminal(canvas3);

// Test 4: Positioned text
console.log('\n=== Test 4: Positioned Text (x:5, y:5) ===');
const canvas4 = new SimpleCanvas(15, 15);
const ctx4 = canvas4.getContext('2d');
ctx4.fillStyle = '#ff0000';
ctx4.font = 'mini';
ctx4.fillText('OK', 5, 5);
renderToTerminal(canvas4);

// Test 5: Text with background
console.log('\n=== Test 5: Text on Background ===');
const canvas5 = new SimpleCanvas(15, 15);
const ctx5 = canvas5.getContext('2d');
ctx5.fillStyle = '#0000ff';
ctx5.fillRect(0, 0, 15, 15);
ctx5.fillStyle = '#ffffff';
ctx5.font = 'mini';
ctx5.fillText('HI', 2, 2);
renderToTerminal(canvas5);

// Test 6: Overlay alpha blending simulation
console.log('\n=== Test 6: Text Overlay States ===');
const states = [
  { enabled: false, text: 'OFF', x: 0, y: 0 },
  { enabled: true, text: 'ON', x: 0, y: 0 },
  { enabled: true, text: 'HI', x: 5, y: 5 },
  { enabled: true, text: '123', x: 0, y: 10 }
];

states.forEach((state, i) => {
  console.log(`\nState ${i+1}: enabled=${state.enabled}, text="${state.text}", x=${state.x}, y=${state.y}`);
  if (state.enabled) {
    const canvas = new SimpleCanvas(15, 15);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'mini';
    ctx.fillText(state.text, state.x, state.y);
    renderToTerminal(canvas);
  } else {
    console.log('(Text overlay disabled)');
  }
});

console.log('\n=== Test Complete ===');
