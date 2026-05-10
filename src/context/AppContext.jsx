import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { initStorage, useApi } from '../services/storage'
import * as storage from '../services/storage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [ready, setReady]       = useState(false)
  const [courses, setCourses]   = useState([])
  const [assessments, setAssessments] = useState([])
  const [notes, setNotes]       = useState([])
  const [files, setFiles]       = useState([])
  const [streak, setStreak]     = useState({ current: 0, longest: 0, lastVisit: null })
  const [isApiMode, setIsApiMode] = useState(false)

  // ── Bootstrap ──────────────────────────────────────────────────
  useEffect(() => {
    async function bootstrap() {
      // Detect storage mode (API vs localStorage)
      await initStorage()
      setIsApiMode(useApi())

      // Load all data
      const [c, a, n, f, s] = await Promise.all([
        storage.getCourses(),
        storage.getAssessments(),
        storage.getNotes(),
        storage.getFiles(),
        storage.getStreak(),
      ])

      setCourses(c)
      setAssessments(a)
      setNotes(n)
      setFiles(f)

      // Study streak logic
      const today     = new Date().toDateString()
      const last      = s.lastVisit ? new Date(s.lastVisit).toDateString() : null
      const yesterday = new Date(Date.now() - 86400000).toDateString()

      let newStreak = s
      if (last !== today) {
        if (last === yesterday) {
          newStreak = { current: s.current + 1, longest: Math.max(s.longest, s.current + 1), lastVisit: new Date().toISOString() }
        } else {
          newStreak = { current: 1, longest: Math.max(s.longest, 1), lastVisit: new Date().toISOString() }
        }
        await storage.saveStreak(newStreak)
      }
      setStreak(newStreak)
      setReady(true)
    }

    bootstrap().catch(err => {
      console.error('Bootstrap failed:', err)
      setReady(true) // show the app even if something went wrong
    })
  }, [])

  // ── Courses ────────────────────────────────────────────────────
  const addCourse = useCallback(async course => {
    setCourses(await storage.addCourse(course))
  }, [])

  const updateCourse = useCallback(async (id, updates) => {
    setCourses(await storage.updateCourse(id, updates))
  }, [])

  const deleteCourse = useCallback(async id => {
    setCourses(await storage.deleteCourse(id))
  }, [])

  // ── Assessments ────────────────────────────────────────────────
  const addAssessment = useCallback(async assessment => {
    setAssessments(await storage.addAssessment(assessment))
  }, [])

  const updateAssessment = useCallback(async (id, updates) => {
    setAssessments(await storage.updateAssessment(id, updates))
  }, [])

  const deleteAssessment = useCallback(async id => {
    setAssessments(await storage.deleteAssessment(id))
  }, [])

  // ── Notes ──────────────────────────────────────────────────────
  const addNote = useCallback(async note => {
    setNotes(await storage.addNote(note))
  }, [])

  const updateNote = useCallback(async (id, updates) => {
    setNotes(await storage.updateNote(id, updates))
  }, [])

  const deleteNote = useCallback(async id => {
    setNotes(await storage.deleteNote(id))
  }, [])

  // ── Files ──────────────────────────────────────────────────────
  const addFile = useCallback(async file => {
    setFiles(await storage.addFile(file))
  }, [])

  const deleteFile = useCallback(async id => {
    setFiles(await storage.deleteFile(id))
  }, [])

  // ── Data management ────────────────────────────────────────────
  const clearAll = useCallback(async () => {
    await storage.clearAllData()
    setCourses([])
    setAssessments([])
    setNotes([])
    setFiles([])
  }, [])

  const importData = useCallback(async data => {
    await storage.importAllData(data)
    const [c, a, n, f] = await Promise.all([
      storage.getCourses(),
      storage.getAssessments(),
      storage.getNotes(),
      storage.getFiles(),
    ])
    setCourses(c)
    setAssessments(a)
    setNotes(n)
    setFiles(f)
  }, [])

  return (
    <AppContext.Provider value={{
      ready, isApiMode,
      courses,     addCourse,     updateCourse,     deleteCourse,
      assessments, addAssessment, updateAssessment, deleteAssessment,
      notes,       addNote,       updateNote,       deleteNote,
      files,       addFile,       deleteFile,
      streak,
      clearAll, importData,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
