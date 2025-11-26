import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { post } from '../utils.js';
import { theme, baseStyles } from '../theme.js';

class GlobalControls extends LitElement {
  static styles = [theme, baseStyles];

  render() {
    return html`
      <div class="box">
        <h2><app-icon name="settings"></app-icon> Global Controls</h2>
        <label>
          <app-icon name="sun"></app-icon> Brightness:
          <input type="range" min="1" max="254" value="100" @change=${this.onBrightness}>
        </label>
        <button @click=${this.onStop}>
          <app-icon name="square"></app-icon> Stop
        </button>
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
}

customElements.define('global-controls', GlobalControls);
