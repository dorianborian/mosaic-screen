import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { theme, baseStyles } from '../theme.js';
import './preset-button.js';

class ShuffleControls extends LitElement {
  static styles = [theme, baseStyles, css`
    :host { display: block; max-width: 100%; }
    @media (min-width: 769px) {
      :host { max-width: 500px; }
    }
    .section { margin-bottom: 20px; padding: 15px; background: var(--bg-secondary); border-radius: 4px; }
    .section h3 { margin: 0 0 10px 0; font-size: 1rem; }
    .preset-scroll { display: flex; gap: 10px; overflow-x: auto; padding: 10px 0; }
    .groups { max-height: 400px; overflow-y: auto; }
    .group { margin-bottom: 15px; padding: 15px; background: var(--bg-primary); border-radius: 4px; border: 1px solid var(--border); }
    .group-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .group-header input { flex: 1; }
    .drop-zone { min-height: 120px; border: 2px dashed #666; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #666; }
    .drop-zone.over { border-color: #0f0; background: rgba(0,255,0,0.1); }
    .group-presets { display: flex; gap: 10px; flex-wrap: wrap; min-height: 100px; }
    .controls { display: flex; gap: 10px; align-items: center; margin-top: 10px; }
    .controls label { margin: 0; }
  `];

  static properties = {
    presets: { type: Array },
    currentHash: { type: String },
    groups: { type: Array },
    draggedPreset: { type: String },
    draggedFrom: { type: String }
  };

  constructor() {
    super();
    this.presets = [];
    this.currentHash = '';
    this.groups = [];
    this.draggedPreset = null;
    this.draggedFrom = null;
    this.loadPresets();
    this.loadGroups();
    this.connectWS();
  }

  async loadPresets() {
    const res = await fetch('/presets');
    this.presets = await res.json();
    console.log('Loaded presets:', this.presets);
  }

  async loadGroups() {
    const res = await fetch('/preset-groups');
    this.groups = await res.json();
  }

  connectWS() {
    const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/state`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.hash) {
        console.log('Received hash:', data.hash, 'Current:', this.currentHash);
        this.currentHash = data.hash;
        this.requestUpdate();
      }
    };
  }

  async loadPreset(hash) {
    await fetch(`/presets/${hash}/load`, { method: 'POST' });
  }

  async deletePreset(hash) {
    const preset = this.presets.find(p => p.hash === hash);
    if (!confirm(`Delete preset "${preset?.name}"?`)) return;
    await fetch(`/presets/${hash}`, { method: 'DELETE' });
    this.loadPresets();
    this.loadGroups();
  }

  addGroup() {
    const id = Date.now().toString();
    this.groups.push({ id, name: 'New Group', presets: [], seconds: 10, randomize: false });
    this.requestUpdate();
  }

  async saveGroup(group) {
    await fetch('/preset-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(group)
    });
  }

  async deleteGroup(id, e) {
    e.stopPropagation();
    if (!confirm('Delete this group?')) return;
    await fetch(`/preset-groups/${id}`, { method: 'DELETE' });
    this.loadGroups();
  }

  updateGroupName(group, e) {
    group.name = e.target.value;
    this.saveGroup(group);
  }

  updateGroupSeconds(group, e) {
    group.seconds = parseInt(e.target.value);
    this.saveGroup(group);
  }

  updateGroupRandomize(group, e) {
    group.randomize = e.target.checked;
    this.saveGroup(group);
  }

  onDragStart(preset, from, e) {
    this.draggedPreset = preset;
    this.draggedFrom = from;
    e.target.classList.add('dragging');
  }

  onDragEnd(e) {
    e.target.classList.remove('dragging');
    this.draggedPreset = null;
    this.draggedFrom = null;
  }

  onDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('over');
  }

  onDragLeave(e) {
    e.currentTarget.classList.remove('over');
  }

  async onDrop(groupId, e) {
    e.preventDefault();
    e.currentTarget.classList.remove('over');
    if (!this.draggedPreset) return;

    const group = this.groups.find(g => g.id === groupId);
    if (!group) return;

    if (this.draggedFrom && this.draggedFrom !== groupId) {
      const fromGroup = this.groups.find(g => g.id === this.draggedFrom);
      if (fromGroup) {
        fromGroup.presets = fromGroup.presets.filter(p => p !== this.draggedPreset);
        await this.saveGroup(fromGroup);
      }
    }

    if (!group.presets.includes(this.draggedPreset)) {
      group.presets.push(this.draggedPreset);
      await this.saveGroup(group);
      this.requestUpdate();
    }
  }

  async removeFromGroup(group, preset) {
    group.presets = group.presets.filter(p => p !== preset);
    await this.saveGroup(group);
    this.requestUpdate();
  }

  async startGroup(group) {
    await fetch('/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shuffle: { groupId: group.id } })
    });
  }



  render() {
    return html`
      <div class="section">
        <h3>Existing Presets</h3>
        <div class="preset-scroll">
          ${this.presets.map(p => html`
            <app-preset
              name=${p.name}
              preview=${p.preview}
              ?current=${p.hash === this.currentHash}
              showMove
              @preset-click=${() => this.loadPreset(p.hash)}
              @preset-delete=${() => this.deletePreset(p.hash)}
              @preset-dragstart=${(e) => this.onDragStart(p.hash, null, e.detail.event)}
              @preset-dragend=${(e) => this.onDragEnd(e.detail.event)}>
            </app-preset>
          `)}
        </div>
      </div>

      <div class="groups">
        ${this.groups.map(g => html`
          <div class="group">
            <div class="group-header">
              <input type="text" .value=${g.name} @input=${(e) => this.updateGroupName(g, e)} placeholder="Group name">
              <button @click=${(e) => this.deleteGroup(g.id, e)}>
                <app-icon name="trash-2"></app-icon>
              </button>
            </div>
            <div class="group-presets"
              @dragover=${this.onDragOver}
              @dragleave=${this.onDragLeave}
              @drop=${(e) => this.onDrop(g.id, e)}>
              ${g.presets.length === 0 ? html`
                <div class="drop-zone">Drop presets here</div>
              ` : g.presets.map(pHash => {
                const preset = this.presets.find(p => p.hash === pHash);
                return preset ? html`
                  <app-preset
                    name=${preset.name}
                    preview=${preset.preview}
                    @preset-click=${() => this.loadPreset(pHash)}
                    @preset-delete=${() => this.removeFromGroup(g, pHash)}
                    @preset-dragstart=${(e) => this.onDragStart(pHash, g.id, e.detail.event)}
                    @preset-dragend=${(e) => this.onDragEnd(e.detail.event)}>
                  </app-preset>
                ` : '';
              })}
            </div>
            <div class="controls">
              <label>
                <app-icon name="clock"></app-icon> ${g.seconds}s
                <input type="range" min="1" max="60" .value=${g.seconds} @input=${(e) => { g.seconds = parseInt(e.target.value); this.requestUpdate(); }} @change=${(e) => this.saveGroup(g)}>
              </label>
              <label>
                <input type="checkbox" ?checked=${g.randomize} @change=${(e) => this.updateGroupRandomize(g, e)}>
                Randomize
              </label>
              <button @click=${() => this.startGroup(g)}>
                <app-icon name="play"></app-icon> Start
              </button>
            </div>
          </div>
        `)}
      </div>

      <button @click=${this.addGroup}>
        <app-icon name="plus"></app-icon> Add Group
      </button>
    `;
  }


}

customElements.define('shuffle-controls', ShuffleControls);
