import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { theme, baseStyles } from '../theme.js';

class TextOverlay extends LitElement {
  static styles = [theme, baseStyles];

  static properties = {
    enabled: { type: Boolean },
    text: { type: String },
    font: { type: String },
    color: { type: String },
    scroll: { type: Boolean },
    speed: { type: Number },
    bgColor: { type: String },
    bgAlpha: { type: Number },
    useClock: { type: Boolean }
  };

  constructor() {
    super();
    this.enabled = false;
    this.text = '';
    this.font = 'medium';
    this.color = '#ffffff';
    this.scroll = false;
    this.speed = 2;
    this.bgColor = '#000000';
    this.bgAlpha = 0.2;
    this.useClock = false;
  }

  render() {
    return html`
      <div class="box">
        <h2>Text Overlay</h2>
        <label><input type="checkbox" ?checked=${this.enabled} @change=${e => this.enabled = e.target.checked}> Enable</label>
        <label><input type="checkbox" ?checked=${this.useClock} @change=${e => this.useClock = e.target.checked}> Use Clock</label>
        <input type="text" .value=${this.text} @input=${e => this.text = e.target.value} placeholder="Text" ?disabled=${this.useClock}>
        <select .value=${this.font} @change=${e => this.font = e.target.value}>
          <option value="">Small</option>
          <option value="medium">Medium</option>
          <option value="big">Big</option>
        </select>
        <label>Text Color: <input type="color" .value=${this.color} @input=${e => this.color = e.target.value}></label>
        <label><input type="checkbox" ?checked=${this.scroll} @change=${e => this.scroll = e.target.checked} ?disabled=${this.useClock}> Scroll</label>
        <label>Speed: <input type="range" min="1" max="5" .value=${this.speed} @input=${e => this.speed = parseInt(e.target.value)} ?disabled=${!this.scroll || this.useClock}> ${this.speed}</label>
        <label>BG Color: <input type="color" .value=${this.bgColor} @input=${e => this.bgColor = e.target.value}></label>
        <label>BG Alpha: <input type="range" min="0" max="1" step="0.1" .value=${this.bgAlpha} @input=${e => this.bgAlpha = parseFloat(e.target.value)}> ${this.bgAlpha}</label>
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
        scroll: this.scroll,
        speed: this.speed,
        bgColor: this.bgColor,
        bgAlpha: this.bgAlpha,
        useClock: this.useClock
      })
    });
  }
}

customElements.define('text-overlay', TextOverlay);
