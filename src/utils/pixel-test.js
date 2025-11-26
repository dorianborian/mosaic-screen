// Demoscene-style pixel test animation
module.exports = function pixelTest(channel, ws281x, duration = 2000) {
  const start = Date.now();
  const pixels = channel.array.length;
  
  const interval = setInterval(() => {
    const t = (Date.now() - start) / 1000;
    
    for (let i = 0; i < pixels; i++) {
      const h = (i / pixels + t * 0.5) % 1;
      const s = 0.8 + Math.sin(t * 3 + i * 0.1) * 0.2;
      const v = 0.5 + Math.sin(t * 2 + i * 0.05) * 0.5;
      
      const c = v * s;
      const x = c * (1 - Math.abs((h * 6) % 2 - 1));
      const m = v - c;
      
      let r, g, b;
      const hi = Math.floor(h * 6);
      switch (hi) {
        case 0: r = c; g = x; b = 0; break;
        case 1: r = x; g = c; b = 0; break;
        case 2: r = 0; g = c; b = x; break;
        case 3: r = 0; g = x; b = c; break;
        case 4: r = x; g = 0; b = c; break;
        default: r = c; g = 0; b = x;
      }
      
      channel.array[i] = (Math.round((r + m) * 255) << 16) | 
                         (Math.round((g + m) * 255) << 8) | 
                         Math.round((b + m) * 255);
    }
    
    ws281x.render();
    
    if (Date.now() - start >= duration) {
      clearInterval(interval);
    }
  }, 16);
};
