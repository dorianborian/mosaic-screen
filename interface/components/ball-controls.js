import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { post } from '../utils.js';
import { theme, baseStyles } from '../theme.js';

class BallControls extends LitElement {
  static styles = [theme, baseStyles];

  render() {
    return html`
      <div class="box">
        <h2>Bouncy Ball</h2>
        <label>Color: <input type="color" value="#ff0000" @change=${e => post('ball', e.target.value)}></label>
      </div>
    `;
  }
}

customElements.define('ball-controls', BallControls);
