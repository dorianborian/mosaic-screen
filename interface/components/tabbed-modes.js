import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { theme, baseStyles } from '../theme.js';

class TabbedModes extends LitElement {
  static styles = [theme, baseStyles, css`
    .tabs { display: flex; gap: 5px; margin-bottom: 10px; flex-wrap: wrap; }
    @media (max-width: 768px) {
      .tabs { justify-content: stretch; }
      .tab { flex: 1 1 auto; min-width: 120px; }
    }
    .tab { padding: 10px 20px; cursor: pointer; background: var(--bg-secondary); border: 1px solid #444; border-radius: 4px 4px 0 0; display: flex; align-items: center; gap: 5px; }
    .tab.active { background: var(--bg-primary); border-bottom-color: var(--bg-primary); border-top: 2px solid #4a9eff; }
    .content { border: 1px solid var(--border); border-radius: 0 4px 4px 4px; padding: 15px; }
  `];

  static properties = {
    activeTab: { type: String }
  };

  constructor() {
    super();
    this.activeTab = 'animation';
  }

  switchTab(tab) {
    this.activeTab = tab;
    this.requestUpdate();
    setTimeout(() => {
      const slot = this.shadowRoot.querySelector(`slot[name="${tab}"]`);
      const el = slot?.assignedElements()[0];
      el?.dispatchEvent(new CustomEvent('activate', { bubbles: true, detail: { mode: tab } }));
    }, 0);
  }

  render() {
    return html`
      <div class="box">
        <h2>Display Mode</h2>
        <div class="tabs">
          <div class="tab ${this.activeTab === 'animation' ? 'active' : ''}" @click=${() => this.switchTab('animation')}>
            <app-icon name="image"></app-icon> Animation
          </div>
          <div class="tab ${this.activeTab === 'plasma' ? 'active' : ''}" @click=${() => this.switchTab('plasma')}>
            <app-icon name="waves"></app-icon> Plasma
          </div>
          <div class="tab ${this.activeTab === 'ball' ? 'active' : ''}" @click=${() => this.switchTab('ball')}>
            <app-icon name="circle"></app-icon> Ball
          </div>
          <div class="tab ${this.activeTab === 'color' ? 'active' : ''}" @click=${() => this.switchTab('color')}>
            <app-icon name="palette"></app-icon> Color
          </div>
          <div class="tab ${this.activeTab === 'shuffle' ? 'active' : ''}" @click=${() => this.switchTab('shuffle')}>
            <app-icon name="layers"></app-icon> Presets
          </div>
        </div>
        <div class="content">
          ${this.activeTab === 'animation' ? html`<slot name="animation"></slot>` : ''}
          ${this.activeTab === 'plasma' ? html`<slot name="plasma"></slot>` : ''}
          ${this.activeTab === 'ball' ? html`<slot name="ball"></slot>` : ''}
          ${this.activeTab === 'color' ? html`<slot name="color"></slot>` : ''}
          ${this.activeTab === 'shuffle' ? html`<slot name="shuffle"></slot>` : ''}
        </div>
      </div>
    `;
  }


}

customElements.define('tabbed-modes', TabbedModes);
