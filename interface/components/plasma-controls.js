import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { post } from '../utils.js';
import { theme, baseStyles } from '../theme.js';

class PlasmaControls extends LitElement {
  static styles = [theme, baseStyles];

  static properties = {
    modA: { type: String },
    modB: { type: String },
    modC: { type: String },
    brightness: { type: Number }
  };

  constructor() {
    super();
    this.modA = '';
    this.modB = '';
    this.modC = '';
    this.brightness = 1;
  }

  render() {
    return html`
      <div class="box">
        <h2>Plasma</h2>
        <label>Mod A: <input type="number" .value=${this.modA} @input=${e => this.modA = e.target.value} placeholder="random" step="0.1" min="0.1" max="64"></label>
        <label>Mod B: <input type="number" .value=${this.modB} @input=${e => this.modB = e.target.value} placeholder="random" step="0.1" min="0.1" max="64"></label>
        <label>Mod C: <input type="number" .value=${this.modC} @input=${e => this.modC = e.target.value} placeholder="random" step="0.1" min="0.1" max="64"></label>
        <label>Brightness: <input type="range" min="0.1" max="1" step="0.1" .value=${this.brightness} @input=${e => this.brightness = parseFloat(e.target.value)}> ${this.brightness}</label>
        <button @click=${this.apply}>Apply Plasma</button>
      </div>
    `;
  }

  apply() {
    const opts = { plasmaBrightness: this.brightness };
    if (this.modA) opts.modA = parseFloat(this.modA);
    if (this.modB) opts.modB = parseFloat(this.modB);
    if (this.modC) opts.modC = parseFloat(this.modC);
    post('plasma', opts);
  }
}

customElements.define('plasma-controls', PlasmaControls);
