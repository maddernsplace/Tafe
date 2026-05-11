import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, FileText, FolderOpen, AlertTriangle, Clock,
  Flame, SendHorizontal, CalendarDays, Plus, ChevronRight,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { isOverdue, isDueSoon, formatDate, daysUntilDue } from '../utils/dateUtils'
import CourseCard from '../components/Dashboard/CourseCard'
import Badge from '../components/common/Badge'
import CourseForm from '../components/forms/CourseForm'
import AssessmentForm from '../components/forms/AssessmentForm'
import NoteForm from '../components/forms/NoteForm'
import FileUploadForm from '../components/forms/FileUploadForm'

function NotionRow({ assessment }) {
  const navigate = useNavigate()
  const overdue = isOverdue(assessment.dueDate)
  const soon = !overdue && isDueSoon(assessment.dueDate)
  const days = daysUntilDue(assessment.dueDate)

  return (
    <div
      className="ndb-row"
      onClick={() => navigate('/assessments')}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate('/assessments')}
    >
      <span className="ndb-row-title">{assessment.title}</span>
      <span className="ndb-row-code">{assessment.courseCode}</span>
      <span className={`ndb-row-due ${overdue ? 'text-danger' : soon ? 'text-warning' : 'text-muted'}`}>
        {overdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`}
      </span>
      <Badge label={assessment.status} />
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { activeCourses, assessments, notes, files, addCourse, addAssessment, addNote, addFile, streak } = useApp()

  const [showCourseForm, setShowCourseForm] = useState(false)
  const [showAssessmentForm, setShowAssessmentForm] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [showFileForm, setShowFileForm] = useState(false)

  const active = assessments.filter(a => a.status !== 'Completed' && a.status !== 'Submitted')
  const overdueList = active.filter(a => isOverdue(a.dueDate)).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  const dueSoonList = active.filter(a => !isOverdue(a.dueDate) && isDueSoon(a.dueDate)).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  const upcomingList = active.filter(a => !isOverdue(a.dueDate) && !isDueSoon(a.dueDate)).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  const submittedList = assessments.filter(a => a.status === 'Submitted').sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  const completedCount = assessments.filter(a => a.status === 'Completed').length
  const recentNotes = [...notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  const recentFiles = [...files].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)).slice(0, 5)

  const today = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="page ndb-page">

      {/* Page header */}
      <div className="ndb-header">
        <h1 className="ndb-title">📚 Study Dashboard</h1>
        <div className="ndb-meta">
          <span>{today}</span>
          {streak.current > 0 && (
            <span className="ndb-streak">
              <Flame size={13} /> {streak.current}-day streak
            </span>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="ndb-actions">
        <button className="ndb-action-btn" onClick={() => setShowCourseForm(true)}>
          <Plus size={13} /> New course
        </button>
        <button className="ndb-action-btn" onClick={() => setShowAssessmentForm(true)}>
          <Plus size={13} /> New assessment
        </button>
        <button className="ndb-action-btn" onClick={() => setShowNoteForm(true)}>
          <Plus size={13} /> Add note
        </button>
        <button className="ndb-action-btn" onClick={() => setShowFileForm(true)}>
          <Plus size={13} /> Upload file
        </button>
      </div>

      {/* Stats row */}
      <div className="ndb-stats-row">
        <div className="ndb-stat">
          <span className="ndb-stat-val">{activeCourses.length}</span>
          <span className="ndb-stat-label">Courses</span>
        </div>
        <div className="ndb-stat-divider" />
        <div className="ndb-stat">
          <span className="ndb-stat-val">{assessments.length}</span>
          <span className="ndb-stat-label">Assessments</span>
        </div>
        <div className="ndb-stat-divider" />
        <div className={`ndb-stat ${overdueList.length > 0 ? 'ndb-stat--danger' : ''}`}>
          <span className="ndb-stat-val">{overdueList.length}</span>
          <span className="ndb-stat-label">Overdue</span>
        </div>
        <div className="ndb-stat-divider" />
        <div className={`ndb-stat ${dueSoonList.length > 0 ? 'ndb-stat--warning' : ''}`}>
          <span className="ndb-stat-val">{dueSoonList.length}</span>
          <span className="ndb-stat-label">Due this week</span>
        </div>
        <div className="ndb-stat-divider" />
        <div className="ndb-stat">
          <span className="ndb-stat-val">{completedCount}</span>
          <span className="ndb-stat-label">Completed</span>
        </div>
        <div className="ndb-stat-divider" />
        <div className="ndb-stat">
          <span className="ndb-stat-val">{notes.length}</span>
          <span className="ndb-stat-label">Notes</span>
        </div>
        <div className="ndb-stat-divider" />
        <div className="ndb-stat">
          <span className="ndb-stat-val">{files.length}</span>
          <span className="ndb-stat-label">Files</span>
        </div>
      </div>

      {/* Overdue */}
      {overdueList.length > 0 && (
        <div className="ndb-section">
          <div className="ndb-section-head ndb-section-head--danger">
            <AlertTriangle size={12} /> OVERDUE · {overdueList.length}
          </div>
          <div className="ndb-table">
            {overdueList.map(a => <NotionRow key={a.id} assessment={a} />)}
          </div>
        </div>
      )}

      {/* Due Soon */}
      {dueSoonList.length > 0 && (
        <div className="ndb-section">
          <div className="ndb-section-head ndb-section-head--warning">
            <Clock size={12} /> DUE SOON · {dueSoonList.length}
          </div>
          <div className="ndb-table">
            {dueSoonList.map(a => <NotionRow key={a.id} assessment={a} />)}
          </div>
        </div>
      )}

      {/* Upcoming */}
      <div className="ndb-section">
        <div className="ndb-section-head-row">
          <div className="ndb-section-head">
            <CalendarDays size={12} /> UPCOMING ASSESSMENTS
          </div>
          <button className="ndb-link" onClick={() => navigate('/assessments')}>
            View all <ChevronRight size={12} />
          </button>
        </div>
        {upcomingList.length === 0 ? (
          <p className="ndb-empty">No upcoming assessments — you&apos;re all caught up!</p>
        ) : (
          <div className="ndb-table">
            {upcomingList.map(a => <NotionRow key={a.id} assessment={a} />)}
          </div>
        )}
      </div>

      {/* Submitted – Awaiting Marking */}
      {submittedList.length > 0 && (
        <div className="ndb-section">
          <div className="ndb-section-head ndb-section-head--info">
            <SendHorizontal size={12} /> SUBMITTED – AWAITING MARKING · {submittedList.length}
          </div>
          <div className="ndb-table">
            {submittedList.map(a => <NotionRow key={a.id} assessment={a} />)}
          </div>
        </div>
      )}

      {/* My Courses */}
      <div className="ndb-section">
        <div className="ndb-section-head-row">
          <div className="ndb-section-head">
            <BookOpen size={12} /> MY COURSES
          </div>
          <button className="ndb-link" onClick={() => navigate('/courses')}>
            View all <ChevronRight size={12} />
          </button>
        </div>
        {activeCourses.length === 0 ? (
          <p className="ndb-empty">
            No active courses yet.{' '}
            <button className="ndb-inline-btn" onClick={() => setShowCourseForm(true)}>Add one →</button>
          </p>
        ) : (
          <div className="ndb-courses-grid">
            {activeCourses.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </div>

      {/* Recent Notes + Files */}
      <div className="ndb-two-col">
        <div className="ndb-section">
          <div className="ndb-section-head-row">
            <div className="ndb-section-head"><FileText size={12} /> RECENT NOTES</div>
            <button className="ndb-link" onClick={() => navigate('/notes')}>View all <ChevronRight size={12} /></button>
          </div>
          {recentNotes.length === 0 ? (
            <p className="ndb-empty">No notes yet.</p>
          ) : (
            <div className="ndb-list">
              {recentNotes.map(n => (
                <div key={n.id} className="ndb-list-row" onClick={() => navigate('/notes')} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && navigate('/notes')}>
                  <span className="ndb-list-title">{n.title}</span>
                  <span className="ndb-list-meta">{n.courseCode} · {formatDate(n.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="ndb-section">
          <div className="ndb-section-head-row">
            <div className="ndb-section-head"><FolderOpen size={12} /> RECENT FILES</div>
            <button className="ndb-link" onClick={() => navigate('/files')}>View all <ChevronRight size={12} /></button>
          </div>
          {recentFiles.length === 0 ? (
            <p className="ndb-empty">No files yet.</p>
          ) : (
            <div className="ndb-list">
              {recentFiles.map(f => (
                <div key={f.id} className="ndb-list-row" onClick={() => navigate('/files')} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && navigate('/files')}>
                  <span className="ndb-list-title">{f.name}</span>
                  <span className="ndb-list-meta">{f.courseCode} · {formatDate(f.uploadDate)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CourseForm open={showCourseForm} onClose={() => setShowCourseForm(false)} onSave={addCourse} />
      <AssessmentForm open={showAssessmentForm} onClose={() => setShowAssessmentForm(false)} onSave={addAssessment} />
      <NoteForm open={showNoteForm} onClose={() => setShowNoteForm(false)} onSave={addNote} />
      <FileUploadForm open={showFileForm} onClose={() => setShowFileForm(false)} onSave={addFile} />
    </div>
  )
}
