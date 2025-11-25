import { html, render } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import './components/global-controls.js';
import './components/text-overlay.js';
import './components/tabbed-modes.js';
import './components/animations.js';
import './components/plasma-3d-controls.js';
import './components/ball-controls.js';
import './components/color-controls.js';
import './components/power-controls.js';
import { LiveView } from './components/live-view.js';

const appTemplate = html`
  <style>
    #container { display: flex; gap: 20px; }
    #main { flex: 1; }
    #live { position: sticky; top: 20px; align-self: flex-start; }
    @media (max-width: 768px) {
      #container { flex-direction: column; }
      #live { position: fixed; bottom: 10px; right: 10px; z-index: 1000; }
      #live canvas { width: 120px !important; height: 120px !important; border-width: 1px !important; }
    }
  </style>
  <div id="container">
    <div id="main">
      <h1>Dorian's Mosaic Controller</h1>
      <global-controls></global-controls>
      <text-overlay></text-overlay>
      <tabbed-modes>
        <animations-list slot="animation"></animations-list>
        <plasma-3d-controls slot="plasma"></plasma-3d-controls>
        <ball-controls slot="ball"></ball-controls>
        <color-controls slot="color"></color-controls>
      </tabbed-modes>
      <power-controls></power-controls>
    </div>
    <div id="live"></div>
  </div>
`;

render(appTemplate, document.getElementById('app'));
document.getElementById('live').appendChild(LiveView());
