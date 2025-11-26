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
        <h2><app-icon name="power"></app-icon> Power</h2>
        <button @click=${() => post('power', 'shutdown')}>
          <app-icon name="power-off"></app-icon> Shutdown
        </button>
        <button @click=${() => post('power', 'restart')}>
          <app-icon name="refresh-cw"></app-icon> Restart
        </button>
      </div>
    `;
  }


}

customElements.define('power-controls', PowerControls);
