import React, { useState, useMemo } from 'react'
import {
  BookOpen, Plus, Pencil, Trash2, CheckCircle2, ChevronRight,
  ArrowLeft, Sparkles, Calendar, Clock,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { matchReflectionToSkills } from '../utils/skillsMatcher'
import ConfirmDialog from '../components/common/ConfirmDialog'

// Format a date string as "Monday 19 May 2025"
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

// Strength label based on match score
function strengthLabel(score) {
  if (score >= 0.5) return { label: 'Strong match', cls: 'match-strong' }
  if (score >= 0.25) return { label: 'Partial match', cls: 'match-partial' }
  return { label: 'Possible match', cls: 'match-possible' }
}

function SkillsMatchPanel({ matchedSkills }) {
  if (!matchedSkills?.length) return (
    <div className="refl-no-match">
      <Sparkles size={20} />
      <p>No skills matched yet. Write more detail about what you did and hit <strong>Re-analyse</strong>.</p>
    </div>
  )

  return (
    <div className="refl-match-list">
      {matchedSkills.map(group => (
        <div key={group.noteId} className="refl-match-group">
          <div className="refl-match-course-badge">{group.courseCode}</div>
          {group.matchedSkills.map((sk, i) => {
            const { label, cls } = strengthLabel(sk.score)
            return (
              <div key={i} className={`refl-skill-row ${cls}`}>
                <CheckCircle2 size={14} className="refl-skill-icon" />
                <div className="refl-skill-body">
                  <p className="refl-skill-text">{sk.text}</p>
                  <span className={`refl-skill-strength`}>{label}</span>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function ReflectionForm({ initial, onSave, onCancel }) {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(initial?.date ?? today)
  const [text, setText] = useState(initial?.text ?? '')

  const handleSubmit = e => {
    e.preventDefault()
    if (!text.trim()) return
    onSave({ date, text: text.trim() })
  }

  return (
    <form className="refl-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Placement date</label>
        <input
          type="date"
          className="form-input"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
      </div>
      <div className="form-group" style={{ flex: 1 }}>
        <label>What did you do today on placement?</label>
        <textarea
          className="form-input refl-textarea"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={
            'Describe what you did today in your own words.\n\n' +
            'For example: "Today I greeted students at the door and helped a student with reading. ' +
            'I reminded them of the classroom safety rules and stayed visible near the teacher at all times..."'
          }
          rows={10}
          required
        />
        <p className="refl-hint">
          The more detail you write, the better the skills matching works. Aim for 3–5 sentences per skill you practised.
        </p>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">
          <Sparkles size={15} /> Save &amp; Analyse Skills
        </button>
      </div>
    </form>
  )
}

function ReflectionDetail({ reflection, onEdit, onDelete, onReanalyse }) {
  const totalSkills = reflection.matchedSkills?.reduce((n, g) => n + g.matchedSkills.length, 0) ?? 0
  const totalCourses = reflection.matchedSkills?.length ?? 0

  return (
    <div className="refl-detail">
      <div className="refl-detail-header">
        <div>
          <h3 className="refl-detail-date">{fmtDate(reflection.date + 'T12:00:00')}</h3>
          {totalSkills > 0 && (
            <p className="refl-detail-sub">
              {totalSkills} skill{totalSkills !== 1 ? 's' : ''} matched across {totalCourses} course{totalCourses !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="refl-detail-actions">
          <button className="icon-btn" title="Edit" onClick={onEdit}><Pencil size={15} /></button>
          <button className="icon-btn text-danger" title="Delete" onClick={onDelete}><Trash2 size={15} /></button>
        </div>
      </div>

      <div className="refl-text-box">
        <p className="refl-text">{reflection.text}</p>
      </div>

      <div className="refl-section-header">
        <Sparkles size={15} />
        <span>Skills matched from your placement skills lists</span>
        <button className="btn btn-ghost btn-xs refl-reanalyse" onClick={onReanalyse}>Re-analyse</button>
      </div>

      <SkillsMatchPanel matchedSkills={reflection.matchedSkills} />
    </div>
  )
}

export default function Reflections() {
  const { notes, reflections, addReflection, updateReflection, deleteReflection } = useApp()

  // All notes tagged as skills-list
  const skillsListNotes = useMemo(
    () => notes.filter(n => n.tags?.includes('skills-list')),
    [notes]
  )

  const sorted = useMemo(
    () => [...reflections].sort((a, b) => b.date.localeCompare(a.date)),
    [reflections]
  )

  const [view, setView] = useState('list') // 'list' | 'new' | 'edit' | 'detail'
  const [selected, setSelected] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const runMatch = text => matchReflectionToSkills(text, skillsListNotes)

  const handleNew = () => { setSelected(null); setView('new') }
  const handleBack = () => setView('list')

  const handleSaveNew = async data => {
    const matched = runMatch(data.text)
    await addReflection({ ...data, matchedSkills: matched })
    setView('list')
  }

  const handleSaveEdit = async data => {
    const matched = runMatch(data.text)
    await updateReflection(selected.id, { ...data, matchedSkills: matched })
    // Refresh selected from updated list
    setSelected(prev => ({ ...prev, ...data, matchedSkills: matched }))
    setView('detail')
  }

  const handleReanalyse = async () => {
    const matched = runMatch(selected.text)
    await updateReflection(selected.id, { matchedSkills: matched })
    setSelected(prev => ({ ...prev, matchedSkills: matched }))
  }

  const handleSelectCard = r => { setSelected(r); setView('detail') }
  const handleEdit = () => setView('edit')
  const handleDeleteConfirm = async () => {
    await deleteReflection(deleting.id)
    setDeleting(null)
    setView('list')
    setSelected(null)
  }

  // ── Mobile: show list or detail ────────────────────────────────
  const showList = view === 'list' || !['new','edit','detail'].includes(view)
  const showDetail = view === 'new' || view === 'edit' || view === 'detail'

  return (
    <div className="page refl-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Placement Reflections</h2>
          <p className="page-sub">
            Write what you did each Monday · your reflections are matched to your skills lists
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleNew}>
          <Plus size={16} /> New Reflection
        </button>
      </div>

      <div className="refl-layout">
        {/* Left: list */}
        <aside className={`refl-list-panel ${showDetail ? 'refl-list-hidden-mobile' : ''}`}>
          {sorted.length === 0 ? (
            <div className="empty-state" style={{ padding: '48px 24px' }}>
              <BookOpen size={40} />
              <h3>No reflections yet</h3>
              <p>Tap <strong>New Reflection</strong> after your Monday placement to get started.</p>
            </div>
          ) : (
            sorted.map(r => {
              const total = r.matchedSkills?.reduce((n, g) => n + g.matchedSkills.length, 0) ?? 0
              const isActive = selected?.id === r.id && showDetail
              return (
                <button
                  key={r.id}
                  className={`refl-card ${isActive ? 'refl-card-active' : ''}`}
                  onClick={() => handleSelectCard(r)}
                >
                  <div className="refl-card-top">
                    <Calendar size={13} className="refl-card-icon" />
                    <span className="refl-card-date">{fmtDate(r.date + 'T12:00:00')}</span>
                    <ChevronRight size={14} className="refl-card-chevron" />
                  </div>
                  <p className="refl-card-preview">
                    {r.text.length > 110 ? r.text.slice(0, 110) + '…' : r.text}
                  </p>
                  {total > 0 && (
                    <div className="refl-card-badges">
                      <span className="badge badge-green">
                        <CheckCircle2 size={10} /> {total} skill{total !== 1 ? 's' : ''} matched
                      </span>
                      {r.matchedSkills.map(g => (
                        <span key={g.noteId} className="badge badge-neutral">{g.courseCode}</span>
                      ))}
                    </div>
                  )}
                </button>
              )
            })
          )}
        </aside>

        {/* Right: detail / form */}
        <main className={`refl-detail-panel ${!showDetail ? 'refl-detail-hidden-mobile' : ''}`}>
          {/* Mobile back button */}
          <button className="refl-back-btn" onClick={handleBack}>
            <ArrowLeft size={15} /> All Reflections
          </button>

          {view === 'new' && (
            <>
              <h3 className="refl-panel-title">New Reflection</h3>
              <ReflectionForm onSave={handleSaveNew} onCancel={handleBack} />
            </>
          )}

          {view === 'edit' && selected && (
            <>
              <h3 className="refl-panel-title">Edit Reflection</h3>
              <ReflectionForm
                initial={selected}
                onSave={handleSaveEdit}
                onCancel={() => setView('detail')}
              />
            </>
          )}

          {view === 'detail' && selected && (
            <ReflectionDetail
              reflection={selected}
              onEdit={handleEdit}
              onDelete={() => setDeleting(selected)}
              onReanalyse={handleReanalyse}
            />
          )}

          {!showDetail && (
            <div className="refl-empty-detail">
              <Clock size={40} />
              <p>Select a reflection from the list, or write a new one after your Monday placement.</p>
            </div>
          )}
        </main>
      </div>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Reflection"
        message={`Delete your reflection for ${deleting ? fmtDate(deleting.date + 'T12:00:00') : ''}? This cannot be undone.`}
      />
    </div>
  )
}
