/**
 * Electron Main Process
 * ─────────────────────
 * Starts an Express HTTP server on port 3737, serves the React app,
 * and handles all data API calls. Data is stored in a JSON file whose
 * location the user can change from Settings → Choose Data Folder.
 *
 * Other devices on the same WiFi connect via http://<local-ip>:3737
 * and share the same data file in real time.
 */

import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import os from 'os'

const require = createRequire(import.meta.url)
const express     = require('express')
const cors        = require('cors')
const { autoUpdater } = require('electron-updater')

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const PORT = 3737
const isDev = !app.isPackaged

// ── Config file (tiny — just stores the chosen data folder path) ──
// Always lives in OS userData so it survives the user moving their data folder.
const CONFIG_FILE = path.join(app.getPath('userData'), 'tafe-config.json')

function readConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) } catch { return {} }
}

function writeConfig(cfg) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf8')
}

// ── Data folder / file / files dir ────────────────────────────
function getFilesDir() {
  const dir = path.join(getDataFolder(), 'tafe-files')
  try { fs.mkdirSync(dir, { recursive: true }) } catch { /* ignore */ }
  return dir
}

function getDataFolder() {
  const cfg = readConfig()
  if (cfg.dataFolder) {
    // Make sure the folder still exists; fall back if not
    try { fs.mkdirSync(cfg.dataFolder, { recursive: true }) } catch { /* ignore */ }
    if (fs.existsSync(cfg.dataFolder)) return cfg.dataFolder
  }
  // Default: next to exe (production) or userData (dev)
  return isDev
    ? app.getPath('userData')
    : path.dirname(app.getPath('exe'))
}

function getDataFile() {
  return path.join(getDataFolder(), 'tafe-data.json')
}

// ── Data helpers ───────────────────────────────────────────────
const EMPTY_DATA = {
  courses:     [],
  assessments: [],
  notes:       [],
  files:       [],
  settings:    { theme: 'dark' },
  streak:      { current: 0, longest: 0, lastVisit: null },
}

function readData() {
  try { return { ...EMPTY_DATA, ...JSON.parse(fs.readFileSync(getDataFile(), 'utf8')) } }
  catch { return { ...EMPTY_DATA } }
}

function writeData(data) {
  fs.writeFileSync(getDataFile(), JSON.stringify(data, null, 2), 'utf8')
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ── Network helpers ────────────────────────────────────────────
function getLocalIP() {
  const nets = os.networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address
    }
  }
  return 'localhost'
}

// ── Express ────────────────────────────────────────────────────
const expressApp = express()
expressApp.use(cors())
expressApp.use(express.json({ limit: '50mb' }))

const DIST_DIR = isDev
  ? path.join(__dirname, '../dist')
  : path.join(app.getAppPath(), 'dist')

expressApp.use(express.static(DIST_DIR))

// ── API ────────────────────────────────────────────────────────
expressApp.get('/api/health', (_req, res) => res.json({ ok: true }))

expressApp.get('/api/networkinfo', (_req, res) => {
  res.json({ ip: getLocalIP(), port: PORT })
})

expressApp.get('/api/datafolder', (_req, res) => {
  res.json({ folder: getDataFolder(), file: getDataFile() })
})

expressApp.get('/api/data',       (_req, res) => res.json(readData()))

expressApp.post('/api/import', (req, res) => {
  const d = readData()
  const i = req.body
  const ensureIds = arr => (arr || []).map(item => item.id ? item : { ...item, id: uid() })
  writeData({
    courses:     ensureIds(i.courses)     ?? d.courses,
    assessments: ensureIds(i.assessments) ?? d.assessments,
    notes:       ensureIds(i.notes)       ?? d.notes,
    files:       ensureIds(i.files)       ?? d.files,
    settings:    i.settings               ?? d.settings,
    streak:      d.streak,
  })
  res.json({ ok: true })
})

expressApp.delete('/api/data', (_req, res) => {
  writeData({ ...EMPTY_DATA })
  res.json({ ok: true })
})

expressApp.get('/api/settings',   (_req, res) => res.json(readData().settings))
expressApp.post('/api/settings',  (req,  res) => {
  const d = readData(); d.settings = { ...d.settings, ...req.body }; writeData(d); res.json(d.settings)
})

