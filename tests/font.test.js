const { TestRunner, SimpleCanvas } = require('./test-runner');

const runner = new TestRunner('Font Tests');

runner.test('Mini font renders', () => {
  const canvas = new SimpleCanvas(15, 15);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillText('A', 0, 0);
  let hasPixels = false;
  for (let i = 0; i < canvas.pixels.length; i += 4) {
    if (canvas.pixels[i] > 0) hasPixels = true;
  }
  runner.assert(hasPixels, 'Font should render pixels');
});

runner.test('Medium font renders', () => {
  const canvas = new SimpleCanvas(15, 15);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'medium';
  ctx.fillText('1', 0, 0);
  let hasPixels = false;
  for (let i = 0; i < canvas.pixels.length; i += 4) {
    if (canvas.pixels[i] > 0) hasPixels = true;
  }
  runner.assert(hasPixels, 'Medium font should render pixels');
});

runner.test('Big font renders', () => {
  const canvas = new SimpleCanvas(15, 15);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'big';
  ctx.fillText('1', 0, 0);
  let hasPixels = false;
  for (let i = 0; i < canvas.pixels.length; i += 4) {
    if (canvas.pixels[i] > 0) hasPixels = true;
  }
  runner.assert(hasPixels, 'Big font should render pixels');
});

runner.test('measureText returns width', () => {
  const canvas = new SimpleCanvas(15, 15);
  const ctx = canvas.getContext('2d');
  const size = ctx.measureText('ABC');
  runner.assert(size.width > 0, 'Text width should be greater than 0');
});

console.log('\nVisual test - Clock display (12:34 PM):');
const canvas = new SimpleCanvas(15, 15);
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#ff0000';
ctx.font = 'medium';
ctx.fillText('12', 2, 1);
ctx.fillText('34.', 2, 8);
runner.renderBinary(canvas);

process.exit(runner.summary() ? 0 : 1);
