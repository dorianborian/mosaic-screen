import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { post } from '../utils.js';
import { theme, baseStyles } from '../theme.js';

class ColorControls extends LitElement {
  static styles = [theme, baseStyles];

  render() {
    return html`
      <div class="box">
        <h2>Solid Color</h2>
        <label>Color: <input type="color" value="#ff0000" @change=${e => post('color', e.target.value)}></label>
      </div>
    `;
  }
}

customElements.define('color-controls', ColorControls);
