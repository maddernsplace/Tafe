import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Plus, Pencil, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { isOverdue, isDueSoon, formatDate } from '../utils/dateUtils'
import Badge from '../components/common/Badge'
import CourseForm from '../components/forms/CourseForm'
import ConfirmDialog from '../components/common/ConfirmDialog'

export default function Courses() {
  const navigate = useNavigate()
  const { courses, assessments, addCourse, updateCourse, deleteCourse } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const handleSave = data => {
    if (editing) {
      updateCourse(editing.id, data)
      setEditing(null)
    } else {
      addCourse(data)
    }
  }

  const getCourseStats = course => {
    const ca = assessments.filter(a => a.courseId === course.id)
    const active = ca.filter(a => a.status !== 'Completed' && a.status !== 'Submitted')
    const overdue = active.filter(a => isOverdue(a.dueDate)).length
    const soon = active.filter(a => !isOverdue(a.dueDate) && isDueSoon(a.dueDate)).length
    const next = active.filter(a => !isOverdue(a.dueDate)).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0]
    return { total: ca.length, overdue, soon, next }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">My Courses</h2>
          <p className="page-sub">{courses.length} course{courses.length !== 1 ? 's' : ''} enrolled</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} />
          <h3>No courses yet</h3>
          <p>Add your first TAFE course to get started.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Add Course</button>
        </div>
      ) : (
        <div className="courses-list">
          {courses.map(course => {
            const stats = getCourseStats(course)
            return (
              <div key={course.id} className="course-list-card" style={{ borderLeft: `5px solid ${course.colour || '#6366f1'}` }}>
                <div className="clc-main" onClick={() => navigate(`/courses/${course.id}`)}>
                  <div className="clc-header">
                    <span className="course-code" style={{ color: course.colour || '#6366f1' }}>{course.code}</span>
                    <Badge label={course.status} />
                  </div>
                  <h3 className="clc-name">{course.name}</h3>
                  {course.description && <p className="clc-desc">{course.description}</p>}
                  <div className="clc-stats">
                    <span>{stats.total} assessments</span>
                    {stats.overdue > 0 && <span className="badge badge-red">{stats.overdue} overdue</span>}
                    {stats.soon > 0 && <span className="badge badge-orange">{stats.soon} due soon</span>}
                    {stats.next && <span className="text-muted">Next due: {formatDate(stats.next.dueDate)}</span>}
                  </div>
                </div>
                <div className="clc-actions">
                  <button className="icon-btn" title="Edit" onClick={e => { e.stopPropagation(); setEditing(course); setShowForm(true) }}>
                    <Pencil size={16} />
                  </button>
                  <button className="icon-btn text-danger" title="Delete" onClick={e => { e.stopPropagation(); setDeleting(course) }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <CourseForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null) }}
        onSave={handleSave}
        initial={editing}
      />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteCourse(deleting?.id)}
        title="Delete Course"
        message={`Delete "${deleting?.name}"? This will not delete linked assessments or notes.`}
      />
    </div>
  )
}
