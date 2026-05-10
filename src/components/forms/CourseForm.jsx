import React, { useState, useEffect } from 'react'
import Modal from '../common/Modal'

const COLOURS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

const EMPTY = {
  code: '', name: '', description: '', status: 'active',
  startDate: '', endDate: '', colour: '#6366f1',
}

export default function CourseForm({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    setForm(initial ? { ...EMPTY, ...initial } : EMPTY)
  }, [initial, open])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.code.trim() || !form.name.trim()) return
    onSave(form)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Course' : 'Add Course'}>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label>Course Code *</label>
            <input className="form-input" value={form.code} onChange={e => set('code', e.target.value)} placeholder="e.g. CHCEDS049" required />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Course Name *</label>
          <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full course title" required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea className="form-input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief course overview…" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            <input type="date" className="form-input" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input type="date" className="form-input" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label>Card Colour</label>
          <div className="colour-picker">
            {COLOURS.map(c => (
              <button
                key={c}
                type="button"
                className={`colour-dot ${form.colour === c ? 'colour-dot-active' : ''}`}
                style={{ background: c }}
                onClick={() => set('colour', c)}
                aria-label={c}
              />
            ))}
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">{initial ? 'Save Changes' : 'Add Course'}</button>
        </div>
      </form>
    </Modal>
  )
}
