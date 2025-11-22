// Simple canvas implementation for 15x15 pixel matrix
class SimpleCanvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.pixels = new Uint8ClampedArray(width * height * 4);
    this.fillStyle = '#000000';
    this.font = '8px Arial';
  }

  getContext() {
    return this;
  }

  clearRect(x, y, w, h) {
    for (let py = y; py < y + h && py < this.height; py++) {
      for (let px = x; px < x + w && px < this.width; px++) {
        const i = (py * this.width + px) * 4;
        this.pixels[i] = this.pixels[i + 1] = this.pixels[i + 2] = 0;
        this.pixels[i + 3] = 255;
      }
    }
  }

  fillRect(x, y, w, h) {
    const color = this.hexToRgb(this.fillStyle);
    for (let py = y; py < y + h && py < this.height; py++) {
      for (let px = x; px < x + w && px < this.width; px++) {
        const i = (py * this.width + px) * 4;
        this.pixels[i] = color.r;
        this.pixels[i + 1] = color.g;
        this.pixels[i + 2] = color.b;
        this.pixels[i + 3] = 255;
      }
    }
  }

  fillText(text, x, y) {
    const color = this.hexToRgb(this.fillStyle);
    const chars = {
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
      '.': [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,1,0]]
    };

    let offsetX = 0;
    for (const char of text) {
      const pattern = chars[char];
      if (pattern) {
        for (let py = 0; py < 5; py++) {
          for (let px = 0; px < 3; px++) {
            if (pattern[py][px] && x + offsetX + px < this.width && y + py < this.height) {
              const i = ((y + py) * this.width + (x + offsetX + px)) * 4;
              this.pixels[i] = color.r;
              this.pixels[i + 1] = color.g;
              this.pixels[i + 2] = color.b;
              this.pixels[i + 3] = 255;
            }
          }
        }
        offsetX += 4;
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
      for (let py = Math.max(0, y - radius); py <= Math.min(this.height - 1, y + radius); py++) {
        for (let px = Math.max(0, x - radius); px <= Math.min(this.width - 1, x + radius); px++) {
          const dist = Math.sqrt((px - x) ** 2 + (py - y) ** 2);
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
    // Simple image drawing - would need actual image data
  }

  getImageData(x, y, w, h) {
    return { data: this.pixels };
  }

  putImageData(imageData, x, y) {
    this.pixels.set(imageData.data);
  }

  measureText(text) {
    return { width: text.length * 4 };
  }

  hexToRgb(hex) {
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