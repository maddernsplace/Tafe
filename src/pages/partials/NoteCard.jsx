import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Trash2, Copy, ChevronDown, ChevronUp, Tag } from 'lucide-react'
import { formatDate } from '../../utils/dateUtils'

export default function NoteCard({ note, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = e => {
    e.stopPropagation()
    navigator.clipboard.writeText(note.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="note-card">
      <div className="note-card-header" onClick={() => setExpanded(x => !x)}>
        <div className="note-card-meta">
          <span className="course-code-small">{note.courseCode}</span>
          <span className="text-muted">{formatDate(note.createdAt)}</span>
        </div>
        <h4 className="note-card-title">{note.title}</h4>
        {note.tags?.length > 0 && (
          <div className="note-tags">
            <Tag size={11} />
            {note.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
        <button className="icon-btn expand-btn">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      {expanded && (
        <div className="note-card-body">
          <div className="markdown-content">
            <ReactMarkdown>{note.content || '_No content_'}</ReactMarkdown>
          </div>
          <div className="note-card-footer">
            <button className="btn btn-xs btn-ghost" onClick={handleCopy}>
              <Copy size={13} /> {copied ? 'Copied!' : 'Copy'}
            </button>
            {onEdit && (
              <button className="btn btn-xs btn-ghost" onClick={() => onEdit(note)}>Edit</button>
            )}
            <button className="btn btn-xs btn-ghost text-danger" onClick={e => { e.stopPropagation(); onDelete() }}>
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
