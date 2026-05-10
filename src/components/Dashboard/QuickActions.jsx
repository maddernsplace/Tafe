import React from 'react'
import { PlusCircle, ClipboardList, Upload, FileText } from 'lucide-react'

export default function QuickActions({ onAddCourse, onAddAssessment, onUploadFile, onAddNote }) {
  const actions = [
    { label: 'Add Course', icon: PlusCircle, colour: '#6366f1', onClick: onAddCourse },
    { label: 'Add Assessment', icon: ClipboardList, colour: '#10b981', onClick: onAddAssessment },
    { label: 'Upload File', icon: Upload, colour: '#f59e0b', onClick: onUploadFile },
    { label: 'Add Study Note', icon: FileText, colour: '#3b82f6', onClick: onAddNote },
  ]

  return (
    <div className="quick-actions">
      {actions.map(a => (
        <button
          key={a.label}
          className="quick-action-btn"
          style={{ '--action-colour': a.colour }}
          onClick={a.onClick}
        >
          <div className="quick-action-icon">
            <a.icon size={20} />
          </div>
          <span>{a.label}</span>
        </button>
      ))}
    </div>
  )
}
