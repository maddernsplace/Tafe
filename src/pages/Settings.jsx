import React, { useRef, useState } from 'react'
import { Download, Upload, Trash2, Sun, Moon, Database, Info } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useApp } from '../context/AppContext'
import { exportAllData, importAllData } from '../services/storage'
import ConfirmDialog from '../components/common/ConfirmDialog'

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { clearAll, importData } = useApp()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [importMsg, setImportMsg] = useState(null)
  const fileRef = useRef(null)

  const handleExport = () => {
    const data = exportAllData()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tafe-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result)
        importData(data)
        setImportMsg({ type: 'success', text: 'Data imported successfully! Refresh the page to see changes.' })
      } catch {
        setImportMsg({ type: 'error', text: 'Invalid JSON file. Please export from this app.' })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const storageUsed = (() => {
    try {
      let total = 0
      for (const key in localStorage) {
        if (key.startsWith('tafe_')) total += (localStorage[key] || '').length
      }
      return (total / 1024).toFixed(1)
    } catch { return '?' }
  })()

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
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>

        {/* Storage info */}
        <div className="settings-card">
          <h3 className="settings-card-title">Storage</h3>
          <div className="settings-row">
            <div>
              <p className="settings-label">Local Storage Used</p>
              <p className="settings-desc">{storageUsed} KB (browser localStorage)</p>
            </div>
            <Database size={24} className="text-muted" />
          </div>
          <div className="storage-bar-wrap">
            <div className="storage-bar" style={{ width: `${Math.min((parseFloat(storageUsed) / 5120) * 100, 100)}%` }} />
          </div>
          <p className="settings-desc" style={{ marginTop: '0.5rem' }}>~5 MB browser limit. Future: Supabase / Firebase storage.</p>
        </div>

        {/* Data management */}
        <div className="settings-card">
          <h3 className="settings-card-title">Data Management</h3>
          <div className="settings-actions">
            <div className="settings-action-item">
              <div>
                <p className="settings-label">Export Data</p>
                <p className="settings-desc">Download all your data as a JSON backup file</p>
              </div>
              <button className="btn btn-primary" onClick={handleExport}>
                <Download size={15} /> Export
              </button>
            </div>
            <div className="settings-action-item">
              <div>
                <p className="settings-label">Import Data</p>
                <p className="settings-desc">Restore from a previously exported JSON file</p>
              </div>
              <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
                <Upload size={15} /> Import
              </button>
              <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
            </div>
            {importMsg && (
              <div className={`import-msg ${importMsg.type}`}>{importMsg.text}</div>
            )}
            <div className="settings-action-item settings-action-danger">
              <div>
                <p className="settings-label">Clear All Data</p>
                <p className="settings-desc">Permanently delete all courses, assessments, notes, and files</p>
              </div>
              <button className="btn btn-danger" onClick={() => setShowClearConfirm(true)}>
                <Trash2 size={15} /> Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Future backend */}
        <div className="settings-card settings-card-future">
          <h3 className="settings-card-title">Future Backend Integration</h3>
          <div className="future-list">
            <div className="future-item">
              <span className="future-badge">Planned</span>
              <div>
                <p className="settings-label">Supabase</p>
                <p className="settings-desc">Store data in a real database. Set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in .env</p>
              </div>
            </div>
            <div className="future-item">
              <span className="future-badge">Planned</span>
              <div>
                <p className="settings-label">File Storage</p>
                <p className="settings-desc">Upload PDFs to Supabase Storage or Firebase Storage</p>
              </div>
            </div>
            <div className="future-item">
              <span className="future-badge">Planned</span>
              <div>
                <p className="settings-label">AI Study Assistant</p>
                <p className="settings-desc">Connect OpenAI API via a serverless backend. Set OPENAI_API_KEY on the server – never in frontend</p>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="settings-card">
          <h3 className="settings-card-title">About</h3>
          <p className="settings-desc">TAFE Study Dashboard v1.0 — built with React + Vite, hosted on GitHub Pages.</p>
          <p className="settings-desc" style={{ marginTop: '0.5rem' }}>Data is stored locally in your browser. No account required.</p>
        </div>
      </div>

      <ConfirmDialog
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={clearAll}
        title="Clear All Data"
        message="This will permanently delete ALL your courses, assessments, notes, and files. This cannot be undone."
        confirmLabel="Yes, clear everything"
        danger
      />
    </div>
  )
}
