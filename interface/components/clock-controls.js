import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { post } from '../utils.js';
import { theme, baseStyles } from '../theme.js';

class ClockControls extends LitElement {
  static styles = [theme, baseStyles];

  render() {
    return html`
      <div class="box">
        <h2>Clock</h2>
        <label>Color: <input type="color" value="#ff0000" @change=${this.onChange}></label>
      </div>
    `;
  }

  onChange(e) {
    post('clock', { color: e.target.value });
    fetch('/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: false })
    });
  }
}

customElements.define('clock-controls', ClockControls);
