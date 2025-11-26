import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import './color-picker-wrapper.js';
import { post } from '../utils.js';
import { theme, baseStyles } from '../theme.js';

class BallControls extends LitElement {
  static styles = [theme, baseStyles, css`
    .pickr { display: none !important; }
  `];

  constructor() {
    super();
    this.color = localStorage.getItem('ballColor') || '#ff0000';
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('activate', (e) => {
      fetch('/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [e.detail.mode]: this.color })
      });
    });
  }

  handleChange(e) {
    this.color = e.detail.value;
    localStorage.setItem('ballColor', this.color);
    post('ball', this.color);
  }

  firstUpdated() {
    const picker = this.querySelector('color-picker-wrapper');
    if (picker) picker.value = this.color;
  }

  render() {
    return html`<color-picker-wrapper compact .value=${this.color} @change=${this.handleChange}></color-picker-wrapper>`;
  }
}

customElements.define('ball-controls', BallControls);
