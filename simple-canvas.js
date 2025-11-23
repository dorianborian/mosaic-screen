const fs = require('fs');
const path = require('path');

// Load fonts
const fonts = {
  mini: JSON.parse(fs.readFileSync(path.join(__dirname, 'fonts/mini-font.json'), 'utf8')),
  medium: JSON.parse(fs.readFileSync(path.join(__dirname, 'fonts/medium-font.json'), 'utf8')),
  big: JSON.parse(fs.readFileSync(path.join(__dirname, 'fonts/big-font.json'), 'utf8'))
};

class SimpleCanvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.pixels = new Uint8ClampedArray(width * height * 4);
    this.fillStyle = '#000000';
    this.font = '8px Arial';
    for (let i = 3; i < this.pixels.length; i += 4) {
      this.pixels[i] = 255;
    }
  }

  getContext() {
    return this;
  }

  clearRect(x, y, w, h) {
    x = Math.floor(x); y = Math.floor(y); w = Math.floor(w); h = Math.floor(h);
    for (let py = y; py < y + h && py < this.height; py++) {
      for (let px = x; px < x + w && px < this.width; px++) {
        if (px >= 0 && py >= 0) {
          const i = (py * this.width + px) * 4;
          this.pixels[i] = this.pixels[i + 1] = this.pixels[i + 2] = 0;
          this.pixels[i + 3] = 255;
        }
      }
    }
  }

  fillRect(x, y, w, h) {
    const color = this.hexToRgb(this.fillStyle);
    x = Math.floor(x); y = Math.floor(y); w = Math.floor(w); h = Math.floor(h);
    for (let py = y; py < y + h && py < this.height; py++) {
      for (let px = x; px < x + w && px < this.width; px++) {
        if (px >= 0 && py >= 0) {
          const i = (py * this.width + px) * 4;
          this.pixels[i] = color.r;
          this.pixels[i + 1] = color.g;
          this.pixels[i + 2] = color.b;
          this.pixels[i + 3] = 255;
        }
      }
    }
  }

  fillText(text, x, y) {
    const color = this.hexToRgb(this.fillStyle);
    let fontData;
    
    if (this.font.includes('big')) {
      fontData = fonts.big;
    } else if (this.font.includes('medium')) {
      fontData = fonts.medium;
    } else if (this.font.includes('tall')) {
      fontData = fonts.medium;
    } else {
      fontData = fonts.mini;
    }
    
    const { charWidth, charHeight, patterns } = fontData;
    
    let offsetX = 0;
    for (const char of text.toUpperCase()) {
      const pattern = patterns[char];
      if (pattern) {
        for (let py = 0; py < charHeight; py++) {
          for (let px = 0; px < charWidth; px++) {
            const drawX = x + offsetX + px;
            const drawY = y + py;
            if (pattern[py] && pattern[py][px] && drawX >= 0 && drawX < this.width && drawY >= 0 && drawY < this.height) {
              const i = (drawY * this.width + drawX) * 4;
              this.pixels[i] = color.r;
              this.pixels[i + 1] = color.g;
              this.pixels[i + 2] = color.b;
              this.pixels[i + 3] = 255;
            }
          }
        }
        offsetX += charWidth + 1;
      }
    }
  }

  arc(x, y, radius, startAngle, endAngle) {
    this._arcData = { x, y, radius };
  }

  fill() {
    if (this._arcData) {
      const { x, y, radius } = this._arcData;
      const color = this.hexToRgb(this.fillStyle);
      const fx = Math.floor(x), fy = Math.floor(y);
      for (let py = Math.max(0, fy - radius); py <= Math.min(this.height - 1, fy + radius); py++) {
        for (let px = Math.max(0, fx - radius); px <= Math.min(this.width - 1, fx + radius); px++) {
          const dist = Math.sqrt((px - fx) ** 2 + (py - fy) ** 2);
          if (dist <= radius) {
            const i = (py * this.width + px) * 4;
            this.pixels[i] = color.r;
            this.pixels[i + 1] = color.g;
            this.pixels[i + 2] = color.b;
            this.pixels[i + 3] = 255;
          }
        }
      }
    }
  }

  drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh) {
    if (!img.data) return;
    
    for (let y = 0; y < sh && y + dy < this.height; y++) {
      for (let x = 0; x < sw && x + dx < this.width; x++) {
        if (x + dx >= 0 && y + dy >= 0) {
          const srcIndex = ((sy + y) * img.width + (sx + x)) * 4;
          const dstIndex = ((dy + y) * this.width + (dx + x)) * 4;
          
          if (srcIndex < img.data.length) {
            this.pixels[dstIndex] = img.data[srcIndex];
            this.pixels[dstIndex + 1] = img.data[srcIndex + 1];
            this.pixels[dstIndex + 2] = img.data[srcIndex + 2];
            this.pixels[dstIndex + 3] = img.data[srcIndex + 3];
          }
        }
      }
    }
  }

  getImageData(x, y, w, h) {
    if (w === 1 && h === 1) {
      const i = (y * this.width + x) * 4;
      const pixel = [this.pixels[i], this.pixels[i+1], this.pixels[i+2], this.pixels[i+3]];
      return { data: pixel };
    }
    return { data: this.pixels };
  }

  putImageData(imageData, x, y) {
    this.pixels.set(imageData.data);
  }

  measureText(text) {
    let fontData;
    if (this.font.includes('big')) {
      fontData = fonts.big;
    } else if (this.font.includes('medium')) {
      fontData = fonts.medium;
    } else {
      fontData = fonts.mini;
    }
    return { width: text.length * (fontData.charWidth + 1) };
  }

  hexToRgb(hex) {
    const namedColors = {
      'red': '#ff0000',
      'green': '#00ff00', 
      'blue': '#0000ff',
      'white': '#ffffff',
      'black': '#000000'
    };
    
    if (namedColors[hex]) {
      hex = namedColors[hex];
    }
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  beginPath() {}
  closePath() {}
  stroke() {}
}

module.exports = { SimpleCanvas };
