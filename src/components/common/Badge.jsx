import React from 'react'

const STATUS_STYLES = {
  'Not Started': 'badge-neutral',
  'In Progress': 'badge-blue',
  'Submitted': 'badge-green',
  'Resubmit Required': 'badge-orange',
  'Completed': 'badge-success',
  'active': 'badge-green',
  'inactive': 'badge-neutral',
  'overdue': 'badge-red',
  'due-soon': 'badge-orange',
}

export default function Badge({ label, className = '' }) {
  const style = STATUS_STYLES[label] || 'badge-neutral'
  return (
    <span className={`badge ${style} ${className}`}>{label}</span>
  )
}
