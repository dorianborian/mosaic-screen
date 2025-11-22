const { SimpleCanvas } = require('./simple-canvas');

console.log('Testing SimpleCanvas implementation...\n');

const canvas = new SimpleCanvas(15, 15);
const ctx = canvas.getContext('2d');

// Test 1: Basic fillStyle and fillRect
console.log('Test 1: Basic red fillRect');
ctx.fillStyle = '#ff0000';
console.log('Set fillStyle to:', ctx.fillStyle);
ctx.fillRect(5, 5, 1, 1);
const pixel1 = ctx.getImageData(5, 5, 1, 1).data;
console.log('Expected: [255,0,0,255], Got:', pixel1);
console.log('PASS:', pixel1[0] === 255 && pixel1[1] === 0 && pixel1[2] === 0, '\n');

// Test 2: Different color
console.log('Test 2: Blue fillRect');
ctx.fillStyle = '#0000ff';
ctx.fillRect(7, 7, 1, 1);
const pixel2 = ctx.getImageData(7, 7, 1, 1).data;
console.log('Expected: [0,0,255,255], Got:', pixel2);
console.log('PASS:', pixel2[0] === 0 && pixel2[1] === 0 && pixel2[2] === 255, '\n');

// Test 3: clearRect
console.log('Test 3: clearRect');
ctx.clearRect(5, 5, 1, 1);
const pixel3 = ctx.getImageData(5, 5, 1, 1).data;
console.log('Expected: [0,0,0,255], Got:', pixel3);
console.log('PASS:', pixel3[0] === 0 && pixel3[1] === 0 && pixel3[2] === 0, '\n');

// Test 4: Color parsing
console.log('Test 4: Color parsing');
const testColors = ['#ff0000', 'red', '#00ff00', '#0000ff'];
testColors.forEach(color => {
  const rgb = ctx.hexToRgb(color);
  console.log(`Color ${color} -> RGB(${rgb.r},${rgb.g},${rgb.b})`);
});

console.log('\nCanvas test complete!');