import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { theme, baseStyles } from '../theme.js';

class Plasma3DControls extends LitElement {
  static styles = [theme, baseStyles, css`
    #canvas3d { display: block; width: 100%; height: 300px; cursor: grab; touch-action: none; }
    #canvas3d:active { cursor: grabbing; }
    .controls { display: flex; gap: 10px; margin-top: 10px; }
    .values { font-family: monospace; font-size: 12px; margin-top: 5px; }
  `];

  static properties = {
    modA: { type: Number },
    modB: { type: Number },
    modC: { type: Number }
  };

  constructor() {
    super();
    this.modA = 32;
    this.modB = 32;
    this.modC = 32;
    this.rotation = { x: 0, y: 0 };
    this.ws = null;
    this.initialized = false;
  }

  firstUpdated() {
    this.initWebSocket();
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !this.initialized) {
        this.initialized = true;
        this.init3D();
        observer.disconnect();
      }
    });
    observer.observe(this);
  }

  initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.ws = new WebSocket(`${protocol}//${window.location.host}`);
    
    this.ws.onopen = () => {
      this.ws.send('get');
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'plasma-state') {
        this.modA = data.params.modA;
        this.modB = data.params.modB;
        this.modC = data.params.modC;
        this.updateRotationFromParams();
      }
    };
  }

  init3D() {
    const canvas = this.shadowRoot.getElementById('canvas3d');
    if (!canvas) return;
    const width = canvas.parentElement?.clientWidth || 300;
    const height = 300;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    
    const geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x00ff88,
      shininess: 100,
      specular: 0x444444
    });
    const knot = new THREE.Mesh(geometry, material);
    scene.add(knot);
    
    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(5, 5, 5);
    scene.add(light1);
    
    const light2 = new THREE.AmbientLight(0x404040);
    scene.add(light2);
    
    camera.position.z = 5;
    
    this.scene = { scene, camera, renderer, knot };
    
    let isDragging = false;
    let lastX = 0, lastY = 0;
    
    const onStart = (e) => {
      isDragging = true;
      const touch = e.touches ? e.touches[0] : e;
      lastX = touch.clientX;
      lastY = touch.clientY;
    };
    
    const onMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches ? e.touches[0] : e;
      const deltaX = touch.clientX - lastX;
      const deltaY = touch.clientY - lastY;
      
      this.rotation.y += deltaX * 0.01;
      this.rotation.x += deltaY * 0.01;
      
      this.updateParamsFromRotation();
      lastX = touch.clientX;
      lastY = touch.clientY;
    };
    
    const onEnd = () => { isDragging = false; };
    
    canvas.addEventListener('mousedown', onStart);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onEnd);
    canvas.addEventListener('touchstart', onStart);
    canvas.addEventListener('touchmove', onMove);
    canvas.addEventListener('touchend', onEnd);
    
    const animate = () => {
      requestAnimationFrame(animate);
      knot.rotation.x = this.rotation.x;
      knot.rotation.y = this.rotation.y;
      renderer.render(scene, camera);
    };
    animate();
  }

  updateParamsFromRotation() {
    const mapRotation = (angle) => {
      const normalized = ((angle % (Math.PI * 4)) + Math.PI * 4) % (Math.PI * 4);
      if (normalized <= Math.PI * 2) {
        return (normalized / (Math.PI * 2)) * 64;
      } else {
        return ((Math.PI * 4 - normalized) / (Math.PI * 2)) * 64;
      }
    };
    
    const newA = Math.max(0.1, Math.min(64, mapRotation(this.rotation.x)));
    const newB = Math.max(0.1, Math.min(64, mapRotation(this.rotation.y)));
    const newC = Math.max(0.1, Math.min(64, (mapRotation(this.rotation.x) + mapRotation(this.rotation.y)) / 2));
    
    this.modA = newA;
    this.modB = newB;
    this.modC = newC;
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(`${newA.toFixed(1)},${newB.toFixed(1)},${newC.toFixed(1)}`);
    }
  }

  updateRotationFromParams() {
    this.rotation.x = (this.modA / 64) * (Math.PI * 2);
    this.rotation.y = (this.modB / 64) * (Math.PI * 2);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('activate', (e) => {
      fetch('/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [e.detail.mode]: { modA: this.modA, modB: this.modB, modC: this.modC } })
      });
    });
  }

  randomize() {
    this.rotation.x = Math.random() * Math.PI * 2 - Math.PI;
    this.rotation.y = Math.random() * Math.PI * 2 - Math.PI;
    this.updateParamsFromRotation();
  }

  render() {
    return html`
      <canvas id="canvas3d"></canvas>
      <div class="values">
        modA: ${this.modA.toFixed(2)} | modB: ${this.modB.toFixed(2)} | modC: ${this.modC.toFixed(2)}
      </div>
      <div class="controls">
        <button @click=${this.randomize}>Randomize</button>
      </div>
    `;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.ws) this.ws.close();
  }
}

customElements.define('plasma-3d-controls', Plasma3DControls);
