/**
 * Storage Service — Dual-mode
 * ────────────────────────────────────────────────────────────────
 * API MODE   (Electron app / local network):
 *   Calls the Express API running at the same origin.
 *   Data is stored in a JSON file on the host computer.
 *   All devices on the same WiFi share the same data.
 *
 * LOCAL MODE (GitHub Pages / plain browser without the server):
 *   Falls back to localStorage. Data is per-device.
 *
 * The mode is detected once at startup by pinging /api/health.
 * If it responds → API mode. Otherwise → localStorage mode.
 *
 * FUTURE UPGRADE TO SUPABASE / FIREBASE:
 *   Replace the fetch() calls below with Supabase/Firebase SDK calls.
 *   Set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in .env
 *   Never put secret keys in this file.
 */

// ── Mode Detection ─────────────────────────────────────────────
let _useApi = false

export async function initStorage() {
  try {
    const res = await fetch('/api/health', {
      signal: AbortSignal.timeout(2000),
    })
    _useApi = res.ok
  } catch {
    _useApi = false
  }
}

const useApi = () => _useApi

// ── API Helper ─────────────────────────────────────────────────
async function api(method, path, body) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`API ${method} ${path} failed: ${res.status}`)
  return res.json()
}

// ── localStorage Helpers ───────────────────────────────────────
const LS = {
  COURSES:     'tafe_courses',
  ASSESSMENTS: 'tafe_assessments',
  NOTES:       'tafe_notes',
  FILES:       'tafe_files',
  SETTINGS:    'tafe_settings',
  STREAK:      'tafe_streak',
}

