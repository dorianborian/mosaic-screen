import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class IconButton extends LitElement {
  static styles = css`
    :host { display: inline-block; }
    button {
      width: 20px;
      height: 20px;
      min-width: 20px;
      padding: 0;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    ::slotted(app-icon) { width: 11px; height: 11px; }
  `;

  static properties = {
    icon: { type: String },
    color: { type: String }
  };

  constructor() {
    super();
    this.color = 'rgba(255,255,255,0.3)';
  }

  render() {
    return html`
      <button style="background: ${this.color}">
        <slot><app-icon name="${this.icon}"></app-icon></slot>
      </button>
    `;
  }
}

customElements.define('icon-button', IconButton);
