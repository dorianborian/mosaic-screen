import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { post } from '../utils.js';
import { theme, baseStyles } from '../theme.js';

class GlobalControls extends LitElement {
  static styles = [theme, baseStyles];

  render() {
    return html`
      <div class="box">
        <h2>Global Controls</h2>
        <label>
          Brightness:
          <input type="range" min="1" max="254" value="100" @change=${this.onBrightness}>
        </label>
        <button @click=${this.onStop}>Stop</button>
        <button @click=${this.onRotate}>Rotate (5s)</button>
      </div>
    `;
  }

  onBrightness(e) {
    fetch('/bright', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brightness: e.target.value })
    });
  }

  onStop() { post('stop'); }
  onRotate() { post('rotate', 5); }
}

customElements.define('global-controls', GlobalControls);
