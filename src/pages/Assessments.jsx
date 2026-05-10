import React, { useState, useMemo } from 'react'
import { Plus, Filter, ClipboardList, AlertTriangle, Clock, Calendar, Pencil, Trash2, Paperclip, FileText, File, Image, Download, ExternalLink } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { isOverdue, isDueSoon, formatDate, daysUntilDue } from '../utils/dateUtils'
import Badge from '../components/common/Badge'
import AssessmentForm from '../components/forms/AssessmentForm'
import FileUploadForm from '../components/forms/FileUploadForm'
import ConfirmDialog from '../components/common/ConfirmDialog'
import SearchBar from '../components/common/SearchBar'

function fileIcon(type) {
  if (!type) return File
  if (type.includes('pdf')) return FileText
  if (type.startsWith('image/')) return Image
  return File
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const STATUSES = ['All', 'Not Started', 'In Progress', 'Submitted', 'Resubmit Required', 'Completed']
const SORTS = ['Due Date', 'Title', 'Status', 'Course']

export default function Assessments() {
  const { courses, assessments, files, addAssessment, updateAssessment, deleteAssessment, addFile, deleteFile } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [uploadingFor, setUploadingFor] = useState(null)
  const [deletingFile, setDeletingFile] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterCourse, setFilterCourse] = useState('All')
  const [sortBy, setSortBy] = useState('Due Date')
  const [showFilters, setShowFilters] = useState(false)

  const handleSave = data => {
    if (editing) {
      updateAssessment(editing.id, data)
      setEditing(null)
    } else {
      addAssessment(data)
    }
  }

  const filtered = useMemo(() => {
    let list = [...assessments]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(a => a.title.toLowerCase().includes(q) || a.courseCode?.toLowerCase().includes(q))
    }
    if (filterStatus !== 'All') list = list.filter(a => a.status === filterStatus)
    if (filterCourse !== 'All') list = list.filter(a => a.courseId === filterCourse)
    list.sort((a, b) => {
      if (sortBy === 'Due Date') return new Date(a.dueDate || '9999') - new Date(b.dueDate || '9999')
      if (sortBy === 'Title') return a.title.localeCompare(b.title)
      if (sortBy === 'Status') return a.status.localeCompare(b.status)
      if (sortBy === 'Course') return (a.courseCode || '').localeCompare(b.courseCode || '')
      return 0
    })
    return list
  }, [assessments, search, filterStatus, filterCourse, sortBy])

  const overdueCount = assessments.filter(a => a.status !== 'Completed' && a.status !== 'Submitted' && isOverdue(a.dueDate)).length
  const dueSoonCount = assessments.filter(a => a.status !== 'Completed' && a.status !== 'Submitted' && !isOverdue(a.dueDate) && isDueSoon(a.dueDate)).length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Assessments</h2>
          <p className="page-sub">
            {assessments.length} total
            {overdueCount > 0 && <span className="badge badge-red ml-2">{overdueCount} overdue</span>}
            {dueSoonCount > 0 && <span className="badge badge-orange ml-2">{dueSoonCount} due soon</span>}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Assessment
        </button>
      </div>

      {/* Filters bar */}
      <div className="filters-bar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search assessments…" />
        <button className={`btn btn-sm btn-ghost ${showFilters ? 'btn-active' : ''}`} onClick={() => setShowFilters(f => !f)}>
          <Filter size={15} /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="filters-expanded">
          <div className="filter-group">
            <label>Status</label>
            <div className="filter-chips">
              {STATUSES.map(s => (
                <button key={s} className={`chip ${filterStatus === s ? 'chip-active' : ''}`} onClick={() => setFilterStatus(s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>Course</label>
            <div className="filter-chips">
              <button className={`chip ${filterCourse === 'All' ? 'chip-active' : ''}`} onClick={() => setFilterCourse('All')}>All</button>
              {courses.map(c => (
                <button key={c.id} className={`chip ${filterCourse === c.id ? 'chip-active' : ''}`} onClick={() => setFilterCourse(c.id)}>{c.code}</button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>Sort by</label>
            <div className="filter-chips">
              {SORTS.map(s => (
                <button key={s} className={`chip ${sortBy === s ? 'chip-active' : ''}`} onClick={() => setSortBy(s)}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assessment cards */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={48} />
          <h3>No assessments found</h3>
          <p>Try adjusting your filters or add a new assessment.</p>
        </div>
      ) : (
        <div className="assessment-cards">
          {filtered.map(a => {
            const overdue = a.status !== 'Completed' && a.status !== 'Submitted' && isOverdue(a.dueDate)
            const soon = a.status !== 'Completed' && a.status !== 'Submitted' && !overdue && isDueSoon(a.dueDate)
            const days = daysUntilDue(a.dueDate)
            const course = courses.find(c => c.id === a.courseId)
            return (
              <div
                key={a.id}
                className={`assessment-card ${overdue ? 'ac-overdue' : soon ? 'ac-soon' : ''}`}
                style={course ? { borderLeft: `4px solid ${course.colour || '#6366f1'}` } : {}}
              >
                <div className="ac-header">
                  <div>
                    <span className="course-code-small">{a.courseCode}</span>
                    <h3 className="ac-title">{a.title}</h3>
                  </div>
                  <div className="ac-badges">
                    {overdue && <span className="badge badge-red">Overdue</span>}
                    {soon && <span className="badge badge-orange">Due Soon</span>}
                    <Badge label={a.status} />
                  </div>
                </div>
                {a.description && <p className="ac-desc">{a.description}</p>}
                {a.notes && <p className="ac-notes"><strong>Notes:</strong> {a.notes}</p>}

                {/* Attached files */}
                {(() => {
                  const af = files.filter(f => f.assessmentId === a.id)
                  const Icon = fileIcon
                  return (
                    <div className="ac-files">
                      {af.map(f => {
                        const FIcon = fileIcon(f.type)
                        const url = f.fileUrl || f.dataUrl
                        return (
                          <div key={f.id} className="ac-file-chip">
                            <FIcon size={13} />
                            <span className="ac-file-name">{f.name}</span>
                            {f.size && <span className="ac-file-size">{formatSize(f.size)}</span>}
                            {f.fileUrl && (f.type?.includes('pdf') || f.type?.startsWith('image/')) && (
                              <button className="icon-btn ac-file-btn" title="Open" onClick={() => window.open(f.fileUrl, '_blank')}>
                                <ExternalLink size={11} />
                              </button>
                            )}
                            {url && (
                              <button className="icon-btn ac-file-btn" title="Download" onClick={() => { const a = document.createElement('a'); a.href = url; a.download = f.name; a.click() }}>
                                <Download size={11} />
                              </button>
                            )}
                            <button className="icon-btn ac-file-btn text-danger" title="Remove" onClick={() => setDeletingFile(f)}>
                              <Trash2 size={11} />
                            </button>
                          </div>
                        )
                      })}
                      <button className="ac-attach-btn" onClick={() => setUploadingFor(a)}>
                        <Paperclip size={13} /> {af.length === 0 ? 'Attach Files' : 'Add More'}
                      </button>
                    </div>
                  )
                })()}

                <div className="ac-footer">
                  <div className="ac-due">
                    {overdue ? <AlertTriangle size={14} className="text-danger" /> : soon ? <Clock size={14} className="text-warning" /> : <Calendar size={14} />}
                    <span className={overdue ? 'text-danger' : soon ? 'text-warning' : 'text-muted'}>
                      {a.dueDate ? formatDate(a.dueDate) : 'No due date'}
                      {a.dueDate && days !== null && (
                        <span className="ml-1">
                          ({overdue ? `${Math.abs(days)}d ago` : days === 0 ? 'Today' : `${days}d`})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="ac-actions">
                    <button className="icon-btn" onClick={() => { setEditing(a); setShowForm(true) }}>
                      <Pencil size={15} />
                    </button>
                    <button className="icon-btn text-danger" onClick={() => setDeleting(a)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AssessmentForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null) }}
        onSave={handleSave}
        initial={editing}
      />
      <FileUploadForm
        open={!!uploadingFor}
        onClose={() => setUploadingFor(null)}
        onSave={file => addFile({ ...file, assessmentId: uploadingFor?.id, courseId: uploadingFor?.courseId, courseCode: uploadingFor?.courseCode })}
        defaultCourseId={uploadingFor?.courseId}
      />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteAssessment(deleting?.id)}
        title="Delete Assessment"
        message={`Delete "${deleting?.title}"?`}
      />
      <ConfirmDialog
        open={!!deletingFile}
        onClose={() => setDeletingFile(null)}
        onConfirm={() => deleteFile(deletingFile?.id)}
        title="Remove File"
        message={`Remove "${deletingFile?.name}" from this assessment?`}
      />
    </div>
  )
}
