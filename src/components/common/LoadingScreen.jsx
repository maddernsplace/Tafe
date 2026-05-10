import React from 'react'
import { GraduationCap } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-icon">
          <GraduationCap size={36} />
        </div>
        <h2 className="loading-title">TAFE Study Dashboard</h2>
        <div className="loading-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  )
}
