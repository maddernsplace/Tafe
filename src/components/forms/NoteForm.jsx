import React, { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText } from 'lucide-react'
import Modal from '../common/Modal'
import { useApp } from '../../context/AppContext'

const EMPTY = {
  title: '', courseId: '', courseCode: '', assessmentId: '',
  tags: '', content: '',
}

function readAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export default function NoteForm({ open, onClose, onSave, initial, defaultCourseId }) {
  const { activeCourses: courses, assessments } = useApp()
  const [tab, setTab]   = useState('type')
  const [form, setForm] = useState(EMPTY)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    setTab('type')
    if (initial) {
      setForm({ ...EMPTY, ...initial, tags: Array.isArray(initial.tags) ? initial.tags.join(', ') : initial.tags || '' })
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
    setForm(f => ({ ...f, courseId: e.target.value, courseCode: c?.code || '', assessmentId: '' }))
  }

  const courseAssessments = assessments.filter(a => a.courseId === form.courseId)

  const onDrop = useCallback(async accepted => {
    const file = accepted[0]
    if (!file) return
    setImporting(true)
    try {
      let content = ''
      if (file.type === 'text/plain' || file.name.match(/\.(txt|md|csv)$/i)) {
        content = await readAsText(file)
      } else if (file.type === 'application/pdf') {
        // Send to server for extraction
        const dataUrl = await new Promise((res, rej) => {
          const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file)
        })
        const resp = await fetch('/api/ai/extract-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl, name: file.name }),
        })
        const data = await resp.json()
        content = data.text || ''
      } else {
        content = `[Uploaded: ${file.name}]\n\nAdd your notes here.`
      }
      const title = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
      setForm(f => ({ ...f, title: f.title || title, content }))
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
    onSave({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Note' : 'Add Study Note'} size="xl">
      {!initial && (
        <div className="form-tabs">
          <button className={`form-tab ${tab === 'type' ? 'form-tab-active' : ''}`} type="button" onClick={() => setTab('type')}>
            <FileText size={14} /> Type / Paste
          </button>
          <button className={`form-tab ${tab === 'upload' ? 'form-tab-active' : ''}`} type="button" onClick={() => setTab('upload')}>
            <Upload size={14} /> Import from File
          </button>
        </div>
      )}

      {tab === 'upload' && !initial ? (
        <div style={{ padding: '8px 0' }}>
          <p className="settings-desc" style={{ marginBottom: 12 }}>
            Upload a PDF, Word doc, or text file — its content will be imported into the note body so you can edit it.
          </p>
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}>
            <input {...getInputProps()} />
            <div className="dropzone-prompt">
              <Upload size={32} />
              <p>{importing ? 'Importing…' : isDragActive ? 'Drop it here!' : 'Drag & drop or click to browse'}</p>
              <p className="text-muted">PDF, TXT, MD — up to 20 MB</p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Title *</label>
            <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Understanding Learning Differences" required />
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
              <label>Assessment</label>
              <select className="form-input" value={form.assessmentId} onChange={e => set('assessmentId', e.target.value)} disabled={!form.courseId}>
                <option value="">— Optional —</option>
                {courseAssessments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input className="form-input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="e.g. key concepts, revision, important" />
          </div>
          <div className="form-group">
            <label>Content (Markdown supported)</label>
            <textarea className="form-input note-textarea" rows={14} value={form.content}
              onChange={e => set('content', e.target.value)}
              placeholder="Type your notes, or use 'Import from File' to load a PDF or text file…" />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{initial ? 'Save Changes' : 'Save Note'}</button>
          </div>
        </form>
      )}
    </Modal>
  )
}
