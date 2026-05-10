// Preload script — runs before the renderer page loads.
// Must be .cjs because Electron always loads preload scripts as CommonJS.
// Exposes a safe flag so the React app knows it's inside Electron.
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('__APP__', {
  isElectron: true,
})
