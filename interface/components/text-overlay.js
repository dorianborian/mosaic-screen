import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { theme, baseStyles } from '../theme.js';
import '../components/icon-loader.js';
import './color-picker-wrapper.js';

class TextOverlay extends LitElement {
  createRenderRoot() {
    return this;
  }

  static properties = {
    enabled: { type: Boolean },
    text: { type: String },
    font: { type: String },
    color: { type: String },
    scroll: { type: Boolean },
    speed: { type: Number },
    bgColor: { type: String },
    useClock: { type: Boolean },
    invert: { type: Boolean },
    expanded: { type: Boolean }
  };

  constructor() {
    super();
    this.enabled = false;
    this.text = '';
    this.font = 'medium';
    this.color = '#000000ff';
    this.scroll = false;
    this.speed = 2;
    this.bgColor = '#000000cc';
    this.useClock = false;
    this.invert = false;
    this.expanded = false;
    this.loadState();
  }

  async loadState() {
    const res = await fetch('/text');
    const state = await res.json();
    Object.assign(this, state);
    this.requestUpdate();
  }

  firstUpdated() {
    const fgPicker = this.querySelectorAll('color-picker-wrapper')[0];
    const bgPicker = this.querySelectorAll('color-picker-wrapper')[1];
    if (fgPicker) fgPicker.value = this.color;
    if (bgPicker) bgPicker.value = this.bgColor;
  }

  send() {
    fetch('/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enabled: this.enabled,
        text: this.text,
        font: this.font,
        color: this.color,
        scroll: this.scroll,
        speed: this.speed,
        bgColor: this.bgColor,
        useClock: this.useClock,
        invert: this.invert
      })
    });
  }

  render() {
    return html`
      <div class="box">
        <h2 style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;" @click=${() => this.expanded = !this.expanded}>
          <span style="display: flex; align-items: center; gap: 8px;">
            <app-icon name="${this.expanded ? 'chevron-down' : 'chevron-right'}"></app-icon>
            <app-icon name="type"></app-icon>
            Text Overlay
          </span>
          <label style="margin: 0;" @click=${(e) => e.stopPropagation()}>
            <input type="checkbox" ?checked=${this.enabled} @change=${e => { this.enabled = e.target.checked; this.send(); }}> Enable
          </label>
        </h2>
        ${this.expanded ? html`<div class="grid">
          <label><input type="checkbox" ?checked=${this.useClock} @change=${e => { this.useClock = e.target.checked; this.send(); }}> Use Clock</label>
          <div></div>
          <div style="grid-column: 1 / -1; display: flex; flex-direction: column; gap: 8px; padding: 10px; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px;">
            <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px; opacity: 0.8;">Text Content</div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input type="text" style="flex: 1;" .value=${this.text} @input=${e => { this.text = e.target.value; this.send(); }} placeholder="Text" ?disabled=${this.useClock}>
              <select style="width: auto; min-width: 100px;" .value=${this.font} @change=${e => { this.font = e.target.value; this.send(); }}>
                <option value="">Small</option>
                <option value="medium">Medium</option>
                <option value="big">Big</option>
              </select>
            </div>
            <label><input type="checkbox" ?checked=${this.scroll} @change=${e => { this.scroll = e.target.checked; this.send(); }} ?disabled=${this.useClock}> Scroll</label>
            <label>Speed: <input type="range" min="1" max="5" .value=${this.speed} @change=${e => { this.speed = parseInt(e.target.value); this.send(); }} ?disabled=${!this.scroll || this.useClock}> ${this.speed}</label>
          </div>
          <label><input type="checkbox" ?checked=${this.invert} @change=${e => { this.invert = e.target.checked; this.send(); }}> Invert</label>
          <div class="full" style="display:flex;gap:20px">
            <div class="picker-group">
              <label>Foreground</label>
              <color-picker-wrapper compact .value=${this.color} @change=${e => { this.color = e.detail.value; this.send(); }}></color-picker-wrapper>
            </div>
            <div class="picker-group">
              <label>Background</label>
              <color-picker-wrapper compact .value=${this.bgColor} @change=${e => { this.bgColor = e.detail.value; this.send(); }}></color-picker-wrapper>
            </div>
          </div>
        </div>` : ''}
      </div>
    `;
  }


}

customElements.define('text-overlay', TextOverlay);
