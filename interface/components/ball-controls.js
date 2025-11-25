import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import './color-picker-wrapper.js';
import { post } from '../utils.js';
import { theme, baseStyles } from '../theme.js';

class BallControls extends LitElement {
  static styles = [theme, baseStyles, css`
    .pickr { display: none !important; }
  `];

  createRenderRoot() {
    return this;
  }

  handleChange(e) {
    post('ball', e.detail.value);
  }

  render() {
    return html`<color-picker-wrapper @change=${this.handleChange}></color-picker-wrapper>`;
  }
}

customElements.define('ball-controls', BallControls);
