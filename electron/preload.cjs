// Preload runs before the renderer page. Must be .cjs (Electron requires CommonJS preloads).
// Exposes safe IPC bridges so the React app can talk to the main process.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('__APP__', {
  isElectron: true,

  // Returns { folder, file } — the current data folder and full file path
  getDataFolder: () => ipcRenderer.invoke('app:getDataFolder'),

  // Opens a native folder-picker dialog, copies data to new location, returns { folder, file } or null
  chooseDataFolder: () => ipcRenderer.invoke('app:chooseDataFolder'),

  // Opens the data folder in Windows Explorer / Finder
  openDataFolder: () => ipcRenderer.invoke('app:openDataFolder'),
})
