const { TestRunner, SimpleCanvas } = require('./test-runner');

const runner = new TestRunner('Text Overlay Tests');

runner.test('Text renders on transparent canvas', () => {
  const canvas = new SimpleCanvas(15, 15, true);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'mini';
  ctx.fillText('Hi', 0, 0);
  let hasPixels = false;
  for (let i = 0; i < canvas.pixels.length; i += 4) {
    if (canvas.pixels[i] > 0) hasPixels = true;
  }
  runner.assert(hasPixels, 'Text should render on transparent canvas');
});

runner.test('Text renders on colored background', () => {
  const canvas = new SimpleCanvas(15, 15);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0000ff';
  ctx.fillRect(0, 0, 15, 15);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'mini';
  ctx.fillText('HI', 2, 2);
  
  let hasBlue = false, hasWhite = false;
  for (let i = 0; i < canvas.pixels.length; i += 4) {
    if (canvas.pixels[i+2] > 200) hasBlue = true;
    if (canvas.pixels[i] > 200) hasWhite = true;
  }
  runner.assert(hasBlue && hasWhite, 'Should have both background and text colors');
});

runner.test('Positioned text renders correctly', () => {
  const canvas = new SimpleCanvas(15, 15);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'mini';
  ctx.fillText('X', 5, 5);
  
  const pixel = ctx.getImageData(5, 5, 1, 1).data;
  runner.assert(pixel[0] > 0 || pixel[1] > 0 || pixel[2] > 0, 'Text should render at position');
});

console.log('\nVisual test - Text on blue background:');
const canvas = new SimpleCanvas(15, 15);
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#0000ff';
ctx.fillRect(0, 0, 15, 15);
ctx.fillStyle = '#ffffff';
ctx.font = 'mini';
ctx.fillText('HI', 2, 2);
runner.render(canvas);

process.exit(runner.summary() ? 0 : 1);
