const { SimpleCanvas } = require('./simple-canvas');

function hexToRGB(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function applyTextOverlay(canvas, ctx, textState) {
  if (!textState.enabled || !textState.text) return;
  
  const w = canvas.width;
  const h = canvas.height;
  const bgPixels = new Uint8ClampedArray(ctx.pixels);
  
  const tempCanvas = new SimpleCanvas(w, h, true);
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.fillStyle = 'white';
  tempCtx.font = textState.font;
  tempCtx.fillText(textState.text, textState.x, textState.y);
  const mask = tempCtx.getImageData(0, 0, w, h);
  
  const textRGB = hexToRGB(textState.color);
  const alpha = textState.alpha;
  
  for (let i = 0; i < w * h; i++) {
    const pos = i * 4;
    const isText = mask.data[pos + 3] > 0;
    
    if (textState.invert) {
      if (isText) {
        ctx.pixels[pos] = bgPixels[pos];
        ctx.pixels[pos + 1] = bgPixels[pos + 1];
        ctx.pixels[pos + 2] = bgPixels[pos + 2];
      } else {
        ctx.pixels[pos] = textRGB.r * alpha + bgPixels[pos] * (1 - alpha);
        ctx.pixels[pos + 1] = textRGB.g * alpha + bgPixels[pos + 1] * (1 - alpha);
        ctx.pixels[pos + 2] = textRGB.b * alpha + bgPixels[pos + 2] * (1 - alpha);
      }
    } else {
      if (isText) {
        ctx.pixels[pos] = textRGB.r * alpha + bgPixels[pos] * (1 - alpha);
        ctx.pixels[pos + 1] = textRGB.g * alpha + bgPixels[pos + 1] * (1 - alpha);
        ctx.pixels[pos + 2] = textRGB.b * alpha + bgPixels[pos + 2] * (1 - alpha);
      }
    }
  }
}

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

console.log('=== Test 1: Normal Overlay (alpha=1) ===');
const c1 = new SimpleCanvas(15, 15);
const ctx1 = c1.getContext('2d');
ctx1.fillStyle = '#0000ff';
ctx1.fillRect(0, 0, 15, 15);
applyTextOverlay(c1, ctx1, { enabled: true, text: 'HI', x: 2, y: 2, font: 'mini', color: '#ff0000', alpha: 1, invert: false });
render(c1);

console.log('\n=== Test 2: Normal Overlay (alpha=0.5) ===');
const c2 = new SimpleCanvas(15, 15);
const ctx2 = c2.getContext('2d');
ctx2.fillStyle = '#0000ff';
ctx2.fillRect(0, 0, 15, 15);
applyTextOverlay(c2, ctx2, { enabled: true, text: 'HI', x: 2, y: 2, font: 'mini', color: '#ff0000', alpha: 0.5, invert: false });
render(c2);

console.log('\n=== Test 3: Inverted Overlay ===');
const c3 = new SimpleCanvas(15, 15);
const ctx3 = c3.getContext('2d');
ctx3.fillStyle = '#0000ff';
ctx3.fillRect(0, 0, 15, 15);
applyTextOverlay(c3, ctx3, { enabled: true, text: 'HI', x: 2, y: 2, font: 'mini', color: '#ff0000', alpha: 1, invert: true });
render(c3);

console.log('\n=== Test 4: Disabled ===');
const c4 = new SimpleCanvas(15, 15);
const ctx4 = c4.getContext('2d');
ctx4.fillStyle = '#0000ff';
ctx4.fillRect(0, 0, 15, 15);
applyTextOverlay(c4, ctx4, { enabled: false, text: 'HI', x: 2, y: 2, font: 'mini', color: '#ff0000', alpha: 1, invert: false });
render(c4);
