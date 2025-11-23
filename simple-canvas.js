// Simple canvas implementation for 15x15 pixel matrix
class SimpleCanvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.pixels = new Uint8ClampedArray(width * height * 4);
    this.fillStyle = '#000000';
    this.font = '8px Arial';
    // Initialize with transparent pixels
    for (let i = 3; i < this.pixels.length; i += 4) {
      this.pixels[i] = 255; // Alpha
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
    let fontHeight, charWidth, chars;
    
    if (this.font.includes('big')) {
      // Medium numbers font - 4x6 for clock readability
      fontHeight = 6;
      charWidth = 4;
      chars = {
        '0': [[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
        '1': [[0,1,0,0],[1,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0],[1,1,1,0]],
        '2': [[0,1,1,0],[1,0,0,1],[0,0,1,0],[0,1,0,0],[1,0,0,0],[1,1,1,1]],
        '3': [[0,1,1,0],[1,0,0,1],[0,0,1,0],[0,0,0,1],[1,0,0,1],[0,1,1,0]],
        '4': [[1,0,1,0],[1,0,1,0],[1,1,1,1],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
        '5': [[1,1,1,1],[1,0,0,0],[1,1,1,0],[0,0,0,1],[1,0,0,1],[0,1,1,0]],
        '6': [[0,1,1,0],[1,0,0,0],[1,1,1,0],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
        '7': [[1,1,1,1],[0,0,0,1],[0,0,1,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
        '8': [[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
        '9': [[0,1,1,0],[1,0,0,1],[1,0,0,1],[0,1,1,1],[0,0,0,1],[0,1,1,0]],
        ':': [[0,0,0,0],[0,1,0,0],[0,0,0,0],[0,1,0,0],[0,0,0,0],[0,0,0,0]],
        '.': [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,1,0,0]],
        ' ': [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]
      };
    } else if (this.font.includes('tall')) {
      // Tall 5x7 font
      fontHeight = 7;
      charWidth = 5;
      chars = {
        '0': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
        '1': [[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
        '2': [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,1,1,1,1]],
        '3': [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,1,1,0],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
        '4': [[1,0,0,1,0],[1,0,0,1,0],[1,0,0,1,0],[1,1,1,1,1],[0,0,0,1,0],[0,0,0,1,0],[0,0,0,1,0]],
        '5': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[0,0,0,0,1],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
        '6': [[0,1,1,1,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
        '7': [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0]],
        '8': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
        '9': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,1],[0,0,0,0,1],[0,0,0,0,1],[0,1,1,1,0]],
        ':': [[0,0,0,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,0,0,0]],
        ' ': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]
      };
    } else {
      // Minimal 3x5 font
      fontHeight = 5;
      charWidth = 3;
      chars = {
        '0': [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
        '1': [[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
        '2': [[1,1,1],[0,0,1],[1,1,1],[1,0,0],[1,1,1]],
        '3': [[1,1,1],[0,0,1],[1,1,1],[0,0,1],[1,1,1]],
        '4': [[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]],
        '5': [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
        '6': [[1,1,1],[1,0,0],[1,1,1],[1,0,1],[1,1,1]],
        '7': [[1,1,1],[0,0,1],[0,0,1],[0,0,1],[0,0,1]],
        '8': [[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,1,1]],
        '9': [[1,1,1],[1,0,1],[1,1,1],[0,0,1],[1,1,1]],
        ':': [[0,0,0],[0,1,0],[0,0,0],[0,1,0],[0,0,0]],
        '.': [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,1,0]],
        ' ': [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
        'A': [[0,1,0],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
        'B': [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,1,0]],
        'C': [[0,1,1],[1,0,0],[1,0,0],[1,0,0],[0,1,1]],
        'D': [[1,1,0],[1,0,1],[1,0,1],[1,0,1],[1,1,0]],
        'E': [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,1,1]],
        'F': [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,0,0]],
        'G': [[0,1,1],[1,0,0],[1,0,1],[1,0,1],[0,1,1]],
        'H': [[1,0,1],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
        'I': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
        'L': [[1,0,0],[1,0,0],[1,0,0],[1,0,0],[1,1,1]],
        'M': [[1,0,1],[1,1,1],[1,0,1],[1,0,1],[1,0,1]],
        'N': [[1,0,1],[1,1,1],[1,0,1],[1,0,1],[1,0,1]],
        'O': [[0,1,0],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
        'P': [[1,1,0],[1,0,1],[1,1,0],[1,0,0],[1,0,0]],
        'R': [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,0,1]],
        'S': [[0,1,1],[1,0,0],[0,1,0],[0,0,1],[1,1,0]],
        'T': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
        'U': [[1,0,1],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
        'V': [[1,0,1],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
        'W': [[1,0,1],[1,0,1],[1,0,1],[1,1,1],[1,0,1]],
        'X': [[1,0,1],[1,0,1],[0,1,0],[1,0,1],[1,0,1]],
        'Y': [[1,0,1],[1,0,1],[0,1,0],[0,1,0],[0,1,0]],
        'Z': [[1,1,1],[0,0,1],[0,1,0],[1,0,0],[1,1,1]]
      };
    }
    
    let offsetX = 0;
    for (const char of text.toUpperCase()) {
      const pattern = chars[char];
      if (pattern) {
        for (let py = 0; py < fontHeight; py++) {
          for (let px = 0; px < charWidth; px++) {
            if (pattern[py] && pattern[py][px] && x + offsetX + px < this.width && y + py < this.height && y + py >= 0) {
              const i = ((y + py) * this.width + (x + offsetX + px)) * 4;
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
    
    // Simple frame extraction from sprite sheet
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
      // Single pixel read
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
    return { width: text.length * 4 };
  }

  hexToRgb(hex) {
    // Handle named colors
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