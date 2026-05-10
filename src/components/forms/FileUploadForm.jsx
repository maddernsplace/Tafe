import React, { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X } from 'lucide-react'
import Modal from '../common/Modal'
import { useApp } from '../../context/AppContext'

const EMPTY_META = { courseId: '', courseCode: '', assessmentId: '', tags: '' }

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileUploadForm({ open, onClose, onSave, defaultCourseId }) {
  const { courses, assessments } = useApp()
  const [meta, setMeta] = useState(EMPTY_META)
  const [droppedFiles, setDroppedFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    if (defaultCourseId) {
      const c = courses.find(x => x.id === defaultCourseId)
      setMeta({ ...EMPTY_META, courseId: defaultCourseId, courseCode: c?.code || '' })
    } else {
      setMeta(EMPTY_META)
    }
    setDroppedFiles([])
    setProgress(null)
  }, [open, defaultCourseId])

  const setM = (k, v) => setMeta(m => ({ ...m, [k]: v }))

  const handleCourseChange = e => {
    const c = courses.find(x => x.id === e.target.value)
    setMeta(m => ({ ...m, courseId: e.target.value, courseCode: c?.code || '', assessmentId: '' }))
  }

  const onDrop = useCallback(accepted => {
    setDroppedFiles(prev => {
      const existing = new Set(prev.map(f => f.name + f.size))
      return [...prev, ...accepted.filter(f => !existing.has(f.name + f.size))]
    })
  }, [])

  const removeFile = idx => setDroppedFiles(f => f.filter((_, i) => i !== idx))

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 50 * 1024 * 1024,
  })

  const courseAssessments = assessments.filter(a => a.courseId === meta.courseId)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!droppedFiles.length) return
    setLoading(true)
    const tags = meta.tags.split(',').map(t => t.trim()).filter(Boolean)
    for (let i = 0; i < droppedFiles.length; i++) {
      setProgress(`Uploading ${i + 1} of ${droppedFiles.length}…`)
      const file = droppedFiles[i]
      const dataUrl = await readFileAsDataURL(file)
      await onSave({
        name: file.name,
        type: file.type,
        size: file.size,
        courseId: meta.courseId,
        courseCode: meta.courseCode,
        assessmentId: meta.assessmentId,
        tags,
        dataUrl,
      })
    }
    setLoading(false)
    setProgress(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Upload Files" size="md">
      <form onSubmit={handleSubmit} className="form">
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${droppedFiles.length ? 'dropzone-has-file' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="dropzone-prompt">
            <Upload size={32} />
            <p>{isDragActive ? 'Drop files here!' : 'Drag & drop files, or click to browse'}</p>
            <p className="text-muted">PDF, DOCX, images, text — up to 50 MB each — multiple files OK</p>
          </div>
        </div>

        {droppedFiles.length > 0 && (
          <div className="upload-file-list">
            {droppedFiles.map((f, i) => (
              <div key={i} className="upload-file-row">
                <File size={15} />
                <span className="upload-file-name">{f.name}</span>
                <span className="upload-file-size">{formatSize(f.size)}</span>
                <button type="button" className="icon-btn" onClick={() => removeFile(i)}>
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

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
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={!droppedFiles.length || loading}>
            {progress ?? (droppedFiles.length > 1 ? `Upload ${droppedFiles.length} Files` : 'Upload File')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
