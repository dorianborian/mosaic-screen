import './preset-manager.js';

export function LiveView() {
  const container = document.createElement('div');
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 15;
  canvas.style.cssText = 'width:300px;height:300px;image-rendering:pixelated;border:2px solid #0f0';
  const ctx = canvas.getContext('2d');
  
  const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/peek`);
  ws.binaryType = 'arraybuffer';
  
  ws.onmessage = (e) => {
    const data = new Uint8Array(e.data);
    const imgData = ctx.createImageData(15, 15);
    let pos = 0, i = 0;
    while (i < data.length) {
      const run = data[i++], r = data[i++], g = data[i++], b = data[i++];
      for (let j = 0; j < run; j++) {
        imgData.data[pos++] = r;
        imgData.data[pos++] = g;
        imgData.data[pos++] = b;
        imgData.data[pos++] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  };
  
  const presetMgr = document.createElement('preset-manager');
  presetMgr.addEventListener('preset-saved', () => {
    document.querySelector('shuffle-controls')?.loadPresets();
  });
  
  container.appendChild(canvas);
  container.appendChild(presetMgr);
  return container;
}
