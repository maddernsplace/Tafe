/**
 * Storage Service – localStorage abstraction layer
 *
 * All data access goes through this module so you can swap localStorage
 * for Supabase, Firebase, or any other backend later by replacing just
 * this file (or adding a provider flag).
 *
 * FUTURE UPGRADE NOTES:
 * ─────────────────────
 * To migrate to Supabase:
 *   1. npm install @supabase/supabase-js
 *   2. Replace the getItem/setItem calls below with supabase.from(...).select()/insert()
 *   3. Store the Supabase URL + anon key in a .env file (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
 *      – never hard-code API keys in this file.
 *
 * To migrate to Firebase:
 *   1. npm install firebase
 *   2. Replace calls with Firestore get/set/update/delete operations.
 *   3. Store Firebase config in .env (VITE_FIREBASE_API_KEY, etc.)
 */

const KEYS = {
  COURSES: 'tafe_courses',
  ASSESSMENTS: 'tafe_assessments',
  NOTES: 'tafe_notes',
  FILES: 'tafe_files',
  SETTINGS: 'tafe_settings',
  STREAK: 'tafe_streak',
}

function load(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Storage write failed:', e)
  }
}

// ─── Courses ───────────────────────────────────────────────────────────────

export function getCourses() {
  return load(KEYS.COURSES) || []
}

export function saveCourses(courses) {
  save(KEYS.COURSES, courses)
}

export function addCourse(course) {
  const courses = getCourses()
  courses.push({ ...course, id: course.id || uid(), createdAt: new Date().toISOString() })
  saveCourses(courses)
  return courses
}

export function updateCourse(id, updates) {
  const courses = getCourses().map(c => (c.id === id ? { ...c, ...updates } : c))
  saveCourses(courses)
  return courses
}

export function deleteCourse(id) {
  const courses = getCourses().filter(c => c.id !== id)
  saveCourses(courses)
  return courses
}

// ─── Assessments ───────────────────────────────────────────────────────────

export function getAssessments() {
  return load(KEYS.ASSESSMENTS) || []
}

export function saveAssessments(assessments) {
  save(KEYS.ASSESSMENTS, assessments)
}

export function addAssessment(assessment) {
  const all = getAssessments()
  all.push({ ...assessment, id: assessment.id || uid(), createdAt: new Date().toISOString() })
  saveAssessments(all)
  return all
}

export function updateAssessment(id, updates) {
  const all = getAssessments().map(a => (a.id === id ? { ...a, ...updates } : a))
  saveAssessments(all)
  return all
}

export function deleteAssessment(id) {
  const all = getAssessments().filter(a => a.id !== id)
  saveAssessments(all)
  return all
}

// ─── Notes ─────────────────────────────────────────────────────────────────

export function getNotes() {
  return load(KEYS.NOTES) || []
}

export function saveNotes(notes) {
  save(KEYS.NOTES, notes)
}

export function addNote(note) {
  const all = getNotes()
  const now = new Date().toISOString()
  all.unshift({ ...note, id: note.id || uid(), createdAt: now, updatedAt: now })
  saveNotes(all)
  return all
}

export function updateNote(id, updates) {
  const all = getNotes().map(n =>
    n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
  )
  saveNotes(all)
  return all
}

export function deleteNote(id) {
  const all = getNotes().filter(n => n.id !== id)
  saveNotes(all)
  return all
}

// ─── Files ─────────────────────────────────────────────────────────────────

export function getFiles() {
  return load(KEYS.FILES) || []
}

export function saveFiles(files) {
  save(KEYS.FILES, files)
}

export function addFile(file) {
  const all = getFiles()
  all.unshift({ ...file, id: file.id || uid(), uploadDate: new Date().toISOString() })
  saveFiles(all)
  return all
}

export function deleteFile(id) {
  const all = getFiles().filter(f => f.id !== id)
  saveFiles(all)
  return all
}

// ─── Settings ──────────────────────────────────────────────────────────────

export function getSettings() {
  return load(KEYS.SETTINGS) || { theme: 'dark' }
}

export function saveSettings(settings) {
  save(KEYS.SETTINGS, settings)
}

// ─── Streak ────────────────────────────────────────────────────────────────

export function getStreak() {
  return load(KEYS.STREAK) || { current: 0, longest: 0, lastVisit: null }
}

export function saveStreak(streak) {
  save(KEYS.STREAK, streak)
}

// ─── Export / Import ───────────────────────────────────────────────────────

export function exportAllData() {
  return {
    courses: getCourses(),
    assessments: getAssessments(),
    notes: getNotes(),
    files: getFiles(),
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
  }
}

export function importAllData(data) {
  if (data.courses) saveCourses(data.courses)
  if (data.assessments) saveAssessments(data.assessments)
  if (data.notes) saveNotes(data.notes)
  if (data.files) saveFiles(data.files)
  if (data.settings) saveSettings(data.settings)
}

export function clearAllData() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k))
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
