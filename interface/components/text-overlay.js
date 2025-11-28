import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { theme, baseStyles } from '../theme.js';
import '../components/icon-loader.js';
import './color-picker-wrapper.js';
import './icon-button.js';

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
    expanded: { type: Boolean },
    x: { type: Number },
    y: { type: Number }
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
    this.x = 0;
    this.y = 0;
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
        invert: this.invert,
        x: this.x,
        y: this.y
      })
    });
  }

  handleJoystick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    this.x = Math.round(Math.max(-7, Math.min(7, x / 10)));
    this.y = Math.round(Math.max(-7, Math.min(7, y / 10)));
    this.send();
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
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 11px; opacity: 0.8; min-width: 100px;">Position (X: ${this.x}, Y: ${this.y})</span>
              <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 8px; position: relative; cursor: crosshair; flex-shrink: 0;" @mousedown=${this.handleJoystick} @mousemove=${(e) => e.buttons && this.handleJoystick(e)}>
                <icon-button icon="rotate-ccw" style="position: absolute; top: 4px; right: 4px;" @click=${(e) => { e.stopPropagation(); this.x = 0; this.y = 0; this.send(); }}></icon-button>
                <div style="position: absolute; top: 50%; left: 50%; width: 2px; height: 2px; background: #666; transform: translate(-50%, -50%);"></div>
                <div style="position: absolute; top: calc(50% + ${this.y * 5}px); left: calc(50% + ${this.x * 5}px); width: 10px; height: 10px; background: #0f0; border-radius: 50%; transform: translate(-50%, -50%);"></div>
              </div>
            </div>
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
