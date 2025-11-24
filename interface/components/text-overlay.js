import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { theme, baseStyles } from '../theme.js';

class TextOverlay extends LitElement {
  static styles = [theme, baseStyles];

  static properties = {
    enabled: { type: Boolean },
    text: { type: String },
    font: { type: String },
    color: { type: String },
    x: { type: Number },
    y: { type: Number },
    invert: { type: Boolean },
    alpha: { type: Number }
  };

  constructor() {
    super();
    this.enabled = false;
    this.text = '';
    this.font = 'medium';
    this.color = '#ffffff';
    this.x = 0;
    this.y = 0;
    this.invert = false;
    this.alpha = 1;
  }

  render() {
    return html`
      <div class="box">
        <h2>Text Overlay (Global)</h2>
        <label><input type="checkbox" ?checked=${this.enabled} @change=${e => this.enabled = e.target.checked}> Enable</label>
        <input type="text" .value=${this.text} @input=${e => this.text = e.target.value} placeholder="Text">
        <select .value=${this.font} @change=${e => this.font = e.target.value}>
          <option value="">Small</option>
          <option value="medium">Medium</option>
          <option value="big">Big</option>
        </select>
        <input type="color" .value=${this.color} @input=${e => this.color = e.target.value}>
        <label>X: <input type="number" .value=${this.x} @input=${e => this.x = parseInt(e.target.value)}></label>
        <label>Y: <input type="number" .value=${this.y} @input=${e => this.y = parseInt(e.target.value)}></label>
        <label><input type="checkbox" ?checked=${this.invert} @change=${e => this.invert = e.target.checked}> Invert</label>
        <label>Alpha: <input type="range" min="0" max="1" step="0.1" .value=${this.alpha} @input=${e => this.alpha = parseFloat(e.target.value)}> ${this.alpha}</label>
        <button @click=${this.apply}>Apply</button>
      </div>
    `;
  }

  apply() {
    fetch('/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enabled: this.enabled,
        text: this.text,
        font: this.font,
        color: this.color,
        x: this.x,
        y: this.y,
        invert: this.invert,
        alpha: this.alpha
      })
    });
  }
}

customElements.define('text-overlay', TextOverlay);
