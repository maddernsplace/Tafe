import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ClipboardList, FileText, FolderOpen,
  Plus, Pencil, Trash2, Calendar,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatDate, isOverdue, isDueSoon } from '../utils/dateUtils'
import Badge from '../components/common/Badge'
import AssessmentForm from '../components/forms/AssessmentForm'
import NoteForm from '../components/forms/NoteForm'
import FileUploadForm from '../components/forms/FileUploadForm'
import ConfirmDialog from '../components/common/ConfirmDialog'
import NoteCard from './partials/NoteCard'
import FileItem from './partials/FileItem'

export default function CoursePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { courses, assessments, notes, files, addAssessment, updateAssessment, deleteAssessment, addNote, deleteNote, addFile, deleteFile } = useApp()

  const course = courses.find(c => c.id === id)

  const [showAssessmentForm, setShowAssessmentForm] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState(null)
  const [deletingAssessment, setDeletingAssessment] = useState(null)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [showFileForm, setShowFileForm] = useState(false)
  const [deletingNote, setDeletingNote] = useState(null)
  const [deletingFile, setDeletingFile] = useState(null)

  if (!course) {
    return (
      <div className="page">
        <div className="empty-state">
          <h3>Course not found</h3>
          <button className="btn btn-primary" onClick={() => navigate('/courses')}>Back to Courses</button>
        </div>
      </div>
    )
  }

  const courseAssessments = assessments.filter(a => a.courseId === id).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  const courseNotes = notes.filter(n => n.courseId === id)
  const courseFiles = files.filter(f => f.courseId === id)

  const handleSaveAssessment = data => {
    if (editingAssessment) {
      updateAssessment(editingAssessment.id, data)
      setEditingAssessment(null)
    } else {
      addAssessment({ ...data, courseId: id, courseCode: course.code })
    }
  }

  return (
    <div className="page">
      {/* Back + header */}
      <button className="back-btn" onClick={() => navigate('/courses')}>
        <ArrowLeft size={16} /> Back to Courses
      </button>

      <div className="course-page-header" style={{ borderTop: `4px solid ${course.colour || '#6366f1'}` }}>
        <div>
          <span className="course-code-lg" style={{ color: course.colour || '#6366f1' }}>{course.code}</span>
          <h1 className="course-page-title">{course.name}</h1>
          {course.description && <p className="course-page-desc">{course.description}</p>}
        </div>
        <div className="course-page-meta">
          <Badge label={course.status} />
          {course.startDate && <span className="text-muted">{formatDate(course.startDate)} – {formatDate(course.endDate)}</span>}
        </div>
      </div>

      {/* Assessments */}
      <section className="section">
        <div className="section-header">
          <div className="section-header-icon">
            <ClipboardList size={18} />
            <h2 className="section-title">Assessments ({courseAssessments.length})</h2>
          </div>
          <button className="btn btn-sm btn-primary" onClick={() => setShowAssessmentForm(true)}>
            <Plus size={14} /> Add
          </button>
        </div>
        {courseAssessments.length === 0 ? (
          <p className="empty-inline">No assessments yet.</p>
        ) : (
          <div className="assessment-table">
            {courseAssessments.map(a => {
              const overdue = isOverdue(a.dueDate)
              const soon = !overdue && isDueSoon(a.dueDate)
              return (
                <div key={a.id} className={`assessment-table-row ${overdue ? 'assessment-overdue' : soon ? 'assessment-soon' : ''}`}>
                  <div className="atr-main">
                    <p className="atr-title">{a.title}</p>
                    {a.description && <p className="atr-desc">{a.description}</p>}
                    {a.notes && <p className="atr-notes">{a.notes}</p>}
                  </div>
                  <div className="atr-meta">
                    <div className="atr-due">
                      <Calendar size={13} />
                      <span className={overdue ? 'text-danger' : soon ? 'text-warning' : ''}>{formatDate(a.dueDate)}</span>
                    </div>
                    <Badge label={a.status} />
                    <div className="atr-actions">
                      <button className="icon-btn" onClick={() => { setEditingAssessment(a); setShowAssessmentForm(true) }}>
                        <Pencil size={14} />
                      </button>
                      <button className="icon-btn text-danger" onClick={() => setDeletingAssessment(a)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Study Notes */}
      <section className="section">
        <div className="section-header">
          <div className="section-header-icon">
            <FileText size={18} />
            <h2 className="section-title">Study Notes ({courseNotes.length})</h2>
          </div>
          <button className="btn btn-sm btn-primary" onClick={() => setShowNoteForm(true)}>
            <Plus size={14} /> Add
          </button>
        </div>
        {courseNotes.length === 0 ? (
          <p className="empty-inline">No study notes yet.</p>
        ) : (
          <div className="notes-grid">
            {courseNotes.map(n => (
              <NoteCard key={n.id} note={n} onDelete={() => setDeletingNote(n)} />
            ))}
          </div>
        )}
      </section>

      {/* Files */}
      <section className="section">
        <div className="section-header">
          <div className="section-header-icon">
            <FolderOpen size={18} />
            <h2 className="section-title">Files ({courseFiles.length})</h2>
          </div>
          <button className="btn btn-sm btn-primary" onClick={() => setShowFileForm(true)}>
            <Plus size={14} /> Upload
          </button>
        </div>
        {courseFiles.length === 0 ? (
          <p className="empty-inline">No files uploaded yet.</p>
        ) : (
          <div className="files-grid">
            {courseFiles.map(f => (
              <FileItem key={f.id} file={f} onDelete={() => setDeletingFile(f)} />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <AssessmentForm
        open={showAssessmentForm}
        onClose={() => { setShowAssessmentForm(false); setEditingAssessment(null) }}
        onSave={handleSaveAssessment}
        initial={editingAssessment}
        defaultCourseId={id}
      />
      <NoteForm open={showNoteForm} onClose={() => setShowNoteForm(false)} onSave={addNote} defaultCourseId={id} />
      <FileUploadForm open={showFileForm} onClose={() => setShowFileForm(false)} onSave={addFile} defaultCourseId={id} />
      <ConfirmDialog
        open={!!deletingAssessment}
        onClose={() => setDeletingAssessment(null)}
        onConfirm={() => deleteAssessment(deletingAssessment?.id)}
        title="Delete Assessment"
        message={`Delete "${deletingAssessment?.title}"?`}
      />
      <ConfirmDialog
        open={!!deletingNote}
        onClose={() => setDeletingNote(null)}
        onConfirm={() => deleteNote(deletingNote?.id)}
        title="Delete Note"
        message={`Delete "${deletingNote?.title}"?`}
      />
      <ConfirmDialog
        open={!!deletingFile}
        onClose={() => setDeletingFile(null)}
        onConfirm={() => deleteFile(deletingFile?.id)}
        title="Delete File"
        message={`Delete "${deletingFile?.name}"?`}
      />
    </div>
  )
}
