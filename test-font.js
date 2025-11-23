const { SimpleCanvas } = require('./simple-canvas');

console.log('Testing font rendering...\n');

const canvas = new SimpleCanvas(15, 15);
const ctx = canvas.getContext('2d');

// Test 1: Clock display (12:34 PM) with big font
console.log('Test 1: Clock display (12:34 PM) with big font');
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, 15, 15); // Clear to black
ctx.fillStyle = '#ff0000';
ctx.font = 'big';
ctx.fillText('12', 1, 0);    // Hours
ctx.fillText('34.', 1, 7);   // Minutes + PM dot

// Print visual representation (full 15x15)
for (let y = 0; y < 15; y++) {
  let row = '';
  for (let x = 0; x < 15; x++) {
    const i = (y * 15 + x) * 4;
    const r = ctx.pixels[i];
    row += r > 0 ? '█' : '·';
  }
  console.log(row);
}

console.log('\nTest 2: Big font (12)');
const canvas2 = new SimpleCanvas(15, 15);
const ctx2 = canvas2.getContext('2d');
ctx2.fillStyle = '#00ff00';
ctx2.font = 'big';
ctx2.fillText('12', 0, 0);

// Print visual representation (full 15x15)
for (let y = 0; y < 15; y++) {
  let row = '';
  for (let x = 0; x < 15; x++) {
    const i = (y * 15 + x) * 4;
    const g = ctx2.pixels[i + 1];
    row += g > 0 ? '█' : '·';
  }
  console.log(row);
}

console.log('\nTest 3: Mini font (ABC)');
const canvas3 = new SimpleCanvas(15, 15);
const ctx3 = canvas3.getContext('2d');
ctx3.fillStyle = '#0000ff';
ctx3.fillText('ABC', 0, 0);

// Print visual representation (full 15x15)
for (let y = 0; y < 15; y++) {
  let row = '';
  for (let x = 0; x < 15; x++) {
    const i = (y * 15 + x) * 4;
    const b = ctx3.pixels[i + 2];
    row += b > 0 ? '█' : '·';
  }
  console.log(row);
}

console.log('\nFont test complete!');