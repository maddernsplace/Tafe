import React from 'react'
import { FileText, File, Image, Trash2, Download, Tag } from 'lucide-react'
import { formatDate } from '../../utils/dateUtils'

function getIcon(type) {
  if (!type) return File
  if (type.includes('pdf')) return FileText
  if (type.startsWith('image/')) return Image
  return File
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileItem({ file, onDelete }) {
  const Icon = getIcon(file.type)

  const handleDownload = () => {
    if (!file.dataUrl) return
    const a = document.createElement('a')
    a.href = file.dataUrl
    a.download = file.name
    a.click()
  }

  return (
    <div className="file-item">
      <div className="file-icon">
        <Icon size={24} />
      </div>
      <div className="file-info">
        <p className="file-name">{file.name}</p>
        <p className="file-meta">
          {file.courseCode && <span>{file.courseCode}</span>}
          {file.size && <span>{formatSize(file.size)}</span>}
          <span>{formatDate(file.uploadDate)}</span>
        </p>
        {file.tags?.length > 0 && (
          <div className="note-tags">
            <Tag size={11} />
            {file.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
      </div>
      <div className="file-actions">
        {file.dataUrl && (
          <button className="icon-btn" title="Download" onClick={handleDownload}>
            <Download size={15} />
          </button>
        )}
        <button className="icon-btn text-danger" title="Delete" onClick={onDelete}>
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
