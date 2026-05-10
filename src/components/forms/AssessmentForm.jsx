import React, { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import { useApp } from '../../context/AppContext'

const STATUSES = ['Not Started', 'In Progress', 'Submitted', 'Resubmit Required', 'Completed']

const EMPTY = {
  title: '', courseId: '', courseCode: '', dueDate: '',
  status: 'Not Started', description: '', notes: '',
}

export default function AssessmentForm({ open, onClose, onSave, initial, defaultCourseId }) {
  const { courses } = useApp()
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
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

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave(form)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Assessment' : 'Add Assessment'} size="lg">
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
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code} – {c.name}</option>
              ))}
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
    </Modal>
  )
}
