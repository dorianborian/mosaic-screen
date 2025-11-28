import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class PresetButton extends LitElement {
  static styles = css`
    :host { display: inline-block; position: relative; }
    .preset-btn { position: relative; width: 100px; height: 100px; padding: 0; background-size: cover; image-rendering: pixelated; cursor: pointer; border-radius: 8px; border: none; }
    .preset-btn.current { outline: 3px solid #0f0; }
    .preset-btn.dragging { opacity: 0.5; }
    .preset-name { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); padding: 4px; font-size: 0.7rem; text-align: center; color: white; border-radius: 0 0 7px 7px; }
    .delete-btn { position: absolute; top: 2px; right: 2px; width: 20px; height: 20px; padding: 0; background: rgba(255,0,0,0.8); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; z-index: 10; }
    .delete-btn img { width: 12px; height: 12px; filter: brightness(0) invert(1); }
    .update-btn { position: absolute; top: 2px; right: 26px; width: 20px; height: 20px; padding: 0; background: rgba(0,150,255,0.8); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; z-index: 10; }
    .update-btn img { width: 12px; height: 12px; filter: brightness(0) invert(1); }
    .move-icon { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: rgba(100,150,255,0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .move-icon img { width: 12px; height: 12px; }
  `;

  static properties = {
    name: { type: String },
    preview: { type: String },
    current: { type: Boolean },
    showMove: { type: Boolean }
  };

  constructor() {
    super();
    this.showMove = false;
    this.current = false;
  }

  handleClick(e) {
    if (e.target.closest('.delete-btn') || e.target.closest('.update-btn')) return;
    this.dispatchEvent(new CustomEvent('preset-click', { bubbles: true, composed: true }));
  }

  handleDelete(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('preset-delete', { bubbles: true, composed: true }));
  }

  handleUpdate(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('preset-update', { bubbles: true, composed: true }));
  }

  handleDragStart(e) {
    this.classList.add('dragging');
    this.dispatchEvent(new CustomEvent('preset-dragstart', { bubbles: true, composed: true, detail: { event: e } }));
  }

  handleDragEnd(e) {
    this.classList.remove('dragging');
    this.dispatchEvent(new CustomEvent('preset-dragend', { bubbles: true, composed: true, detail: { event: e } }));
  }

  render() {
    return html`
      <button 
        class="preset-btn ${this.current ? 'current' : ''}"
        style="background-image: url('data:image/png;base64,${this.preview}')"
        draggable="true"
        @click=${this.handleClick}
        @dragstart=${this.handleDragStart}
        @dragend=${this.handleDragEnd}>
        ${this.showMove ? html`<app-icon class="move-icon" name="move"></app-icon>` : ''}
        <span class="preset-name">${this.name}</span>
        <button class="update-btn" @click=${this.handleUpdate}>
          <app-icon name="refresh-cw"></app-icon>
        </button>
        <button class="delete-btn" @click=${this.handleDelete}>
          <app-icon name="trash-2"></app-icon>
        </button>
      </button>
    `;
  }
}

customElements.define('app-preset', PresetButton);
