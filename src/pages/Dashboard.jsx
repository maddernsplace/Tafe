import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, ClipboardList, FileText, FolderOpen,
  AlertTriangle, Clock, CheckCircle, Flame,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { isOverdue, isDueSoon, formatDate, formatDateTime } from '../utils/dateUtils'
import StatCard from '../components/Dashboard/StatCard'
import CourseCard from '../components/Dashboard/CourseCard'
import AssessmentRow from '../components/Dashboard/AssessmentRow'
import QuickActions from '../components/Dashboard/QuickActions'
import CourseForm from '../components/forms/CourseForm'
import AssessmentForm from '../components/forms/AssessmentForm'
import NoteForm from '../components/forms/NoteForm'
import FileUploadForm from '../components/forms/FileUploadForm'

export default function Dashboard() {
  const navigate = useNavigate()
  const { courses, activeCourses, assessments, notes, files, addCourse, addAssessment, addNote, addFile, streak } = useApp()

  const [showCourseForm, setShowCourseForm] = useState(false)
  const [showAssessmentForm, setShowAssessmentForm] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [showFileForm, setShowFileForm] = useState(false)

  const active = assessments.filter(a => a.status !== 'Completed' && a.status !== 'Submitted')
  const overdueList = active.filter(a => isOverdue(a.dueDate)).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  const dueSoonList = active.filter(a => !isOverdue(a.dueDate) && isDueSoon(a.dueDate)).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  const upcomingList = active.filter(a => !isOverdue(a.dueDate) && !isDueSoon(a.dueDate)).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 3)
  const completedCount = assessments.filter(a => a.status === 'Completed' || a.status === 'Submitted').length
  const recentNotes = [...notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4)
  const recentFiles = [...files].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)).slice(0, 4)

  const stats = [
    { icon: BookOpen, label: 'Active Courses', value: activeCourses.length, colour: '#6366f1' },
    { icon: ClipboardList, label: 'Total Assessments', value: assessments.length, colour: '#10b981', sub: `${completedCount} completed` },
    { icon: AlertTriangle, label: 'Overdue', value: overdueList.length, colour: '#ef4444' },
    { icon: Clock, label: 'Due This Week', value: dueSoonList.length, colour: '#f59e0b' },
    { icon: FileText, label: 'Study Notes', value: notes.length, colour: '#3b82f6' },
    { icon: FolderOpen, label: 'Files Uploaded', value: files.length, colour: '#8b5cf6' },
  ]

  return (
    <div className="page">
      {/* Welcome banner */}
      <div className="welcome-banner">
        <div>
          <h2 className="welcome-title">Welcome back!</h2>
          <p className="welcome-sub">Here&apos;s your study overview for today.</p>
        </div>
        {streak.current > 0 && (
          <div className="streak-banner">
            <Flame size={20} className="streak-fire" />
            <div>
              <p className="streak-num">{streak.current}</p>
              <p className="streak-text">day streak</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <section className="section">
        <h2 className="section-title">Quick Actions</h2>
        <QuickActions
          onAddCourse={() => setShowCourseForm(true)}
          onAddAssessment={() => setShowAssessmentForm(true)}
          onUploadFile={() => setShowFileForm(true)}
          onAddNote={() => setShowNoteForm(true)}
        />
      </section>

      {/* Stats */}
      <section className="section">
        <div className="stats-grid">
          {stats.map(s => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* Overdue + Due Soon */}
      {(overdueList.length > 0 || dueSoonList.length > 0) && (
        <section className="section">
          <div className="dashboard-two-col">
            {overdueList.length > 0 && (
              <div className="card card-danger">
                <div className="card-header">
                  <AlertTriangle size={18} className="text-danger" />
                  <h3 className="card-title text-danger">Overdue ({overdueList.length})</h3>
                </div>
                <div className="card-list">
                  {overdueList.map(a => <AssessmentRow key={a.id} assessment={a} />)}
                </div>
              </div>
            )}
            {dueSoonList.length > 0 && (
              <div className="card card-warning">
                <div className="card-header">
                  <Clock size={18} className="text-warning" />
                  <h3 className="card-title text-warning">Due Soon ({dueSoonList.length})</h3>
                </div>
                <div className="card-list">
                  {dueSoonList.map(a => <AssessmentRow key={a.id} assessment={a} />)}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Courses */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">My Courses</h2>
          <button className="btn btn-sm btn-ghost" onClick={() => navigate('/courses')}>View all</button>
        </div>
        {activeCourses.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={40} />
            <p>No active courses yet. Add your first course!</p>
            <button className="btn btn-primary" onClick={() => setShowCourseForm(true)}>Add Course</button>
          </div>
        ) : (
          <div className="courses-grid">
            {activeCourses.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </section>

      {/* Upcoming assessments */}
      {upcomingList.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Upcoming Assessments</h2>
            <button className="btn btn-sm btn-ghost" onClick={() => navigate('/assessments')}>View all</button>
          </div>
          <div className="card">
            <div className="card-list">
              {upcomingList.map(a => <AssessmentRow key={a.id} assessment={a} />)}
            </div>
          </div>
        </section>
      )}

      {/* Recent notes + files */}
      <section className="section">
        <div className="dashboard-two-col">
          <div className="card">
            <div className="card-header">
              <FileText size={18} />
              <h3 className="card-title">Recent Notes</h3>
              <button className="btn btn-xs btn-ghost ml-auto" onClick={() => navigate('/notes')}>View all</button>
            </div>
            {recentNotes.length === 0 ? (
              <p className="empty-inline">No notes yet.</p>
            ) : (
              <ul className="recent-list">
                {recentNotes.map(n => (
                  <li key={n.id} className="recent-item" onClick={() => navigate('/notes')}>
                    <span className="recent-title">{n.title}</span>
                    <span className="recent-meta">{n.courseCode} · {formatDate(n.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="card">
            <div className="card-header">
              <FolderOpen size={18} />
              <h3 className="card-title">Recent Files</h3>
              <button className="btn btn-xs btn-ghost ml-auto" onClick={() => navigate('/files')}>View all</button>
            </div>
            {recentFiles.length === 0 ? (
              <p className="empty-inline">No files yet.</p>
            ) : (
              <ul className="recent-list">
                {recentFiles.map(f => (
                  <li key={f.id} className="recent-item" onClick={() => navigate('/files')}>
                    <span className="recent-title">{f.name}</span>
                    <span className="recent-meta">{f.courseCode} · {formatDate(f.uploadDate)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Modals */}
      <CourseForm open={showCourseForm} onClose={() => setShowCourseForm(false)} onSave={addCourse} />
      <AssessmentForm open={showAssessmentForm} onClose={() => setShowAssessmentForm(false)} onSave={addAssessment} />
      <NoteForm open={showNoteForm} onClose={() => setShowNoteForm(false)} onSave={addNote} />
      <FileUploadForm open={showFileForm} onClose={() => setShowFileForm(false)} onSave={addFile} />
    </div>
  )
}
