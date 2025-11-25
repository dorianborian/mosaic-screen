const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function generateFontPNG(fontData, outputPath) {
  const { charWidth, charHeight, chars, patterns } = fontData;
  const charsArray = chars.split('');
  const numChars = charsArray.length;
  
  const width = numChars * (charWidth + 1);
  const height = charHeight;
  const png = new PNG({ width, height });
  
  // Fill with white
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      png.data[idx] = 255;
      png.data[idx + 1] = 255;
      png.data[idx + 2] = 255;
      png.data[idx + 3] = 255;
    }
  }
  
  // Draw each character in black
  charsArray.forEach((char, charIdx) => {
    const pattern = patterns[char];
    if (pattern) {
      const xOffset = charIdx * (charWidth + 1);
      for (let y = 0; y < charHeight; y++) {
        for (let x = 0; x < charWidth; x++) {
          if (pattern[y] && pattern[y][x]) {
            const idx = (width * y + (xOffset + x)) << 2;
            png.data[idx] = 0;
            png.data[idx + 1] = 0;
            png.data[idx + 2] = 0;
            png.data[idx + 3] = 255;
          }
        }
      }
    }
  });
  
  png.pack().pipe(fs.createWriteStream(outputPath));
  console.log(`Generated ${outputPath}`);
}

const fontFiles = ['mini-font.json', 'medium-font.json', 'big-font.json'];
const fontsDir = path.join(__dirname, '..', '..', 'fonts');

fontFiles.forEach(file => {
  const jsonPath = path.join(fontsDir, file);
  if (fs.existsSync(jsonPath)) {
    const fontData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const pngPath = jsonPath.replace('.json', '.png');
    generateFontPNG(fontData, pngPath);
  }
});

console.log('\nAll font PNGs generated!');
