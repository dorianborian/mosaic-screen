const { SimpleCanvas } = require('./simple-canvas');

const tempCanvas = new SimpleCanvas(15, 15, true);
const tempCtx = tempCanvas.getContext('2d');
tempCtx.fillStyle = 'white';
tempCtx.font = 'mini';
tempCtx.fillText('HI', 2, 2);

console.log('Mask canvas after fillText:');
const chars = ' .:-=+*#%@';
for (let y = 0; y < 15; y++) {
  let row = '';
  for (let x = 0; x < 15; x++) {
    const i = (y * 15 + x) * 4;
    const brightness = (tempCanvas.pixels[i] + tempCanvas.pixels[i+1] + tempCanvas.pixels[i+2]) / 3;
    row += chars[Math.floor((brightness / 255) * (chars.length - 1))].repeat(2);
  }
  console.log(row);
}

console.log('\nMask data from getImageData:');
const mask = tempCtx.getImageData(0, 0, 15, 15);
console.log('mask.data length:', mask.data.length);
console.log('mask.width:', mask.width);
console.log('mask.height:', mask.height);

let textPixelCount = 0;
for (let i = 0; i < 15 * 15; i++) {
  const pos = i * 4;
  if (mask.data[pos + 3] > 0) textPixelCount++;
}
console.log('Text pixels found:', textPixelCount);
