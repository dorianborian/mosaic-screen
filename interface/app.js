import { html, render } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import './components/global-controls.js';
import './components/text-overlay.js';
import './components/tabbed-modes.js';
import './components/animations.js';
import './components/plasma-3d-controls.js';
import './components/ball-controls.js';
import './components/color-controls.js';
import './components/power-controls.js';

const appTemplate = html`
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
`;

render(appTemplate, document.getElementById('app'));
