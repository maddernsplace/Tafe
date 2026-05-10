import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, AlertTriangle, Clock } from 'lucide-react'
import Badge from '../common/Badge'
import { formatDate, isOverdue, isDueSoon, daysUntilDue } from '../../utils/dateUtils'

export default function AssessmentRow({ assessment }) {
  const navigate = useNavigate()
  const overdue = isOverdue(assessment.dueDate)
  const soon = !overdue && isDueSoon(assessment.dueDate)
  const days = daysUntilDue(assessment.dueDate)

  return (
    <div
      className={`assessment-row ${overdue ? 'assessment-overdue' : soon ? 'assessment-soon' : ''}`}
      onClick={() => navigate('/assessments')}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate('/assessments')}
    >
      <div className="assessment-row-left">
        {overdue ? (
          <AlertTriangle size={16} className="text-danger" />
        ) : soon ? (
          <Clock size={16} className="text-warning" />
        ) : (
          <Calendar size={16} className="text-muted" />
        )}
        <div>
          <p className="assessment-title">{assessment.title}</p>
          <p className="assessment-meta">
            <span className="course-code-small">{assessment.courseCode}</span>
          </p>
        </div>
      </div>
      <div className="assessment-row-right">
        <span className={`due-label ${overdue ? 'text-danger' : soon ? 'text-warning' : 'text-muted'}`}>
          {overdue
            ? `${Math.abs(days)}d overdue`
            : days === 0
            ? 'Due today'
            : `${days}d left`}
        </span>
        <Badge label={assessment.status} />
      </div>
    </div>
  )
}
