const { SimpleCanvas } = require('../src/lib/simple-canvas');

class TestRunner {
  constructor(name) {
    this.name = name;
    this.passed = 0;
    this.failed = 0;
  }

  test(description, fn) {
    try {
      fn();
      this.passed++;
      console.log(`✓ ${description}`);
    } catch (err) {
      this.failed++;
      console.log(`✗ ${description}`);
      console.log(`  Error: ${err.message}`);
    }
  }

  assert(condition, message) {
    if (!condition) throw new Error(message || 'Assertion failed');
  }

  assertEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }

  render(canvas) {
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

  renderBinary(canvas) {
    for (let y = 0; y < canvas.height; y++) {
      let row = '';
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        const r = canvas.pixels[i];
        row += r > 0 ? '█' : '·';
      }
      console.log(row);
    }
  }

  summary() {
    console.log(`\n${this.name} Summary:`);
    console.log(`  Passed: ${this.passed}`);
    console.log(`  Failed: ${this.failed}`);
    console.log(`  Total: ${this.passed + this.failed}`);
    return this.failed === 0;
  }
}

module.exports = { TestRunner, SimpleCanvas };