expressApp.get('/api/streak',     (_req, res) => res.json(readData().streak))
expressApp.post('/api/streak',    (req,  res) => {
  const d = readData(); d.streak = req.body; writeData(d); res.json(d.streak)
})

// Courses
expressApp.get('/api/courses',    (_req, res) => res.json(readData().courses))
expressApp.post('/api/courses',   (req,  res) => {
  const d = readData()
  d.courses.push({ ...req.body, id: req.body.id || uid(), createdAt: new Date().toISOString() })
  writeData(d); res.json(d.courses)
})
expressApp.put('/api/courses/:id', (req, res) => {
  const d = readData()
  d.courses = d.courses.map(c => c.id === req.params.id ? { ...c, ...req.body } : c)
  writeData(d); res.json(d.courses)
})
expressApp.delete('/api/courses/:id', (req, res) => {
  const d = readData()
  d.courses = d.courses.filter(c => c.id !== req.params.id)
  writeData(d); res.json(d.courses)
})

// Assessments
expressApp.get('/api/assessments',    (_req, res) => res.json(readData().assessments))
expressApp.post('/api/assessments',   (req,  res) => {
  const d = readData()
  d.assessments.push({ ...req.body, id: req.body.id || uid(), createdAt: new Date().toISOString() })
  writeData(d); res.json(d.assessments)
})
expressApp.put('/api/assessments/:id', (req, res) => {
  const d = readData()
  d.assessments = d.assessments.map(a => a.id === req.params.id ? { ...a, ...req.body } : a)
  writeData(d); res.json(d.assessments)
})
expressApp.delete('/api/assessments/:id', (req, res) => {
  const d = readData()
  d.assessments = d.assessments.filter(a => a.id !== req.params.id)
  writeData(d); res.json(d.assessments)
})

// Notes
expressApp.get('/api/notes',    (_req, res) => res.json(readData().notes))
expressApp.post('/api/notes',   (req,  res) => {
  const d = readData()
  const now = new Date().toISOString()
  d.notes.unshift({ ...req.body, id: req.body.id || uid(), createdAt: now, updatedAt: now })
  writeData(d); res.json(d.notes)
})
expressApp.put('/api/notes/:id', (req, res) => {
  const d = readData()
  d.notes = d.notes.map(n => n.id === req.params.id ? { ...n, ...req.body, updatedAt: new Date().toISOString() } : n)
  writeData(d); res.json(d.notes)
})
expressApp.delete('/api/notes/:id', (req, res) => {
  const d = readData()
  d.notes = d.notes.filter(n => n.id !== req.params.id)
  writeData(d); res.json(d.notes)
})

// Files — metadata in JSON, actual bytes in tafe-files/
expressApp.get('/api/files', (_req, res) => res.json(readData().files))

expressApp.post('/api/files', (req, res) => {
  const d = readData()
  const { dataUrl, name, type, size, courseId, courseCode, assessmentId, tags } = req.body
  let storedName = null
  if (dataUrl) {
    const base64 = dataUrl.split(',')[1]
    const ext = (name || 'file').split('.').pop().replace(/[^a-zA-Z0-9]/g, '') || 'bin'
    storedName = `${uid()}.${ext}`
    fs.writeFileSync(path.join(getFilesDir(), storedName), Buffer.from(base64, 'base64'))
  }
  const record = {
    id: uid(), name, type, size, courseId, courseCode, assessmentId, tags,
    uploadDate: new Date().toISOString(),
    storedName,
    fileUrl: storedName ? `/uploads/${storedName}` : null,
  }
  d.files.unshift(record)
  writeData(d); res.json(d.files)
})

expressApp.delete('/api/files/:id', (req, res) => {
  const d = readData()
  const file = d.files.find(f => f.id === req.params.id)
  if (file?.storedName) {
    try { fs.unlinkSync(path.join(getFilesDir(), file.storedName)) } catch { /* already gone */ }
  }
  d.files = d.files.filter(f => f.id !== req.params.id)
  writeData(d); res.json(d.files)
})

// Serve uploaded files dynamically (follows data folder setting)
expressApp.get('/uploads/:filename', (req, res) => {
  const filename = path.basename(req.params.filename)
  const filePath = path.join(getFilesDir(), filename)
  if (!fs.existsSync(filePath)) return res.status(404).send('Not found')
  res.sendFile(filePath)
})

