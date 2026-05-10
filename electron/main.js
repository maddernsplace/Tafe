/**
 * Electron Main Process
 * ─────────────────────
 * Starts an Express HTTP server on port 3737, then opens a BrowserWindow
 * pointing at it. The server serves the built React app AND handles all
 * data API calls (reading/writing a JSON file in the user's app-data folder).
 *
 * OTHER DEVICES (phone, second computer) can access the same server by
 * navigating to http://<this-computer-ip>:3737 on the same WiFi network.
 * All devices share the same data file.
 */

import { app, BrowserWindow, shell } from 'electron'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import os from 'os'

// electron/main.js is ESM (package.json has "type":"module")
// but express/cors are CJS — use createRequire to load them
const require = createRequire(import.meta.url)
const express = require('express')
const cors = require('cors')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = 3737
const isDev = !app.isPackaged

// ── Data Storage ───────────────────────────────────────────────
// Data file sits next to the .exe so the whole folder is self-contained
// and portable — just copy the folder to move everything.
// In dev mode (not packaged) fall back to userData so the project folder
// doesn't get cluttered.
const DATA_FILE = isDev
  ? path.join(app.getPath('userData'), 'tafe-data.json')
  : path.join(path.dirname(app.getPath('exe')), 'tafe-data.json')

const EMPTY_DATA = {
  courses: [],
  assessments: [],
  notes: [],
  files: [],
  settings: { theme: 'dark' },
  streak: { current: 0, longest: 0, lastVisit: null },
}

function readData() {
  try {
    return { ...EMPTY_DATA, ...JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) }
  } catch {
    return { ...EMPTY_DATA }
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ── Network Helpers ────────────────────────────────────────────
function getLocalIP() {
  const nets = os.networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address
    }
  }
  return 'localhost'
}

// ── Express App ────────────────────────────────────────────────
const expressApp = express()
expressApp.use(cors())
expressApp.use(express.json({ limit: '50mb' })) // 50 MB allows large file uploads

// Serve the built Vite frontend
const DIST_DIR = isDev
  ? path.join(__dirname, '../dist')           // dev: relative to electron/
  : path.join(app.getAppPath(), 'dist')       // packaged: inside resources/app/

expressApp.use(express.static(DIST_DIR))

// ── API: health & network ──────────────────────────────────────
expressApp.get('/api/health', (_req, res) => res.json({ ok: true }))

expressApp.get('/api/networkinfo', (_req, res) => {
  res.json({ ip: getLocalIP(), port: PORT })
})

// ── API: all data ──────────────────────────────────────────────
expressApp.get('/api/data', (_req, res) => res.json(readData()))

expressApp.post('/api/import', (req, res) => {
  const d = readData()
  const incoming = req.body
  writeData({
    courses:     incoming.courses     ?? d.courses,
    assessments: incoming.assessments ?? d.assessments,
    notes:       incoming.notes       ?? d.notes,
    files:       incoming.files       ?? d.files,
    settings:    incoming.settings    ?? d.settings,
    streak:      d.streak,
  })
  res.json({ ok: true })
})

expressApp.delete('/api/data', (_req, res) => {
  writeData({ ...EMPTY_DATA })
  res.json({ ok: true })
})

// ── API: settings ──────────────────────────────────────────────
expressApp.get('/api/settings', (_req, res) => res.json(readData().settings))
expressApp.post('/api/settings', (req, res) => {
  const d = readData()
  d.settings = { ...d.settings, ...req.body }
  writeData(d)
  res.json(d.settings)
})

// ── API: streak ────────────────────────────────────────────────
expressApp.get('/api/streak', (_req, res) => res.json(readData().streak))
expressApp.post('/api/streak', (req, res) => {
  const d = readData()
  d.streak = req.body
  writeData(d)
  res.json(d.streak)
})

// ── API: courses ───────────────────────────────────────────────
expressApp.get('/api/courses', (_req, res) => res.json(readData().courses))

