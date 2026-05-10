import React, { useRef, useState, useEffect } from 'react'
import { Download, Upload, Trash2, Sun, Moon, Database, Wifi, Monitor, Smartphone, Info } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useApp } from '../context/AppContext'
import { exportAllData, importAllData } from '../services/storage'
import ConfirmDialog from '../components/common/ConfirmDialog'

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { clearAll, importData, isApiMode } = useApp()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [importMsg, setImportMsg] = useState(null)
  const [networkInfo, setNetworkInfo] = useState(null)
  const fileRef = useRef(null)

  // Fetch network info when in API mode
  useEffect(() => {
    if (isApiMode) {
      fetch('/api/networkinfo')
        .then(r => r.json())
        .then(setNetworkInfo)
        .catch(() => {})
    }
  }, [isApiMode])

  const handleExport = async () => {
    const data = await exportAllData()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tafe-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async ev => {
      try {
        const data = JSON.parse(ev.target.result)
        await importData(data)
        setImportMsg({ type: 'success', text: 'Data imported successfully!' })
      } catch {
        setImportMsg({ type: 'error', text: 'Invalid backup file. Please use a file exported from this app.' })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const storageUsed = (() => {
    if (isApiMode) return null
    try {
      let total = 0
      for (const key in localStorage) {
        if (key.startsWith('tafe_')) total += (localStorage[key] || '').length
      }
      return (total / 1024).toFixed(1)
    } catch { return '?' }
  })()

  const networkUrl = networkInfo
    ? `http://${networkInfo.ip}:${networkInfo.port}`
    : null

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Settings</h2>
      </div>

      <div className="settings-grid">

        {/* Appearance */}
        <div className="settings-card">
          <h3 className="settings-card-title">Appearance</h3>
          <div className="settings-row">
            <div>
              <p className="settings-label">Theme</p>
              <p className="settings-desc">Switch between dark and light mode</p>
            </div>
            <button className="btn btn-primary theme-toggle-btn" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>

        {/* Storage / Mode */}
        <div className="settings-card">
          <h3 className="settings-card-title">Storage</h3>
          <div className="settings-row" style={{ marginBottom: '14px' }}>
            <div>
              <p className="settings-label">
                {isApiMode ? 'Server Mode (Shared)' : 'Browser Mode (Local)'}
              </p>
              <p className="settings-desc">
                {isApiMode
                  ? 'Data is saved to a file on this computer. All devices on your WiFi share the same data.'
                  : 'Data is saved in this browser only (localStorage). Not shared across devices.'}
              </p>
            </div>
            <Database size={22} className={isApiMode ? 'text-success' : 'text-muted'} />
          </div>
          {!isApiMode && storageUsed !== null && (
            <>
              <p className="settings-desc">{storageUsed} KB used (browser ~5 MB limit)</p>
              <div className="storage-bar-wrap">
                <div className="storage-bar" style={{ width: `${Math.min((parseFloat(storageUsed) / 5120) * 100, 100)}%` }} />
              </div>
            </>
          )}
          {isApiMode && (
            <div className="mode-badge-row">
              <span className="badge badge-green">✓ Shared data file active</span>
            </div>
          )}
        </div>

        {/* Network Access — only shown in server/Electron mode */}
        {isApiMode && networkUrl && (
          <div className="settings-card network-card">
            <h3 className="settings-card-title">
              <Wifi size={16} style={{ display: 'inline', marginRight: 8 }} />
              Access From Other Devices
            </h3>
            <p className="settings-desc" style={{ marginBottom: '16px' }}>
              Any device on the same WiFi network can open this app in their browser:
            </p>
            <div className="network-url-box">
              <code className="network-url">{networkUrl}</code>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => navigator.clipboard.writeText(networkUrl)}
              >
                Copy
              </button>
            </div>
            <div className="network-instructions">
              <div className="network-instruction-item">
                <Smartphone size={16} />
                <span><strong>Phone/Tablet:</strong> Connect to the same WiFi, open the URL above in Safari or Chrome</span>
              </div>
              <div className="network-instruction-item">
                <Monitor size={16} />
                <span><strong>Second Computer:</strong> Open the URL above in any browser</span>
              </div>
              <div className="network-instruction-item">
                <Info size={16} />
                <span>All devices share the same data in real time</span>
              </div>
            </div>
          </div>
        )}

        {/* Data Management */}
        <div className="settings-card">
          <h3 className="settings-card-title">Data Management</h3>
          <div className="settings-actions">
            <div className="settings-action-item">
              <div>
                <p className="settings-label">Export Backup</p>
                <p className="settings-desc">Download all your data as a JSON file</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleExport}>
                <Download size={14} /> Export
              </button>
            </div>
            <div className="settings-action-item">
              <div>
                <p className="settings-label">Import Backup</p>
                <p className="settings-desc">Restore from a previously exported file</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>
                <Upload size={14} /> Import
              </button>
              <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
            </div>
            {importMsg && (
              <div className={`import-msg ${importMsg.type}`}>{importMsg.text}</div>
            )}
            <div className="settings-action-item settings-action-danger">
              <div>
                <p className="settings-label">Clear All Data</p>
                <p className="settings-desc">Permanently delete everything — cannot be undone</p>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => setShowClearConfirm(true)}>
                <Trash2 size={14} /> Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Future backend */}
        <div className="settings-card settings-card-future">
          <h3 className="settings-card-title">Future Integrations</h3>
          <div className="future-list">
            <div className="future-item">
              <span className="future-badge">Planned</span>
              <div>
                <p className="settings-label">Supabase Cloud Sync</p>
                <p className="settings-desc">Sync data to the cloud so it works across the internet (not just local WiFi). Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env</p>
              </div>
            </div>
            <div className="future-item">
              <span className="future-badge">Planned</span>
              <div>
                <p className="settings-label">AI Study Assistant</p>
                <p className="settings-desc">Connect OpenAI to search your notes and PDFs. API key goes in a backend/serverless function — never in the frontend code</p>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="settings-card">
          <h3 className="settings-card-title">About</h3>
          <p className="settings-desc">TAFE Study Dashboard v1.0</p>
          <p className="settings-desc" style={{ marginTop: 6 }}>
            Built with React + Vite + Electron. Data stored locally — no account required.
          </p>
          <p className="settings-desc" style={{ marginTop: 6 }}>
            Mode: <strong>{isApiMode ? 'Server (Electron / local network)' : 'Browser (localStorage)'}</strong>
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={clearAll}
        title="Clear All Data"
        message="This will permanently delete ALL courses, assessments, notes, and files. This cannot be undone."
        confirmLabel="Yes, clear everything"
        danger
      />
    </div>
  )
}
