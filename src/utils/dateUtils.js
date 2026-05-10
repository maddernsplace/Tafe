// Australian date utilities – DD/MM/YYYY format throughout the app

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return '—'
  return d.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return '—'
  return d.toLocaleString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isOverdue(dueDateStr) {
  if (!dueDateStr) return false
  const due = new Date(dueDateStr)
  due.setHours(23, 59, 59, 999)
  return due < new Date()
}

export function isDueSoon(dueDateStr, days = 7) {
  if (!dueDateStr) return false
  const due = new Date(dueDateStr)
  due.setHours(23, 59, 59, 999)
  const now = new Date()
  const soon = new Date()
  soon.setDate(now.getDate() + days)
  return due >= now && due <= soon
}

export function daysUntilDue(dueDateStr) {
  if (!dueDateStr) return null
  const due = new Date(dueDateStr)
  due.setHours(23, 59, 59, 999)
  const now = new Date()
  const diff = due - now
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function toInputDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  return d.toISOString().split('T')[0]
}

export function todayISO() {
  return new Date().toISOString().split('T')[0]
}
