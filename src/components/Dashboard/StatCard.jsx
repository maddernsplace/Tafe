import React from 'react'

export default function StatCard({ icon: Icon, label, value, colour, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${colour}22`, color: colour }}>
        <Icon size={22} />
      </div>
      <div className="stat-body">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
        {sub && <span className="stat-sub">{sub}</span>}
      </div>
    </div>
  )
}
