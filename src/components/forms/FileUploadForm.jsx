import React, { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File } from 'lucide-react'
import Modal from '../common/Modal'
import { useApp } from '../../context/AppContext'

const EMPTY = { courseId: '', courseCode: '', assessmentId: '', tags: '' }

// Files are stored as base64 data URLs in localStorage.
// FUTURE UPGRADE: Replace readAsDataURL with a Supabase/Firebase storage upload.
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function FileUploadForm({ open, onClose, onSave, defaultCourseId }) {
  const { courses, assessments } = useApp()
  const [meta, setMeta] = useState(EMPTY)
  const [droppedFile, setDroppedFile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (defaultCourseId) {
      const c = courses.find(x => x.id === defaultCourseId)
      setMeta({ ...EMPTY, courseId: defaultCourseId, courseCode: c?.code || '' })
    } else {
      setMeta(EMPTY)
    }
    setDroppedFile(null)
  }, [open, defaultCourseId])

  const setM = (k, v) => setMeta(m => ({ ...m, [k]: v }))

  const handleCourseChange = e => {
    const c = courses.find(x => x.id === e.target.value)
    setMeta(m => ({ ...m, courseId: e.target.value, courseCode: c?.code || '', assessmentId: '' }))
  }

  const onDrop = useCallback(accepted => {
    if (accepted[0]) setDroppedFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10 MB
  })

  const courseAssessments = assessments.filter(a => a.courseId === meta.courseId)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!droppedFile) return
    setLoading(true)
    try {
      const dataUrl = await readFileAsDataURL(droppedFile)
      onSave({
        name: droppedFile.name,
        type: droppedFile.type,
        size: droppedFile.size,
        courseId: meta.courseId,
        courseCode: meta.courseCode,
        assessmentId: meta.assessmentId,
        tags: meta.tags.split(',').map(t => t.trim()).filter(Boolean),
        dataUrl,
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Upload File" size="md">
      <form onSubmit={handleSubmit} className="form">
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${droppedFile ? 'dropzone-has-file' : ''}`}
        >
          <input {...getInputProps()} />
          {droppedFile ? (
            <div className="dropzone-file">
              <File size={32} />
              <p>{droppedFile.name}</p>
              <p className="text-muted">{(droppedFile.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="dropzone-prompt">
              <Upload size={32} />
              <p>{isDragActive ? 'Drop it here!' : 'Drag & drop a file, or click to browse'}</p>
              <p className="text-muted">PDF, DOCX, images, text – max 10 MB</p>
            </div>
          )}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Course</label>
            <select className="form-input" value={meta.courseId} onChange={handleCourseChange}>
              <option value="">— Select course —</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code} – {c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Assessment</label>
            <select className="form-input" value={meta.assessmentId} onChange={e => setM('assessmentId', e.target.value)} disabled={!meta.courseId}>
              <option value="">— Optional —</option>
              {courseAssessments.map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Tags (comma separated)</label>
          <input className="form-input" value={meta.tags} onChange={e => setM('tags', e.target.value)} placeholder="e.g. course guide, rubric" />
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={!droppedFile || loading}>
            {loading ? 'Uploading…' : 'Upload File'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