expressApp.post('/api/courses', (req, res) => {
  const d = readData()
  const item = { ...req.body, id: req.body.id || uid(), createdAt: new Date().toISOString() }
  d.courses.push(item)
  writeData(d)
  res.json(d.courses)
})

expressApp.put('/api/courses/:id', (req, res) => {
  const d = readData()
  d.courses = d.courses.map(c => c.id === req.params.id ? { ...c, ...req.body } : c)
  writeData(d)
  res.json(d.courses)
})

expressApp.delete('/api/courses/:id', (req, res) => {
  const d = readData()
  d.courses = d.courses.filter(c => c.id !== req.params.id)
  writeData(d)
  res.json(d.courses)
})

// ── API: assessments ───────────────────────────────────────────
expressApp.get('/api/assessments', (_req, res) => res.json(readData().assessments))

expressApp.post('/api/assessments', (req, res) => {
  const d = readData()
  const item = { ...req.body, id: req.body.id || uid(), createdAt: new Date().toISOString() }
  d.assessments.push(item)
  writeData(d)
  res.json(d.assessments)
})

expressApp.put('/api/assessments/:id', (req, res) => {
  const d = readData()
  d.assessments = d.assessments.map(a => a.id === req.params.id ? { ...a, ...req.body } : a)
  writeData(d)
  res.json(d.assessments)
})

expressApp.delete('/api/assessments/:id', (req, res) => {
  const d = readData()
  d.assessments = d.assessments.filter(a => a.id !== req.params.id)
  writeData(d)
  res.json(d.assessments)
})

// ── API: notes ─────────────────────────────────────────────────
expressApp.get('/api/notes', (_req, res) => res.json(readData().notes))

expressApp.post('/api/notes', (req, res) => {
  const d = readData()
  const now = new Date().toISOString()
  const item = { ...req.body, id: req.body.id || uid(), createdAt: now, updatedAt: now }
  d.notes.unshift(item)
  writeData(d)
  res.json(d.notes)
})

expressApp.put('/api/notes/:id', (req, res) => {
  const d = readData()
  d.notes = d.notes.map(n =>
    n.id === req.params.id ? { ...n, ...req.body, updatedAt: new Date().toISOString() } : n
  )
  writeData(d)
  res.json(d.notes)
})

expressApp.delete('/api/notes/:id', (req, res) => {
  const d = readData()
  d.notes = d.notes.filter(n => n.id !== req.params.id)
  writeData(d)
  res.json(d.notes)
})

// ── API: files ─────────────────────────────────────────────────
expressApp.get('/api/files', (_req, res) => res.json(readData().files))

expressApp.post('/api/files', (req, res) => {
  const d = readData()
  const item = { ...req.body, id: req.body.id || uid(), uploadDate: new Date().toISOString() }
  d.files.unshift(item)
  writeData(d)
  res.json(d.files)
})

expressApp.delete('/api/files/:id', (req, res) => {
  const d = readData()
  d.files = d.files.filter(f => f.id !== req.params.id)
  writeData(d)
  res.json(d.files)
})

// SPA fallback — all unmatched routes return index.html
expressApp.get('*', (_req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'))
})

// ── Start Server ───────────────────────────────────────────────
let httpServer

function startServer() {
  return new Promise((resolve, reject) => {
    httpServer = expressApp.listen(PORT, '0.0.0.0', () => {
      console.log(`TAFE Dashboard server → http://localhost:${PORT}`)
      console.log(`Network access        → http://${getLocalIP()}:${PORT}`)
      resolve()
    })
    httpServer.on('error', reject)
  })
}

// ── Electron Window ────────────────────────────────────────────
let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 380,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: 'TAFE Study Dashboard',
    show: false,
    backgroundColor: '#0d0f18',
  })

  mainWindow.loadURL(`http://localhost:${PORT}`)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.setTitle(`TAFE Study Dashboard  ·  Network: http://${getLocalIP()}:${PORT}`)
  })

  // Open external links in the default browser instead of Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(async () => {
  await startServer()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (httpServer) httpServer.close()
  if (process.platform !== 'darwin') app.quit()
})
