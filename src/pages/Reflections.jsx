import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  BookOpen, Plus, Pencil, Trash2, CheckCircle2, ChevronRight,
  ArrowLeft, Sparkles, Calendar, X, NotebookPen, Send, Clock, Printer,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useViewport } from '../hooks/useViewport'
import { matchReflectionToSkills, parseSkillsFromNote } from '../utils/skillsMatcher'
import { getDayNotes, addDayNote, deleteDayNote } from '../services/storage'
import ConfirmDialog from '../components/common/ConfirmDialog'

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function strengthLabel(score) {
  if (score >= 0.5) return { label: 'Strong match', cls: 'match-strong' }
  if (score >= 0.25) return { label: 'Partial match', cls: 'match-partial' }
  return { label: 'Possible match', cls: 'match-possible' }
}

function DayNotesPanel({ date }) {
  const today = new Date().toISOString().slice(0, 10)
  const [notes, setNotes] = useState([])
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const data = await getDayNotes(date)
    setNotes(data)
  }, [date])

  useEffect(() => { load() }, [load])

  const handleAdd = async () => {
    if (!text.trim()) return
    setSaving(true)
    await addDayNote(date, text.trim())
    setText('')
    await load()
    setSaving(false)
  }

  const handleDelete = async id => {
    await deleteDayNote(id)
    await load()
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd() }
  }

  return (
    <div className="dn-panel">
      <div className="dn-header">
        <NotebookPen size={14} className="dn-icon" />
        <span className="dn-title">Day Notes — {date === today ? 'Today' : fmtDate(date + 'T12:00:00')}</span>
      </div>
      <div className="dn-input-row">
        <textarea
          className="dn-input"
          rows={2}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Jot something down… (Enter to save)"
        />
        <button className="btn btn-primary dn-add-btn" onClick={handleAdd} disabled={!text.trim() || saving}>
          <Send size={14} />
        </button>
      </div>
      {notes.length === 0 ? (
        <p className="dn-empty">No notes yet for this day. Jot things down as they happen.</p>
      ) : (
        <div className="dn-list">
          {notes.map(n => (
            <div key={n.id} className="dn-entry">
              <div className="dn-entry-top">
                <Clock size={11} className="dn-time-icon" />
                <span className="dn-time">{n.time}</span>
                <button className="icon-btn dn-del" onClick={() => handleDelete(n.id)}><X size={12} /></button>
              </div>
              <p className="dn-text">{n.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SkillsMatchPanel({ matchedSkills }) {
  if (!matchedSkills?.length) return (
    <div className="refl-no-match">
      <Sparkles size={20} />
      <p>No skills matched yet. Fill in the reflection fields and hit <strong>Save &amp; Analyse Skills</strong>.</p>
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
                  <span className="refl-skill-strength">{label}</span>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

const EMPTY = {
  studentName: '', date: '', unitCode: '', unitName: '',
  skill1: '', skill2: '', skill3: '',
  reflection1: '', reflection2: '', reflection3: '',
  wentWell: '', futureChange: '', notes: '',
}

function ReflectionForm({ initial, onSave, onCancel }) {
  const { courses, notes } = useApp()
  const today = new Date().toISOString().slice(0, 10)
  const [f, setF] = useState({ ...EMPTY, date: today, ...(initial ?? {}) })

  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }))
  const field = (k, rows = 3) => (
    <textarea className="tpl-textarea" rows={rows} value={f[k]} onChange={e => set(k, e.target.value)} />
  )

  // Skills for the selected course (from skills-list notes)
  const courseSkills = useMemo(() => {
    if (!f.unitCode) return []
    const skillNotes = notes.filter(n =>
      n.tags?.includes('skills-list') && n.courseCode === f.unitCode
    )
    return skillNotes.flatMap(n => parseSkillsFromNote(n))
  }, [notes, f.unitCode])

  const handleCourseChange = e => {
    const code = e.target.value
    const course = courses.find(c => c.code === code)
    setF(prev => ({
      ...prev,
      unitCode: code,
      unitName: course?.name ?? '',
      skill1: '', skill2: '', skill3: '',
    }))
  }

  const SkillSelect = ({ fieldKey }) => (
    <div className="tpl-skill-select-wrap">
      {courseSkills.length > 0 ? (
        <select
          className="tpl-select"
          value={f[fieldKey]}
          onChange={e => set(fieldKey, e.target.value)}
        >
          <option value="">— Select a skill —</option>
          {courseSkills.map((s, i) => (
            <option key={i} value={s}>{s}</option>
          ))}
          <option value="__custom__">Type my own…</option>
        </select>
      ) : null}
      {(f[fieldKey] === '__custom__' || !courseSkills.length) && (
        <textarea
          className="tpl-textarea"
          rows={2}
          placeholder={courseSkills.length ? 'Type your skill here…' : 'Add a Skills List note for this course to enable dropdown'}
          value={f[fieldKey] === '__custom__' ? '' : f[fieldKey]}
          onChange={e => set(fieldKey, e.target.value)}
        />
      )}
    </div>
  )

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(f) }}>
      <div className="tpl-wrapper">
        <div className="tpl-title">SLILLS AND REFLECTION TEMPLATE</div>
        <div className="tpl-subtitle">Make a copy of this template to complete for each day you are on placement</div>

        <table className="tpl-table">
          <tbody>
            <tr>
              <td className="tpl-cell tpl-cell-half tpl-label-cell">
                <span className="tpl-label">TAFE SA Student name:</span>
                <input className="tpl-input" value={f.studentName} onChange={e => set('studentName', e.target.value)} />
              </td>
              <td className="tpl-cell tpl-cell-half tpl-label-cell tpl-border-left">
                <span className="tpl-label">Date:</span>
                <input type="date" className="tpl-input" value={f.date} onChange={e => set('date', e.target.value)} required />
              </td>
            </tr>
            <tr>
              <td className="tpl-cell" colSpan={2}>
                <div className="tpl-label">Select course:</div>
                <select className="tpl-select" value={f.unitCode} onChange={handleCourseChange}>
                  <option value="">— Choose a course —</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.code}>{c.code} — {c.name}</option>
                  ))}
                </select>
                <div className="tpl-unit-display">
                  <span className="tpl-label" style={{ marginTop: 8 }}>Unit code:</span>
                  <span className="tpl-read-value">{f.unitCode || '—'}</span>
                  <span className="tpl-label" style={{ marginTop: 4 }}>Unit name:</span>
                  <span className="tpl-read-value">{f.unitName || '—'}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td className="tpl-cell tpl-section-header" colSpan={2}>SKILLS</td>
            </tr>
            <tr>
              <td className="tpl-cell" colSpan={2}>
                <div className="tpl-instruction"><strong>Select 2 or 3 skills from the Skills List for the unit to work towards:</strong></div>
                <div className="tpl-numbered-row"><span className="tpl-num">1.</span><SkillSelect fieldKey="skill1" /></div>
                <div className="tpl-numbered-row"><span className="tpl-num">2.</span><SkillSelect fieldKey="skill2" /></div>
                <div className="tpl-numbered-row"><span className="tpl-num">3.</span><SkillSelect fieldKey="skill3" /></div>
              </td>
            </tr>
            <tr>
              <td className="tpl-cell tpl-section-header" colSpan={2}>REFLECTION</td>
            </tr>
            <tr>
              <td className="tpl-cell" colSpan={2}>
                <div className="tpl-instruction"><strong>For each skill, provide one (1) example of what you did:</strong></div>
                <div className="tpl-numbered-row"><span className="tpl-num">1.</span>{field('reflection1', 3)}</div>
                <div className="tpl-numbered-row"><span className="tpl-num">2.</span>{field('reflection2', 3)}</div>
                <div className="tpl-numbered-row"><span className="tpl-num">3.</span>{field('reflection3', 3)}</div>
              </td>
            </tr>
            <tr>
              <td className="tpl-cell" colSpan={2}>
                <div className="tpl-instruction"><strong>For one (1) of the skills, give one (1) example of what went well. Try and give an example for each of the different skills over the placement.</strong></div>
                {field('wentWell', 5)}
              </td>
            </tr>
            <tr>
              <td className="tpl-cell" colSpan={2}>
                <div className="tpl-instruction"><strong>For one (1) of the skills, give one (1) example of what you could change for future practice.</strong></div>
                {field('futureChange', 5)}
              </td>
            </tr>
            <tr>
              <td className="tpl-cell" colSpan={2}>
                <div className="tpl-notes-label">Notes:</div>
                {field('notes', 5)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="form-actions" style={{ marginTop: 16 }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">
          <Sparkles size={15} /> Save &amp; Analyse Skills
        </button>
      </div>
    </form>
  )
}

function ReflectionDetail({ reflection: r, onEdit, onDelete, onReanalyse }) {
  const totalSkills = r.matchedSkills?.reduce((n, g) => n + g.matchedSkills.length, 0) ?? 0

  const handlePrint = () => {
    const rows = [
      `<tr>
        <td class="tpl-cell tpl-cell-half"><span class="tpl-label">TAFE SA Student name:</span><div class="tpl-read-value">${r.studentName || '—'}</div></td>
        <td class="tpl-cell tpl-cell-half tpl-border-left"><span class="tpl-label">Date:</span><div class="tpl-read-value">${r.date ? fmtDate(r.date + 'T12:00:00') : '—'}</div></td>
      </tr>`,
      `<tr><td class="tpl-cell" colspan="2">
        <span class="tpl-label">Unit code:</span><div class="tpl-read-value">${r.unitCode || '—'}</div>
        <span class="tpl-label" style="margin-top:6px;display:block">Unit name:</span><div class="tpl-read-value">${r.unitName || '—'}</div>
      </td></tr>`,
      `<tr><td class="tpl-cell tpl-section-header" colspan="2">SKILLS</td></tr>`,
      `<tr><td class="tpl-cell" colspan="2">
        <div class="tpl-instruction"><strong>Select 2 or 3 skills from the Skills List for the unit to work towards:</strong></div>
        ${r.skill1 ? `<div class="tpl-read-numbered"><span class="tpl-num">1.</span><span>${r.skill1}</span></div>` : ''}
        ${r.skill2 ? `<div class="tpl-read-numbered"><span class="tpl-num">2.</span><span>${r.skill2}</span></div>` : ''}
        ${r.skill3 ? `<div class="tpl-read-numbered"><span class="tpl-num">3.</span><span>${r.skill3}</span></div>` : ''}
      </td></tr>`,
      `<tr><td class="tpl-cell tpl-section-header" colspan="2">REFLECTION</td></tr>`,
      `<tr><td class="tpl-cell" colspan="2">
        <div class="tpl-instruction"><strong>For each skill, provide one (1) example of what you did:</strong></div>
        ${r.reflection1 ? `<div class="tpl-read-numbered"><span class="tpl-num">1.</span><span>${r.reflection1}</span></div>` : ''}
        ${r.reflection2 ? `<div class="tpl-read-numbered"><span class="tpl-num">2.</span><span>${r.reflection2}</span></div>` : ''}
        ${r.reflection3 ? `<div class="tpl-read-numbered"><span class="tpl-num">3.</span><span>${r.reflection3}</span></div>` : ''}
      </td></tr>`,
      r.wentWell ? `<tr><td class="tpl-cell" colspan="2">
        <div class="tpl-instruction"><strong>For one (1) of the skills, give one (1) example of what went well. Try and give an example for each of the different skills over the placement.</strong></div>
        <div class="tpl-read-value">${r.wentWell}</div>
      </td></tr>` : '',
      r.futureChange ? `<tr><td class="tpl-cell" colspan="2">
        <div class="tpl-instruction"><strong>For one (1) of the skills, give one (1) example of what you could change for future practice.</strong></div>
        <div class="tpl-read-value">${r.futureChange}</div>
      </td></tr>` : '',
      r.notes ? `<tr><td class="tpl-cell" colspan="2">
        <div class="tpl-notes-label">Notes:</div>
        <div class="tpl-read-value">${r.notes}</div>
      </td></tr>` : '',
    ].join('')

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Reflection — ${r.date || ''}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12pt; margin: 20mm; color: #000; }
        .tpl-title { font-size: 13pt; font-weight: bold; text-align: center; padding: 10px 0 8px; border-bottom: 2px solid #000; margin-bottom: 0; }
        table { width: 100%; border-collapse: collapse; }
        .tpl-cell { border: 1px solid #555; padding: 8px 10px; vertical-align: top; }
        .tpl-cell-half { width: 50%; }
        .tpl-border-left { border-left: 1px solid #555; }
        .tpl-section-header { background: #e8e8e8; font-weight: bold; font-size: 11pt; letter-spacing: 0.05em; text-align: center; padding: 6px 10px; }
        .tpl-label { font-size: 9pt; font-weight: bold; color: #444; text-transform: uppercase; display: block; margin-bottom: 3px; }
        .tpl-read-value { font-size: 11pt; min-height: 18px; }
        .tpl-instruction { font-size: 9.5pt; color: #333; margin-bottom: 6px; }
        .tpl-read-numbered { display: flex; gap: 6px; margin: 4px 0; font-size: 11pt; }
        .tpl-num { font-weight: bold; min-width: 18px; }
        .tpl-notes-label { font-size: 9pt; font-weight: bold; color: #444; text-transform: uppercase; margin-bottom: 3px; }
        @page { size: A4; margin: 20mm; }
      </style>
    </head><body>
      <div class="tpl-title">SKILLS AND REFLECTION TEMPLATE</div>
      <table><tbody>${rows}</tbody></table>
    </body></html>`

    const win = window.open('', '_blank', 'width=800,height=900')
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print() }, 400)
  }

  return (
    <div className="refl-detail">
      <div className="refl-detail-header">
        <div>
          <h3 className="refl-detail-date">{fmtDate((r.date || r.createdAt?.slice(0,10)) + 'T12:00:00')}</h3>
          {r.unitCode && <p className="refl-detail-sub">{r.unitCode}{r.unitName ? ` — ${r.unitName}` : ''}</p>}
          {totalSkills > 0 && <p className="refl-detail-sub">{totalSkills} skill{totalSkills !== 1 ? 's' : ''} matched</p>}
        </div>
        <div className="refl-detail-actions">
          <button className="icon-btn" title="Print / Save as PDF" onClick={handlePrint}><Printer size={15} /></button>
          <button className="icon-btn" title="Edit" onClick={onEdit}><Pencil size={15} /></button>
          <button className="icon-btn text-danger" title="Delete" onClick={onDelete}><Trash2 size={15} /></button>
        </div>
      </div>

      <div className="tpl-wrapper">
        <div className="tpl-title">SLILLS AND REFLECTION TEMPLATE</div>
        <table className="tpl-table">
          <tbody>
            <tr>
              <td className="tpl-cell tpl-cell-half">
                <span className="tpl-label">TAFE SA Student name:</span>
                <div className="tpl-read-value">{r.studentName || '—'}</div>
              </td>
              <td className="tpl-cell tpl-cell-half tpl-border-left">
                <span className="tpl-label">Date:</span>
                <div className="tpl-read-value">{r.date ? fmtDate(r.date + 'T12:00:00') : '—'}</div>
              </td>
            </tr>
            <tr>
              <td className="tpl-cell" colSpan={2}>
                <span className="tpl-label">Unit code:</span>
                <div className="tpl-read-value">{r.unitCode || '—'}</div>
                <span className="tpl-label" style={{ marginTop: 6, display: 'block' }}>Unit name:</span>
                <div className="tpl-read-value">{r.unitName || '—'}</div>
              </td>
            </tr>
            <tr><td className="tpl-cell tpl-section-header" colSpan={2}>SKILLS</td></tr>
            <tr>
              <td className="tpl-cell" colSpan={2}>
                <div className="tpl-instruction"><strong>Select 2 or 3 skills from the Skills List for the unit to work towards:</strong></div>
                {r.skill1 && <div className="tpl-read-numbered"><span className="tpl-num">1.</span><span>{r.skill1}</span></div>}
                {r.skill2 && <div className="tpl-read-numbered"><span className="tpl-num">2.</span><span>{r.skill2}</span></div>}
                {r.skill3 && <div className="tpl-read-numbered"><span className="tpl-num">3.</span><span>{r.skill3}</span></div>}
              </td>
            </tr>
            <tr><td className="tpl-cell tpl-section-header" colSpan={2}>REFLECTION</td></tr>
            <tr>
              <td className="tpl-cell" colSpan={2}>
                <div className="tpl-instruction"><strong>For each skill, provide one (1) example of what you did:</strong></div>
                {r.reflection1 && <div className="tpl-read-numbered"><span className="tpl-num">1.</span><span>{r.reflection1}</span></div>}
                {r.reflection2 && <div className="tpl-read-numbered"><span className="tpl-num">2.</span><span>{r.reflection2}</span></div>}
                {r.reflection3 && <div className="tpl-read-numbered"><span className="tpl-num">3.</span><span>{r.reflection3}</span></div>}
              </td>
            </tr>
            {r.wentWell && (
              <tr>
                <td className="tpl-cell" colSpan={2}>
                  <div className="tpl-instruction"><strong>For one (1) of the skills, give one (1) example of what went well. Try and give an example for each of the different skills over the placement.</strong></div>
                  <div className="tpl-read-value">{r.wentWell}</div>
                </td>
              </tr>
            )}
            {r.futureChange && (
              <tr>
                <td className="tpl-cell" colSpan={2}>
                  <div className="tpl-instruction"><strong>For one (1) of the skills, give one (1) example of what you could change for future practice.</strong></div>
                  <div className="tpl-read-value">{r.futureChange}</div>
                </td>
              </tr>
            )}
            {r.notes && (
              <tr>
                <td className="tpl-cell" colSpan={2}>
                  <div className="tpl-notes-label">Notes:</div>
                  <div className="tpl-read-value">{r.notes}</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="refl-section-header" style={{ marginTop: 16 }}>
        <Sparkles size={15} />
        <span>Skills matched from your placement skills lists</span>
        <button className="btn btn-ghost btn-xs refl-reanalyse" onClick={onReanalyse}>Re-analyse</button>
      </div>
      <SkillsMatchPanel matchedSkills={r.matchedSkills} />
    </div>
  )
}

// Full-screen modal for tablet/mobile form entry
function ReflectionModal({ title, children, onClose }) {
  return (
    <div className="refl-modal-overlay">
      <div className="refl-modal">
        <div className="refl-modal-header">
          <h3 className="refl-panel-title" style={{ margin: 0 }}>{title}</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="refl-modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function Reflections() {
  const { notes, reflections, addReflection, updateReflection, deleteReflection } = useApp()
  const { isDesktop } = useViewport()

  const skillsListNotes = useMemo(
    () => notes.filter(n => n.tags?.includes('skills-list')),
    [notes]
  )

  const sorted = useMemo(
    () => [...reflections].sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [reflections]
  )

  const [view, setView] = useState('list')
  const [selected, setSelected] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const buildText = f =>
    [f.skill1, f.skill2, f.skill3, f.reflection1, f.reflection2, f.reflection3, f.wentWell, f.futureChange]
      .filter(Boolean).join(' ')

  const runMatch = f => matchReflectionToSkills(buildText(f), skillsListNotes)

  const handleSaveNew = async data => {
    await addReflection({ ...data, matchedSkills: runMatch(data) })
    setView('list')
  }

  const handleSaveEdit = async data => {
    const matched = runMatch(data)
    await updateReflection(selected.id, { ...data, matchedSkills: matched })
    setSelected(prev => ({ ...prev, ...data, matchedSkills: matched }))
    setView('detail')
  }

  const handleReanalyse = async () => {
    const matched = runMatch(selected)
    await updateReflection(selected.id, { matchedSkills: matched })
    setSelected(prev => ({ ...prev, matchedSkills: matched }))
  }

  const handleDeleteConfirm = async () => {
    await deleteReflection(deleting.id)
    setDeleting(null)
    setView('list')
    setSelected(null)
  }

  const showDetail = ['new', 'edit', 'detail'].includes(view)

  // On tablet/mobile, new/edit open as a modal so the list stays visible
  const useModal = !isDesktop && (view === 'new' || view === 'edit')

  return (
    <div className="page refl-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Placement Reflections</h2>
          <p className="page-sub">TAFE SA Skills and Reflection Template · one entry per placement day</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setView('new') }}>
          <Plus size={16} /> New Reflection
        </button>
      </div>

      {/* Modal for new/edit on tablet & mobile */}
      {useModal && (
        <ReflectionModal
          title={view === 'new' ? 'New Reflection' : 'Edit Reflection'}
          onClose={() => setView(selected ? 'detail' : 'list')}
        >
          <ReflectionForm
            initial={view === 'edit' ? selected : undefined}
            onSave={view === 'new' ? handleSaveNew : handleSaveEdit}
            onCancel={() => setView(selected ? 'detail' : 'list')}
          />
        </ReflectionModal>
      )}

      <div className="refl-layout">
        {/* Left: list — always visible on desktop, visible on tablet/mobile unless viewing detail */}
        <aside className={`refl-list-panel ${showDetail && !useModal && !isDesktop ? 'refl-list-hidden-mobile' : ''}`}>
          <DayNotesPanel date={new Date().toISOString().slice(0, 10)} />

          <div className="refl-list-divider">
            <BookOpen size={13} />
            <span>Reflections</span>
          </div>

          {sorted.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 16px' }}>
              <BookOpen size={36} />
              <h3>No reflections yet</h3>
              <p>Tap <strong>New Reflection</strong> after each placement day.</p>
            </div>
          ) : sorted.map(r => {
            const total = r.matchedSkills?.reduce((n, g) => n + g.matchedSkills.length, 0) ?? 0
            const isActive = selected?.id === r.id && showDetail
            return (
              <button
                key={r.id}
                className={`refl-card ${isActive ? 'refl-card-active' : ''}`}
                onClick={() => { setSelected(r); setView('detail') }}
              >
                <div className="refl-card-top">
                  <Calendar size={13} className="refl-card-icon" />
                  <span className="refl-card-date">{r.date ? fmtDate(r.date + 'T12:00:00') : '—'}</span>
                  <ChevronRight size={14} className="refl-card-chevron" />
                </div>
                {r.unitCode && <p className="refl-card-preview" style={{ fontStyle: 'italic' }}>{r.unitCode}{r.unitName ? ` — ${r.unitName}` : ''}</p>}
                {(r.skill1 || r.skill2) && (
                  <p className="refl-card-preview">{[r.skill1, r.skill2, r.skill3].filter(Boolean).join(' · ')}</p>
                )}
                {total > 0 && (
                  <div className="refl-card-badges">
                    <span className="badge badge-green">
                      <CheckCircle2 size={10} /> {total} skill{total !== 1 ? 's' : ''} matched
                    </span>
                  </div>
                )}
              </button>
            )
          })}
        </aside>

        {/* Right: detail — desktop split OR mobile full-screen */}
        <main className={`refl-detail-panel ${!showDetail || useModal ? 'refl-detail-hidden-mobile' : ''}`}>
          <button className="refl-back-btn" onClick={() => setView('list')}>
            <ArrowLeft size={15} /> All Reflections
          </button>

          {/* Desktop new/edit (not modal) */}
          {!useModal && view === 'new' && (
            <>
              <h3 className="refl-panel-title">New Reflection</h3>
              <ReflectionForm onSave={handleSaveNew} onCancel={() => setView('list')} />
            </>
          )}
          {!useModal && view === 'edit' && selected && (
            <>
              <h3 className="refl-panel-title">Edit Reflection</h3>
              <ReflectionForm initial={selected} onSave={handleSaveEdit} onCancel={() => setView('detail')} />
            </>
          )}

          {view === 'detail' && selected && (
            <ReflectionDetail
              reflection={selected}
              onEdit={() => setView('edit')}
              onDelete={() => setDeleting(selected)}
              onReanalyse={handleReanalyse}
            />
          )}

          {!showDetail && (
            <div className="refl-empty-detail">
              <BookOpen size={40} />
              <p>Select a reflection or create a new one.</p>
            </div>
          )}
        </main>
      </div>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Reflection"
        message={`Delete reflection for ${deleting ? fmtDate((deleting.date || deleting.createdAt?.slice(0,10)) + 'T12:00:00') : ''}? This cannot be undone.`}
      />
    </div>
  )
}
