import React, { useState, useMemo } from 'react'
import { Upload, FolderOpen } from 'lucide-react'
import { useApp } from '../context/AppContext'
import SearchBar from '../components/common/SearchBar'
import FileUploadForm from '../components/forms/FileUploadForm'
import ConfirmDialog from '../components/common/ConfirmDialog'
import FileItem from './partials/FileItem'

export default function FileLibrary() {
  const { courses, files, addFile, deleteFile } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCourse, setFilterCourse] = useState('All')

  const filtered = useMemo(() => {
    let list = [...files]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.courseCode?.toLowerCase().includes(q) ||
        f.tags?.some(t => t.toLowerCase().includes(q))
      )
    }
    if (filterCourse !== 'All') list = list.filter(f => f.courseId === filterCourse)
    return list.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
  }, [files, search, filterCourse])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">File Library</h2>
          <p className="page-sub">{files.length} file{files.length !== 1 ? 's' : ''} stored locally</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Upload size={16} /> Upload File
        </button>
      </div>

      <div className="storage-note">
        Files are stored in your browser (localStorage). Max ~5 MB total. Future upgrade: Supabase/Firebase storage.
      </div>

      <div className="filters-bar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search files, tags…" />
        <div className="filter-chips">
          <button className={`chip ${filterCourse === 'All' ? 'chip-active' : ''}`} onClick={() => setFilterCourse('All')}>All</button>
          {courses.map(c => (
            <button key={c.id} className={`chip ${filterCourse === c.id ? 'chip-active' : ''}`} onClick={() => setFilterCourse(c.id)}>{c.code}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={48} />
          <h3>{files.length === 0 ? 'No files yet' : 'No files match your search'}</h3>
          <p>Upload PDFs, DOCX, images, and other study materials.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Upload First File</button>
        </div>
      ) : (
        <div className="files-full-list">
          {filtered.map(f => (
            <FileItem key={f.id} file={f} onDelete={() => setDeleting(f)} />
          ))}
        </div>
      )}

      <FileUploadForm open={showForm} onClose={() => setShowForm(false)} onSave={addFile} />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteFile(deleting?.id)}
        title="Delete File"
        message={`Delete "${deleting?.name}"? This cannot be undone.`}
      />
    </div>
  )
}