function lsGet(key) {
  try { return JSON.parse(localStorage.getItem(key)) ?? null } catch { return null }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch (e) { console.error(e) }
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ── Courses ────────────────────────────────────────────────────

export async function getCourses() {
  if (useApi()) return api('GET', '/courses')
  return lsGet(LS.COURSES) ?? []
}

export async function addCourse(course) {
  if (useApi()) return api('POST', '/courses', course)
  const all = lsGet(LS.COURSES) ?? []
  const item = { ...course, id: course.id || uid(), createdAt: new Date().toISOString() }
  all.push(item)
  lsSet(LS.COURSES, all)
  return all
}

export async function updateCourse(id, updates) {
  if (useApi()) return api('PUT', `/courses/${id}`, updates)
  const all = (lsGet(LS.COURSES) ?? []).map(c => c.id === id ? { ...c, ...updates } : c)
  lsSet(LS.COURSES, all)
  return all
}

export async function deleteCourse(id) {
  if (useApi()) return api('DELETE', `/courses/${id}`)
  const all = (lsGet(LS.COURSES) ?? []).filter(c => c.id !== id)
  lsSet(LS.COURSES, all)
  return all
}

// ── Assessments ────────────────────────────────────────────────

export async function getAssessments() {
  if (useApi()) return api('GET', '/assessments')
  return lsGet(LS.ASSESSMENTS) ?? []
}

export async function addAssessment(assessment) {
  if (useApi()) return api('POST', '/assessments', assessment)
  const all = lsGet(LS.ASSESSMENTS) ?? []
  const item = { ...assessment, id: assessment.id || uid(), createdAt: new Date().toISOString() }
  all.push(item)
  lsSet(LS.ASSESSMENTS, all)
  return all
}

export async function updateAssessment(id, updates) {
  if (useApi()) return api('PUT', `/assessments/${id}`, updates)
  const all = (lsGet(LS.ASSESSMENTS) ?? []).map(a => a.id === id ? { ...a, ...updates } : a)
  lsSet(LS.ASSESSMENTS, all)
  return all
}

export async function deleteAssessment(id) {
  if (useApi()) return api('DELETE', `/assessments/${id}`)
  const all = (lsGet(LS.ASSESSMENTS) ?? []).filter(a => a.id !== id)
  lsSet(LS.ASSESSMENTS, all)
  return all
}

// ── Notes ──────────────────────────────────────────────────────

export async function getNotes() {
  if (useApi()) return api('GET', '/notes')
  return lsGet(LS.NOTES) ?? []
}

export async function addNote(note) {
  if (useApi()) return api('POST', '/notes', note)
  const all = lsGet(LS.NOTES) ?? []
  const now = new Date().toISOString()
  const item = { ...note, id: note.id || uid(), createdAt: now, updatedAt: now }
  all.unshift(item)
  lsSet(LS.NOTES, all)
  return all
}

export async function updateNote(id, updates) {
  if (useApi()) return api('PUT', `/notes/${id}`, updates)
  const all = (lsGet(LS.NOTES) ?? []).map(n =>
    n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
  )
  lsSet(LS.NOTES, all)
  return all
}

export async function deleteNote(id) {
  if (useApi()) return api('DELETE', `/notes/${id}`)
  const all = (lsGet(LS.NOTES) ?? []).filter(n => n.id !== id)
  lsSet(LS.NOTES, all)
  return all
}

// ── Files ──────────────────────────────────────────────────────

export async function getFiles() {
  if (useApi()) return api('GET', '/files')
  return lsGet(LS.FILES) ?? []
}

export async function addFile(file) {
  if (useApi()) return api('POST', '/files', file)
  const all = lsGet(LS.FILES) ?? []
  const item = { ...file, id: file.id || uid(), uploadDate: new Date().toISOString() }
  all.unshift(item)
  lsSet(LS.FILES, all)
  return all
}

export async function deleteFile(id) {
  if (useApi()) return api('DELETE', `/files/${id}`)
  const all = (lsGet(LS.FILES) ?? []).filter(f => f.id !== id)
  lsSet(LS.FILES, all)
  return all
}

// ── Settings ───────────────────────────────────────────────────

export async function getSettings() {
  if (useApi()) return api('GET', '/settings')
  return lsGet(LS.SETTINGS) ?? { theme: 'dark' }
}

export async function saveSettings(settings) {
  if (useApi()) return api('POST', '/settings', settings)
  lsSet(LS.SETTINGS, settings)
  return settings
}

// ── Streak ─────────────────────────────────────────────────────

export async function getStreak() {
  if (useApi()) return api('GET', '/streak')
  return lsGet(LS.STREAK) ?? { current: 0, longest: 0, lastVisit: null }
}

export async function saveStreak(streak) {
  if (useApi()) return api('POST', '/streak', streak)
  lsSet(LS.STREAK, streak)
  return streak
}

// ── Export / Import / Clear ────────────────────────────────────

export async function exportAllData() {
  if (useApi()) return api('GET', '/data')
  return {
    courses:     lsGet(LS.COURSES)     ?? [],
    assessments: lsGet(LS.ASSESSMENTS) ?? [],
    notes:       lsGet(LS.NOTES)       ?? [],
    files:       lsGet(LS.FILES)       ?? [],
    settings:    lsGet(LS.SETTINGS)    ?? {},
    exportedAt:  new Date().toISOString(),
  }
}

export async function importAllData(data) {
  if (useApi()) return api('POST', '/import', data)
  const merge = (key, incoming) => {
    if (!incoming?.length) return
    const existing = lsGet(key) ?? []
    const ids = new Set(existing.map(x => x.id))
    lsSet(key, [...existing, ...incoming.filter(x => !ids.has(x.id))])
  }
  merge(LS.COURSES,     data.courses)
  merge(LS.ASSESSMENTS, data.assessments)
  merge(LS.NOTES,       data.notes)
  merge(LS.FILES,       data.files)
  if (data.settings) lsSet(LS.SETTINGS, data.settings)
}

export async function clearAllData() {
  if (useApi()) return api('DELETE', '/data')
  Object.values(LS).forEach(k => localStorage.removeItem(k))
}

export { useApi }
