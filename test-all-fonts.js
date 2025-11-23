const { SimpleCanvas } = require('./simple-canvas');

console.log('Testing all font characters...\n');

// Test mini font alphabet
console.log('Mini font - Full alphabet:');
const termWidth = process.stdout.columns || 80;
const canvas1 = new SimpleCanvas(termWidth, 5);
const ctx1 = canvas1.getContext('2d');
ctx1.fillStyle = '#ffffff';
ctx1.fillText('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 0, 0);

// Show mini font (5 pixels high)
for (let y = 0; y < 5; y++) {
  let row = '';
  for (let x = 0; x < termWidth; x++) {
    const i = (y * termWidth + x) * 4;
    const r = ctx1.pixels[i];
    row += r > 0 ? '█' : '·';
  }
  console.log(row);
}

console.log('\nBig font - Numbers:');
const canvas2 = new SimpleCanvas(termWidth, 6);
const ctx2 = canvas2.getContext('2d');
ctx2.fillStyle = '#ffffff';
ctx2.font = 'big';
ctx2.fillText('0123456789', 0, 0);

// Show big font (6 pixels high)
for (let y = 0; y < 6; y++) {
  let row = '';
  for (let x = 0; x < termWidth; x++) {
    const i = (y * termWidth + x) * 4;
    const r = ctx2.pixels[i];
    row += r > 0 ? '█' : '·';
  }
  console.log(row);
}

console.log('\nFont test complete!');