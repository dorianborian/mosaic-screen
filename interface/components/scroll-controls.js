import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { post } from '../utils.js';
import { theme, baseStyles } from '../theme.js';

class ScrollControls extends LitElement {
  static styles = [theme, baseStyles];

  static properties = {
    text: { type: String },
    size: { type: String },
    speed: { type: Number },
    color: { type: String }
  };

  constructor() {
    super();
    this.text = 'Sample text';
    this.size = 'small';
    this.speed = 2;
    this.color = '#0000ff';
  }

  render() {
    return html`
      <div class="box">
        <h2>Scrolling Text</h2>
        <input type="text" .value=${this.text} @input=${e => this.text = e.target.value}>
        <select .value=${this.size} @change=${e => this.size = e.target.value}>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="big">Big</option>
        </select>
        <label>Speed: <input type="range" min="1" max="5" .value=${this.speed} @input=${e => this.speed = parseInt(e.target.value)}> ${this.speed}</label>
        <label>Color: <input type="color" .value=${this.color} @input=${e => this.color = e.target.value}></label>
        <button @click=${this.apply}>Apply</button>
      </div>
    `;
  }

  apply() {
    post('scroll', {
      text: this.text,
      size: this.size,
      speed: this.speed,
      color: this.color
    });
  }
}

customElements.define('scroll-controls', ScrollControls);
