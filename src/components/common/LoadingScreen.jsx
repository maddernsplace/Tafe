import React from 'react'

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-icon">
          <img src="/logo.svg" alt="StudyForge" width="40" height="40" style={{ display: 'block' }} />
        </div>
        <h2 className="loading-title">StudyForge</h2>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: -8 }}>Your Smart Study Hub</p>
        <div className="loading-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  )
}
