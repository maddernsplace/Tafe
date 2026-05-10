import React, { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import { useApp } from '../../context/AppContext'

const EMPTY = {
  title: '', courseId: '', courseCode: '', assessmentId: '',
  tags: '', content: '',
}

export default function NoteForm({ open, onClose, onSave, initial, defaultCourseId }) {
  const { courses, assessments } = useApp()
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
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

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Note' : 'Add Study Note'} size="xl">
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
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code} – {c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Assessment</label>
            <select className="form-input" value={form.assessmentId} onChange={e => set('assessmentId', e.target.value)} disabled={!form.courseId}>
              <option value="">— Optional —</option>
              {courseAssessments.map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Tags (comma separated)</label>
          <input className="form-input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="e.g. key concepts, revision, important" />
        </div>
        <div className="form-group">
          <label>Content (Markdown supported)</label>
          <textarea
            className="form-input note-textarea"
            rows={14}
            value={form.content}
            onChange={e => set('content', e.target.value)}
            placeholder="Paste your ChatGPT or Claude study answer here… Markdown is supported."
          />
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">{initial ? 'Save Changes' : 'Save Note'}</button>
        </div>
      </form>
    </Modal>
  )
}
