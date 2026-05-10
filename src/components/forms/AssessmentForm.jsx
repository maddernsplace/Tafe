import React, { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, ClipboardList } from 'lucide-react'
import Modal from '../common/Modal'
import { useApp } from '../../context/AppContext'

const STATUSES = ['Not Started', 'In Progress', 'Submitted', 'Resubmit Required', 'Completed']

const EMPTY = {
  title: '', courseId: '', courseCode: '', dueDate: '',
  status: 'Not Started', description: '', notes: '',
}

export default function AssessmentForm({ open, onClose, onSave, initial, defaultCourseId }) {
  const { activeCourses: courses } = useApp()
  const [tab, setTab]   = useState('type')
  const [form, setForm] = useState(EMPTY)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    setTab('type')
    if (initial) {
      setForm({ ...EMPTY, ...initial })
    } else if (defaultCourseId) {
      const c = courses.find(x => x.id === defaultCourseId)
      setForm({ ...EMPTY, courseId: defaultCourseId, courseCode: c?.code || '' })
    } else {
      setForm(EMPTY)
    }
  }, [initial, open, defaultCourseId])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleCourseChange = e => {
    const c = courses.find(x => x.id === e.target.value)
    setForm(f => ({ ...f, courseId: e.target.value, courseCode: c?.code || '' }))
  }

  const onDrop = useCallback(async accepted => {
    const file = accepted[0]
    if (!file) return
    setImporting(true)
    try {
      let text = ''
      if (file.type === 'text/plain' || file.name.match(/\.(txt|md)$/i)) {
        text = await new Promise((res, rej) => {
          const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsText(file)
        })
      } else if (file.type === 'application/pdf') {
        const dataUrl = await new Promise((res, rej) => {
          const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file)
        })
        const resp = await fetch('/api/ai/extract-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl, name: file.name }),
        })
        const data = await resp.json()
        text = data.text || ''
      }
      const title = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
      setForm(f => ({ ...f, title: f.title || title, description: text.slice(0, 1000) }))
      setTab('type')
    } finally {
      setImporting(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, multiple: false, maxSize: 20 * 1024 * 1024,
  })

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave(form)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Assessment' : 'Add Assessment'} size="lg">
      {!initial && (
        <div className="form-tabs">
          <button className={`form-tab ${tab === 'type' ? 'form-tab-active' : ''}`} type="button" onClick={() => setTab('type')}>
            <ClipboardList size={14} /> Enter Manually
          </button>
          <button className={`form-tab ${tab === 'upload' ? 'form-tab-active' : ''}`} type="button" onClick={() => setTab('upload')}>
            <Upload size={14} /> Import from File
          </button>
        </div>
      )}

      {tab === 'upload' && !initial ? (
        <div style={{ padding: '8px 0' }}>
          <p className="settings-desc" style={{ marginBottom: 12 }}>
            Upload your assessment brief or rubric PDF — the title and description will be pre-filled from the file.
          </p>
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}>
            <input {...getInputProps()} />
            <div className="dropzone-prompt">
              <Upload size={32} />
              <p>{importing ? 'Importing…' : isDragActive ? 'Drop it here!' : 'Drag & drop or click to browse'}</p>
              <p className="text-muted">PDF, TXT — up to 20 MB</p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Assessment Title *</label>
            <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Observation Task" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Course</label>
              <select className="form-input" value={form.courseId} onChange={handleCourseChange}>
                <option value="">— Select course —</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" className="form-input" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Assessment brief…" />
          </div>
          <div className="form-group">
            <label>Personal Notes</label>
            <textarea className="form-input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Your own notes about this assessment…" />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{initial ? 'Save Changes' : 'Add Assessment'}</button>
          </div>
        </form>
      )}
    </Modal>
  )
}
