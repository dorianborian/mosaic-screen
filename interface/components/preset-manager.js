import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { theme, baseStyles } from '../theme.js';

class PresetManager extends LitElement {
  static styles = [theme, baseStyles, css`
    .controls { display: flex; gap: 10px; margin-top: 10px; align-items: center; }
    input { flex: 1; }
    button { margin: 0; height: 36px; display: flex; align-items: center; gap: 5px; }
  `];

  static properties = {
    editing: { type: Boolean }
  };

  constructor() {
    super();
    this.editing = false;
  }

  startEdit() {
    this.editing = true;
  }

  cancel() {
    this.editing = false;
    this.shadowRoot.querySelector('input').value = '';
  }

  async save() {
    const name = this.shadowRoot.querySelector('input').value.trim();
    if (!name) return alert('Enter a preset name');
    
    const res = await fetch('/matrix');
    const matrix = await res.json();
    
    await fetch('/presets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, matrix })
    });
    
    this.cancel();
    this.dispatchEvent(new CustomEvent('preset-saved', { bubbles: true, composed: true }));
  }

  render() {
    if (!this.editing) {
      return html`
        <button @click=${this.startEdit}>
          <app-icon name="plus"></app-icon> Add Preset
        </button>
      `;
    }
    
    return html`
      <div class="controls">
        <input type="text" placeholder="Preset name" @keyup=${(e) => e.key === 'Enter' && this.save()}>
        <button @click=${this.save}>
          <app-icon name="save"></app-icon>
        </button>
        <button @click=${this.cancel}>
          <app-icon name="x"></app-icon>
        </button>
      </div>
    `;
  }

  updated() {
    if (this.editing) {
      this.shadowRoot.querySelector('input')?.focus();
    }
  }
}

customElements.define('preset-manager', PresetManager);
