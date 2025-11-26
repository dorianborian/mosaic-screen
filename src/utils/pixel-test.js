// Spiral rainbow pixel test
module.exports = function pixelTest(channel, ws281x, duration = 2000) {
  const start = Date.now();
  const w = 15, h = 15;
  const cx = 7, cy = 7;
  
  const interval = setInterval(() => {
    const t = (Date.now() - start) / 1000;
    
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = x - cx, dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const hue = (angle / (Math.PI * 2) + dist * 0.1 - t) % 1;
        
        const i = Math.floor(hue * 6);
        const f = hue * 6 - i;
        const q = 1 - f;
        
        let r, g, b;
        switch (i % 6) {
          case 0: r = 1; g = f; b = 0; break;
          case 1: r = q; g = 1; b = 0; break;
          case 2: r = 0; g = 1; b = f; break;
          case 3: r = 0; g = q; b = 1; break;
          case 4: r = f; g = 0; b = 1; break;
          default: r = 1; g = 0; b = q;
        }
        
        const idx = (y % 2 === 0) ? y * w + x : y * w + (w - 1 - x);
        channel.array[idx] = (Math.round(r * 255) << 16) | (Math.round(g * 255) << 8) | Math.round(b * 255);
      }
    }
    
    ws281x.render();
    if (Date.now() - start >= duration) clearInterval(interval);
  }, 16);
};
