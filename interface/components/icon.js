import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class Icon extends LitElement {
  static styles = css`
    :host { display: inline-flex; }
    img { width: 16px; height: 16px; filter: invert(1); }
  `;

  static properties = {
    name: { type: String }
  };

  render() {
    return html`<img src="/icons/${this.name}.svg" alt="${this.name}" style="filter: brightness(0) saturate(100%) invert(${this.isDark() ? '100%' : '0%'});">`;
  }

  isDark() {
    const color = getComputedStyle(this).color;
    const rgb = color.match(/\d+/g);
    if (!rgb) return true;
    const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
    return brightness > 128;
  }
}

customElements.define('app-icon', Icon);
