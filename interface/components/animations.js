import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { post } from '../utils.js';
import { theme, baseStyles } from '../theme.js';

class AnimationsList extends LitElement {
  static styles = [theme, baseStyles, css`
    button { min-width: 100px; height: 100px; font-weight: bold; background-size: cover; image-rendering: pixelated; }
  `];

  static properties = {
    images: { type: Object }
  };

  constructor() {
    super();
    this.images = {};
    this.loadImages();
  }

  async loadImages() {
    const res = await fetch('/data');
    const data = await res.json();
    this.images = data.images;
  }

  render() {
    return html`
      ${Object.entries(this.images).map(([name, { fps }]) => html`
        <button 
          style="background-image: url('/images/animations/${name}_${fps}.png')"
          @click=${() => post('image', name)}
        >${name}</button>
      `)}
    `;
  }
}

customElements.define('animations-list', AnimationsList);
