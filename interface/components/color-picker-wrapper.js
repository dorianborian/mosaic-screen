import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import Pickr from 'https://cdn.jsdelivr.net/npm/@simonwep/pickr@1.9.1/+esm';

class ColorPickerWrapper extends LitElement {
  static styles = css`
    :host { display: block; }
    .pickr { display: none !important; }
  `;

  static properties = {
    value: { type: String },
    compact: { type: Boolean }
  };

  constructor() {
    super();
    this.value = '#ff0000';
    this.compact = false;
  }

  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    this.pickr = Pickr.create({
      el: this.querySelector('.pickr'),
      theme: this.compact ? 'nano' : 'classic',
      default: this.value,
      inline: true,
      showAlways: true,
      useAsButton: false,
      components: {
        preview: false,
        hue: true,
        opacity: true,
        interaction: {
          input: false,
          save: false
        }
      }
    });

    this.pickr.on('change', (color) => {
      this.value = color.toHEXA().toString();
      this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value } }));
    });
  }

  updated(changed) {
    if (changed.has('value') && this.pickr) {
      this.pickr.setColor(this.value);
    }
  }

  render() {
    return html`<div class="pickr"></div>`;
  }
}

customElements.define('color-picker-wrapper', ColorPickerWrapper);
