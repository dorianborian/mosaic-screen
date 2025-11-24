const { SimpleCanvas } = require('./simple-canvas');

function render(canvas) {
  const chars = ' .:-=+*#%@';
  for (let y = 0; y < canvas.height; y++) {
    let row = '';
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      const brightness = (canvas.pixels[i] + canvas.pixels[i+1] + canvas.pixels[i+2]) / 3;
      row += chars[Math.floor((brightness / 255) * (chars.length - 1))].repeat(2);
    }
    console.log(row);
  }
}

console.log('=== Test: Text on Blue Background ===');
const canvas = new SimpleCanvas(15, 15);
const ctx = canvas.getContext('2d');

// Blue background
ctx.fillStyle = '#0000ff';
ctx.fillRect(0, 0, 15, 15);

// White text
ctx.fillStyle = '#ffffff';
ctx.font = 'mini';
ctx.fillText('HI', 2, 2);

render(canvas);

console.log('\n=== Test: Clock Format ===');
const canvas2 = new SimpleCanvas(15, 15);
const ctx2 = canvas2.getContext('2d');

ctx2.fillStyle = '#000000';
ctx2.fillRect(0, 0, 15, 15);

ctx2.fillStyle = '#ff0000';
ctx2.font = 'medium';
ctx2.fillText('12', 2, 1);
ctx2.fillText('34.', 2, 8);

render(canvas2);
