import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as storage from '../services/storage'
import {
  SAMPLE_COURSES,
  SAMPLE_ASSESSMENTS,
  SAMPLE_NOTES,
  SAMPLE_FILES,
} from '../data/sampleData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [courses, setCourses] = useState([])
  const [assessments, setAssessments] = useState([])
  const [notes, setNotes] = useState([])
  const [files, setFiles] = useState([])
  const [streak, setStreak] = useState({ current: 0, longest: 0, lastVisit: null })

  // Seed sample data on first load
  useEffect(() => {
    let c = storage.getCourses()
    if (!c.length) {
      storage.saveCourses(SAMPLE_COURSES)
      c = SAMPLE_COURSES
    }
    setCourses(c)

    let a = storage.getAssessments()
    if (!a.length) {
      storage.saveAssessments(SAMPLE_ASSESSMENTS)
      a = SAMPLE_ASSESSMENTS
    }
    setAssessments(a)

    let n = storage.getNotes()
    if (!n.length) {
      storage.saveNotes(SAMPLE_NOTES)
      n = SAMPLE_NOTES
    }
    setNotes(n)

    let f = storage.getFiles()
    if (!f.length) {
      storage.saveFiles(SAMPLE_FILES)
      f = SAMPLE_FILES
    }
    setFiles(f)

    // Update study streak
    const s = storage.getStreak()
    const today = new Date().toDateString()
    const last = s.lastVisit ? new Date(s.lastVisit).toDateString() : null
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    let newStreak = s
    if (last !== today) {
      if (last === yesterday) {
        newStreak = { current: s.current + 1, longest: Math.max(s.longest, s.current + 1), lastVisit: new Date().toISOString() }
      } else {
        newStreak = { current: 1, longest: Math.max(s.longest, 1), lastVisit: new Date().toISOString() }
      }
      storage.saveStreak(newStreak)
    }
    setStreak(newStreak)
  }, [])

  // ─── Course actions ────────────────────────────────────────────────────

  const addCourse = useCallback(course => {
    setCourses(storage.addCourse(course))
  }, [])

  const updateCourse = useCallback((id, updates) => {
    setCourses(storage.updateCourse(id, updates))
  }, [])

  const deleteCourse = useCallback(id => {
    setCourses(storage.deleteCourse(id))
  }, [])

  // ─── Assessment actions ─────────────────────────────────────────────────

  const addAssessment = useCallback(assessment => {
    setAssessments(storage.addAssessment(assessment))
  }, [])

  const updateAssessment = useCallback((id, updates) => {
    setAssessments(storage.updateAssessment(id, updates))
  }, [])

  const deleteAssessment = useCallback(id => {
    setAssessments(storage.deleteAssessment(id))
  }, [])

  // ─── Note actions ──────────────────────────────────────────────────────

  const addNote = useCallback(note => {
    setNotes(storage.addNote(note))
  }, [])

  const updateNote = useCallback((id, updates) => {
    setNotes(storage.updateNote(id, updates))
  }, [])

  const deleteNote = useCallback(id => {
    setNotes(storage.deleteNote(id))
  }, [])

  // ─── File actions ──────────────────────────────────────────────────────

  const addFile = useCallback(file => {
    setFiles(storage.addFile(file))
  }, [])

  const deleteFile = useCallback(id => {
    setFiles(storage.deleteFile(id))
  }, [])

  // ─── Data management ───────────────────────────────────────────────────

  const clearAll = useCallback(() => {
    storage.clearAllData()
    setCourses([])
    setAssessments([])
    setNotes([])
    setFiles([])
  }, [])

  const importData = useCallback(data => {
    storage.importAllData(data)
    if (data.courses) setCourses(data.courses)
    if (data.assessments) setAssessments(data.assessments)
    if (data.notes) setNotes(data.notes)
    if (data.files) setFiles(data.files)
  }, [])

  return (
    <AppContext.Provider
      value={{
        courses, addCourse, updateCourse, deleteCourse,
        assessments, addAssessment, updateAssessment, deleteAssessment,
        notes, addNote, updateNote, deleteNote,
        files, addFile, deleteFile,
        streak,
        clearAll, importData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
