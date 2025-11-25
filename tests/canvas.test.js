const { TestRunner, SimpleCanvas } = require('./test-runner');

const runner = new TestRunner('Canvas Tests');

runner.test('Basic red fillRect', () => {
  const canvas = new SimpleCanvas(15, 15);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(5, 5, 1, 1);
  const pixel = ctx.getImageData(5, 5, 1, 1).data;
  runner.assertEqual([pixel[0], pixel[1], pixel[2]], [255, 0, 0]);
});

runner.test('Blue fillRect', () => {
  const canvas = new SimpleCanvas(15, 15);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0000ff';
  ctx.fillRect(7, 7, 1, 1);
  const pixel = ctx.getImageData(7, 7, 1, 1).data;
  runner.assertEqual([pixel[0], pixel[1], pixel[2]], [0, 0, 255]);
});

runner.test('clearRect', () => {
  const canvas = new SimpleCanvas(15, 15);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(5, 5, 1, 1);
  ctx.clearRect(5, 5, 1, 1);
  const pixel = ctx.getImageData(5, 5, 1, 1).data;
  runner.assertEqual([pixel[0], pixel[1], pixel[2]], [0, 0, 0]);
});

runner.test('Color parsing - hex', () => {
  const canvas = new SimpleCanvas(15, 15);
  const ctx = canvas.getContext('2d');
  const rgb = ctx.hexToRgb('#ff0000');
  runner.assertEqual(rgb, { r: 255, g: 0, b: 0 });
});

runner.test('Color parsing - named', () => {
  const canvas = new SimpleCanvas(15, 15);
  const ctx = canvas.getContext('2d');
  const rgb = ctx.hexToRgb('red');
  runner.assertEqual(rgb, { r: 255, g: 0, b: 0 });
});

process.exit(runner.summary() ? 0 : 1);
