import { html, render } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import './components/global-controls.js';
import './components/text-overlay.js';
import './components/plasma-controls.js';
import './components/animations.js';


import './components/ball-controls.js';
import './components/color-controls.js';
import './components/power-controls.js';

const appTemplate = html`
  <h1>Dorian's Mosaic Controller</h1>
  <global-controls></global-controls>
  <text-overlay></text-overlay>
  <plasma-controls></plasma-controls>
  <animations-list></animations-list>


  <ball-controls></ball-controls>
  <color-controls></color-controls>
  <power-controls></power-controls>
`;

render(appTemplate, document.getElementById('app'));
