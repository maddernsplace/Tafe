import React, { useState, useMemo } from 'react'
import { Plus, FileText } from 'lucide-react'
import { useApp } from '../context/AppContext'
import SearchBar from '../components/common/SearchBar'
import NoteForm from '../components/forms/NoteForm'
import ConfirmDialog from '../components/common/ConfirmDialog'
import NoteCard from './partials/NoteCard'

export default function StudyNotes() {
  const { activeCourses: courses, notes, addNote, updateNote, deleteNote } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCourse, setFilterCourse] = useState('All')

  const handleSave = data => {
    if (editing) {
      updateNote(editing.id, data)
      setEditing(null)
    } else {
      addNote(data)
    }
  }

  const filtered = useMemo(() => {
    let list = [...notes]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q) ||
        n.courseCode?.toLowerCase().includes(q) ||
        n.tags?.some(t => t.toLowerCase().includes(q))
      )
    }
    if (filterCourse !== 'All') list = list.filter(n => n.courseId === filterCourse)
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [notes, search, filterCourse])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Study Notes</h2>
          <p className="page-sub">Paste ChatGPT or Claude answers · {notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Note
        </button>
      </div>

      <div className="filters-bar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search notes, tags, content…" />
        <div className="filter-chips">
          <button className={`chip ${filterCourse === 'All' ? 'chip-active' : ''}`} onClick={() => setFilterCourse('All')}>All</button>
          {courses.map(c => (
            <button key={c.id} className={`chip ${filterCourse === c.id ? 'chip-active' : ''}`} onClick={() => setFilterCourse(c.id)}>{c.code}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <h3>{notes.length === 0 ? 'No study notes yet' : 'No notes match your search'}</h3>
          <p>Paste ChatGPT or Claude answers to save them here.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Add First Note</button>
        </div>
      ) : (
        <div className="notes-full-list">
          {filtered.map(n => (
            <NoteCard
              key={n.id}
              note={n}
              onDelete={() => setDeleting(n)}
              onEdit={() => { setEditing(n); setShowForm(true) }}
            />
          ))}
        </div>
      )}

      <NoteForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null) }}
        onSave={handleSave}
        initial={editing}
      />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteNote(deleting?.id)}
        title="Delete Note"
        message={`Delete "${deleting?.title}"?`}
      />
    </div>
  )
}
