import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, FileText, FolderOpen, AlertTriangle, Clock,
  CalendarDays, ChevronRight, Target, TrendingUp,
  CheckCircle2, Zap,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { isOverdue, isDueSoon, formatDate, daysUntilDue } from '../utils/dateUtils'
import CourseForm from '../components/forms/CourseForm'
import AssessmentForm from '../components/forms/AssessmentForm'
import NoteForm from '../components/forms/NoteForm'
import FileUploadForm from '../components/forms/FileUploadForm'

const SUBJECT_COLOURS = [
  { text: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.22)' },
  { text: '#0EA5E9', bg: 'rgba(14,165,233,0.12)',  border: 'rgba(14,165,233,0.22)' },
  { text: '#10B981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.22)' },
  { text: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.22)' },
  { text: '#EC4899', bg: 'rgba(236,72,153,0.12)',  border: 'rgba(236,72,153,0.22)' },
  { text: '#EF4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.22)'  },
]

function subjectColour(code) {
  if (!code) return SUBJECT_COLOURS[0]
  let h = 0
  for (let i = 0; i < code.length; i++) h = code.charCodeAt(i) + ((h << 5) - h)
  return SUBJECT_COLOURS[Math.abs(h) % SUBJECT_COLOURS.length]
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function AssessmentCard({ assessment, onClick }) {
  const overdue = isOverdue(assessment.dueDate)
  const soon = !overdue && isDueSoon(assessment.dueDate)
  const days = daysUntilDue(assessment.dueDate)
  const col = subjectColour(assessment.courseCode)

  return (
    <div
      className={`dash-assess-card${overdue ? ' dash-assess-card--overdue' : soon ? ' dash-assess-card--soon' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <div className="dash-assess-card-dot" style={{ background: col.text }} />
      <div className="dash-assess-card-body">
        <p className="dash-assess-card-title">{assessment.title}</p>
        <span className="dash-assess-card-code" style={{ color: col.text, background: col.bg }}>
          {assessment.courseCode}
        </span>
      </div>
      <div className={`dash-assess-card-due ${overdue ? 'text-danger' : soon ? 'text-warning' : 'text-muted'}`}>
        {overdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `${days}d`}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { activeCourses, assessments, notes, files, addCourse, addAssessment, addNote, addFile, streak } = useApp()

  const [showCourseForm,     setShowCourseForm]     = useState(false)
  const [showAssessmentForm, setShowAssessmentForm] = useState(false)
  const [showNoteForm,       setShowNoteForm]       = useState(false)
  const [showFileForm,       setShowFileForm]       = useState(false)

  const active       = assessments.filter(a => a.status !== 'Completed' && a.status !== 'Submitted')
  const overdueList  = active.filter(a =>  isOverdue(a.dueDate)).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  const dueSoonList  = active.filter(a => !isOverdue(a.dueDate) && isDueSoon(a.dueDate)).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  const upcomingList = active.filter(a => !isOverdue(a.dueDate) && !isDueSoon(a.dueDate)).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 6)
  const completedCount  = assessments.filter(a => a.status === 'Completed').length
  const submittedCount  = assessments.filter(a => a.status === 'Submitted').length
  const recentNotes     = [...notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  const totalProgress   = assessments.length > 0 ? Math.round(((completedCount + submittedCount) / assessments.length) * 100) : 0
  const urgentList      = [...overdueList, ...dueSoonList].slice(0, 5)
  const today           = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="page dash-page">

      {/* Hero */}
      <div className="dash-hero">
        <div className="dash-hero-left">
          <h1 className="dash-hero-title">{greeting()} 👋</h1>
          <p className="dash-hero-sub">{today}</p>
        </div>
        {streak.current > 0 && (
          <div className="dash-streak-badge">
            <span className="dash-streak-fire">🔥</span>
            <div>
              <p className="dash-streak-num">{streak.current}</p>
              <p className="dash-streak-label">day streak</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="dash-stats">
        <div className="dash-stat-card">
          <div className="dash-stat-icon dash-stat-icon--purple"><BookOpen size={18} /></div>
          <div>
            <p className="dash-stat-val">{activeCourses.length}</p>
            <p className="dash-stat-label">Active Courses</p>
          </div>
        </div>
        <div className={`dash-stat-card${overdueList.length > 0 ? ' dash-stat-card--danger' : ''}`}>
          <div className="dash-stat-icon dash-stat-icon--danger"><AlertTriangle size={18} /></div>
          <div>
            <p className="dash-stat-val">{overdueList.length}</p>
            <p className="dash-stat-label">Overdue</p>
          </div>
        </div>
        <div className={`dash-stat-card${dueSoonList.length > 0 ? ' dash-stat-card--warning' : ''}`}>
          <div className="dash-stat-icon dash-stat-icon--warning"><Clock size={18} /></div>
          <div>
            <p className="dash-stat-val">{dueSoonList.length}</p>
            <p className="dash-stat-label">Due Soon</p>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon dash-stat-icon--success"><CheckCircle2 size={18} /></div>
          <div>
            <p className="dash-stat-val">{completedCount}</p>
            <p className="dash-stat-label">Completed</p>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon dash-stat-icon--blue"><FileText size={18} /></div>
          <div>
            <p className="dash-stat-val">{notes.length}</p>
            <p className="dash-stat-label">Notes</p>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="dash-grid">

        {/* Left column */}
        <div className="dash-col-main">

          {/* Needs attention */}
          {urgentList.length > 0 && (
            <div className="dash-widget">
              <div className="dash-widget-head">
                <div className="dash-widget-title">
                  <AlertTriangle size={15} style={{ color: 'var(--danger)' }} />
                  Needs Attention
                </div>
                <button className="dash-widget-link" onClick={() => navigate('/assessments')}>
                  View all <ChevronRight size={13} />
                </button>
              </div>
              <div className="dash-assess-list">
                {urgentList.map(a => (
                  <AssessmentCard key={a.id} assessment={a} onClick={() => navigate('/assessments')} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          <div className="dash-widget">
            <div className="dash-widget-head">
              <div className="dash-widget-title">
                <CalendarDays size={15} />
                Upcoming Assessments
              </div>
              <button className="dash-widget-link" onClick={() => navigate('/assessments')}>
                View all <ChevronRight size={13} />
              </button>
            </div>
            {upcomingList.length === 0 ? (
              <div className="dash-empty">
                <CheckCircle2 size={32} />
                <p>You&apos;re all caught up! 🎉</p>
              </div>
            ) : (
              <div className="dash-assess-list">
                {upcomingList.map(a => (
                  <AssessmentCard key={a.id} assessment={a} onClick={() => navigate('/assessments')} />
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right column */}
        <div className="dash-col-side">

          {/* Progress */}
          <div className="dash-widget">
            <div className="dash-widget-head">
              <div className="dash-widget-title">
                <TrendingUp size={15} />
                Overall Progress
              </div>
            </div>
            <div className="dash-progress-ring-wrap">
              <div className="dash-progress-big">
                <span className="dash-progress-pct">{totalProgress}%</span>
                <span className="dash-progress-sub">complete</span>
              </div>
              <div className="dash-progress-bar-wrap">
                <div className="dash-progress-bar">
                  <div className="dash-progress-fill" style={{ width: `${totalProgress}%` }} />
                </div>
                <p className="dash-progress-detail">
                  {completedCount + submittedCount} of {assessments.length} assessments done
                </p>
              </div>
            </div>
          </div>

          {/* My Courses */}
          <div className="dash-widget">
            <div className="dash-widget-head">
              <div className="dash-widget-title">
                <BookOpen size={15} />
                My Courses
              </div>
              <button className="dash-widget-link" onClick={() => navigate('/courses')}>
                View all <ChevronRight size={13} />
              </button>
            </div>
            {activeCourses.length === 0 ? (
              <div className="dash-empty">
                <p>No courses yet.</p>
                <button className="dash-empty-btn" onClick={() => setShowCourseForm(true)}>Add course →</button>
              </div>
            ) : (
              <div className="dash-courses-list">
                {activeCourses.slice(0, 5).map(c => {
                  const col = subjectColour(c.code)
                  return (
                    <div
                      key={c.id}
                      className="dash-course-item"
                      onClick={() => navigate(`/courses/${c.id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && navigate(`/courses/${c.id}`)}
                    >
                      <div className="dash-course-dot" style={{ background: col.text }} />
                      <div className="dash-course-info">
                        <p className="dash-course-name">{c.name}</p>
                        <span className="dash-course-code">{c.code}</span>
                      </div>
                      <ChevronRight size={14} className="dash-course-arrow" />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Bottom row */}
      <div className="dash-bottom-row">

        {/* Recent Notes */}
        <div className="dash-widget">
          <div className="dash-widget-head">
            <div className="dash-widget-title">
              <FileText size={15} />
              Recent Notes
            </div>
            <button className="dash-widget-link" onClick={() => navigate('/notes')}>
              View all <ChevronRight size={13} />
            </button>
          </div>
          {recentNotes.length === 0 ? (
            <div className="dash-empty"><p>No notes yet.</p></div>
          ) : (
            <div className="dash-notes-list">
              {recentNotes.map(n => {
                const col = subjectColour(n.courseCode)
                return (
                  <div
                    key={n.id}
                    className="dash-note-item"
                    onClick={() => navigate('/notes')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && navigate('/notes')}
                  >
                    <div className="dash-note-dot" style={{ background: col.text }} />
                    <div>
                      <p className="dash-note-title">{n.title}</p>
                      <p className="dash-note-meta">{n.courseCode} · {formatDate(n.createdAt)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Add */}
        <div className="dash-widget">
          <div className="dash-widget-head">
            <div className="dash-widget-title">
              <Zap size={15} />
              Quick Add
            </div>
          </div>
          <div className="dash-quick-grid">
            <button className="dash-quick-btn" onClick={() => setShowCourseForm(true)}>
              <BookOpen size={22} />
              <span>Course</span>
            </button>
            <button className="dash-quick-btn" onClick={() => setShowAssessmentForm(true)}>
              <Target size={22} />
              <span>Assessment</span>
            </button>
            <button className="dash-quick-btn" onClick={() => setShowNoteForm(true)}>
              <FileText size={22} />
              <span>Note</span>
            </button>
            <button className="dash-quick-btn" onClick={() => setShowFileForm(true)}>
              <FolderOpen size={22} />
              <span>File</span>
            </button>
          </div>
        </div>

      </div>

      {/* Modals */}
      <CourseForm     open={showCourseForm}     onClose={() => setShowCourseForm(false)}     onSave={addCourse} />
      <AssessmentForm open={showAssessmentForm} onClose={() => setShowAssessmentForm(false)} onSave={addAssessment} />
      <NoteForm       open={showNoteForm}       onClose={() => setShowNoteForm(false)}       onSave={addNote} />
      <FileUploadForm open={showFileForm}       onClose={() => setShowFileForm(false)}       onSave={addFile} />
    </div>
  )
}
