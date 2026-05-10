import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/courses': 'Courses',
  '/assessments': 'Assessments',
  '/notes': 'Study Notes',
  '/files': 'File Library',
  '/assistant': 'Study Assistant',
  '/settings': 'Settings',
}

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const title = (() => {
    if (location.pathname.startsWith('/courses/')) return 'Course Details'
    return PAGE_TITLES[location.pathname] || 'TAFE Dashboard'
  })()

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Header onMenuClick={() => setSidebarOpen(true)} pageTitle={title} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  )
}
