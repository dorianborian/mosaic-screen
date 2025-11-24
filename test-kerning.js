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

console.log('=== Test: ":)" ===');
const c1 = new SimpleCanvas(15, 15);
const ctx1 = c1.getContext('2d');
ctx1.fillStyle = '#ffffff';
ctx1.font = 'mini';
ctx1.fillText(':)', 0, 0);
render(c1);

console.log('\n=== Test: "HI" ===');
const c2 = new SimpleCanvas(15, 15);
const ctx2 = c2.getContext('2d');
ctx2.fillStyle = '#ffffff';
ctx2.font = 'mini';
ctx2.fillText('HI', 0, 0);
render(c2);

console.log('\n=== Test: "12:34" ===');
const c3 = new SimpleCanvas(15, 15);
const ctx3 = c3.getContext('2d');
ctx3.fillStyle = '#ffffff';
ctx3.font = 'mini';
ctx3.fillText('12:34', 0, 0);
render(c3);
