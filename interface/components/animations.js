import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { post } from '../utils.js';
import { theme, baseStyles } from '../theme.js';

class AnimationsList extends LitElement {
  static styles = [theme, baseStyles, css`
    button { position: relative; min-width: 100px; height: 100px; background-size: cover; image-rendering: pixelated; border-radius: 8px; color: transparent; }
    button::after { content: attr(data-name); position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); padding: 4px; font-size: 0.7rem; text-align: center; color: white; border-radius: 0 0 8px 8px; }
    button.selected { outline: 3px solid white; }
  `];

  static properties = {
    images: { type: Object },
    selected: { type: String }
  };

  constructor() {
    super();
    this.images = {};
    this.selected = localStorage.getItem('selectedAnim') || 'fire';
    this.loadImages();
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('activate', () => {
      fetch('/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: this.selected })
      });
    });
  }

  async loadImages() {
    const res = await fetch('/data');
    const data = await res.json();
    this.images = data.images;
  }

  selectAnim(name) {
    this.selected = name;
    localStorage.setItem('selectedAnim', name);
    post('image', name);
  }

  render() {
    return html`
      ${Object.entries(this.images).map(([name, { fps }]) => html`
        <button 
          class="${name === this.selected ? 'selected' : ''}"
          style="background-image: url('/images/animations/${name}_${fps}.png')"
          data-name="${name}"
          @click=${() => this.selectAnim(name)}
        ></button>
      `)}
    `;
  }
}

customElements.define('animations-list', AnimationsList);
