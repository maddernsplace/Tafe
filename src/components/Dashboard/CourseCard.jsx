import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, Calendar } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatDate, isOverdue, isDueSoon } from '../../utils/dateUtils'

export default function CourseCard({ course }) {
  const navigate = useNavigate()
  const { assessments } = useApp()

  const courseAssessments = assessments.filter(a => a.courseId === course.id)
  const active = courseAssessments.filter(a => a.status !== 'Completed' && a.status !== 'Submitted')
  const upcoming = active
    .filter(a => !isOverdue(a.dueDate))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  const nextDue = upcoming[0]

  const overdueCount = active.filter(a => isOverdue(a.dueDate)).length
  const dueSoonCount = active.filter(a => isDueSoon(a.dueDate)).length

  return (
    <div
      className="course-card"
      style={{ borderTop: `4px solid ${course.colour || '#6366f1'}` }}
      onClick={() => navigate(`/courses/${course.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/courses/${course.id}`)}
    >
      <div className="course-card-header">
        <div>
          <span className="course-code" style={{ color: course.colour || '#6366f1' }}>
            {course.code}
          </span>
          <h3 className="course-name">{course.name}</h3>
        </div>
        <ArrowRight size={18} className="course-arrow" />
      </div>

      <div className="course-card-stats">
        <div className="course-stat">
          <ClipboardList size={14} />
          <span>{courseAssessments.length} assessments</span>
        </div>
        {nextDue && (
          <div className={`course-stat ${isDueSoon(nextDue.dueDate) ? 'text-warning' : ''}`}>
            <Calendar size={14} />
            <span>Due {formatDate(nextDue.dueDate)}</span>
          </div>
        )}
      </div>

      {(overdueCount > 0 || dueSoonCount > 0) && (
        <div className="course-card-alerts">
          {overdueCount > 0 && (
            <span className="badge badge-red">{overdueCount} overdue</span>
          )}
          {dueSoonCount > 0 && (
            <span className="badge badge-orange">{dueSoonCount} due soon</span>
          )}
        </div>
      )}
    </div>
  )
}
