const { TestRunner } = require('./test-runner');

function hexToRGBA(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = hex.length >= 9 ? parseInt(hex.slice(7, 9), 16) / 255 : 1;
  return { r, g, b, a };
}

const runner = new TestRunner('Color Alpha Tests');

runner.test('Parse opaque red (#ff0000ff)', () => {
  const rgba = hexToRGBA('#ff0000ff');
  runner.assertEqual(rgba, { r: 255, g: 0, b: 0, a: 1 });
});

runner.test('Parse 50% transparent red (#ff000080)', () => {
  const rgba = hexToRGBA('#ff000080');
  runner.assert(Math.abs(rgba.a - 0.502) < 0.01, 'Alpha should be ~0.5');
  runner.assertEqual([rgba.r, rgba.g, rgba.b], [255, 0, 0]);
});

runner.test('Parse 80% transparent black (#000000cc)', () => {
  const rgba = hexToRGBA('#000000cc');
  runner.assertEqual(rgba.a, 0.8);
  runner.assertEqual([rgba.r, rgba.g, rgba.b], [0, 0, 0]);
});

runner.test('Parse legacy hex without alpha (#00ff00)', () => {
  const rgba = hexToRGBA('#00ff00');
  runner.assertEqual(rgba, { r: 0, g: 255, b: 0, a: 1 });
});

runner.test('Parse fully transparent (#ffffff00)', () => {
  const rgba = hexToRGBA('#ffffff00');
  runner.assertEqual(rgba.a, 0);
});

process.exit(runner.summary() ? 0 : 1);