// ── AI (OpenAI) ────────────────────────────────────────────────
function getOpenAIKey() {
  return readConfig().openaiKey || null
}

expressApp.post('/api/ai/key', (req, res) => {
  const { key } = req.body
  writeConfig({ ...readConfig(), openaiKey: key || null })
  res.json({ ok: true })
})

expressApp.get('/api/ai/status', (_req, res) => {
  res.json({ configured: !!getOpenAIKey() })
})

expressApp.post('/api/ai/chat', async (req, res) => {
  const key = getOpenAIKey()
  if (!key) return res.status(401).json({ error: 'OpenAI API key not configured. Add it in Settings.' })

  const { messages, context } = req.body
  if (!messages?.length) return res.status(400).json({ error: 'No messages provided' })

  try {
    const systemParts = [
      'You are a helpful TAFE study assistant for an Australian student.',
      'Be concise, practical, and encouraging.',
      'When referencing study materials provided, cite them specifically.',
    ]

    if (context?.notes?.length) {
      systemParts.push('\n\nStudent\'s study notes:\n' +
        context.notes.map(n => `[${n.courseCode || 'General'} — ${n.title}]\n${n.content}`).join('\n\n'))
    }

    if (context?.assessments?.length) {
      systemParts.push('\n\nStudent\'s assessments:\n' +
        context.assessments.map(a =>
          `[${a.courseCode}] ${a.title} — Due: ${a.dueDate || 'TBD'} — Status: ${a.status}`
        ).join('\n'))
    }

    if (context?.courses?.length) {
      systemParts.push('\n\nStudent\'s enrolled courses:\n' +
        context.courses.map(c => `${c.code}: ${c.name}`).join('\n'))
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemParts.join('\n') },
          ...messages,
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return res.status(response.status).json({ error: err.error?.message || 'OpenAI request failed' })
    }

    const data = await response.json()
    res.json({ reply: data.choices[0].message.content })
  } catch (err) {
    res.status(500).json({ error: 'Failed to reach OpenAI: ' + err.message })
  }
})

// SPA fallback
expressApp.get('*', (_req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')))

// ── IPC: folder picker (called from Settings page) ─────────────
ipcMain.handle('app:getDataFolder', () => ({
  folder: getDataFolder(),
  file:   getDataFile(),
}))

ipcMain.handle('app:chooseDataFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title:       'Choose where to save your TAFE data',
    buttonLabel: 'Save Here',
    properties:  ['openDirectory', 'createDirectory'],
  })
  if (result.canceled || !result.filePaths[0]) return null

  const newFolder = result.filePaths[0]
  const oldFile   = getDataFile()
  const newFile   = path.join(newFolder, 'tafe-data.json')

  // Copy existing data to new location (keeps data intact)
  if (oldFile !== newFile && fs.existsSync(oldFile)) {
    fs.copyFileSync(oldFile, newFile)
  }

  writeConfig({ ...readConfig(), dataFolder: newFolder })
  return { folder: newFolder, file: newFile }
})

ipcMain.handle('app:openDataFolder', () => {
  shell.openPath(getDataFolder())
})

// ── Start server ───────────────────────────────────────────────
let httpServer

function startServer() {
  return new Promise((resolve, reject) => {
    httpServer = expressApp.listen(PORT, '0.0.0.0', () => {
      console.log(`Server → http://localhost:${PORT}`)
      console.log(`Network → http://${getLocalIP()}:${PORT}`)
      console.log(`Data file → ${getDataFile()}`)
      resolve()
    })
    httpServer.on('error', reject)
  })
}

// ── Electron window ────────────────────────────────────────────
let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 380,
    minHeight: 600,
    webPreferences: {
      preload:          path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration:  false,
    },
    title:           'TAFE Study Dashboard',
    show:            false,
    backgroundColor: '#0d0f18',
  })

  mainWindow.loadURL(`http://localhost:${PORT}`)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.setTitle(
      `TAFE Study Dashboard  ·  Network: http://${getLocalIP()}:${PORT}`
    )
    // Check for updates silently — notifies user only when one is ready
    if (!isDev) autoUpdater.checkForUpdatesAndNotify()
  })

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
