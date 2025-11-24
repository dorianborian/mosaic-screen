import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { post } from '../utils.js';
import { theme, baseStyles } from '../theme.js';

class PowerControls extends LitElement {
  static styles = [theme, baseStyles, css`
    button { background: #d32f2f; }
    button:hover { background: #b71c1c; }
  `];

  render() {
    return html`
      <div class="box">
        <h2>Power</h2>
        <button @click=${() => post('power', 'shutdown')}>Shutdown</button>
        <button @click=${() => post('power', 'restart')}>Restart</button>
      </div>
    `;
  }
}

customElements.define('power-controls', PowerControls);
