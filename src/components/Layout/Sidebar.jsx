import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, ClipboardList, FileText,
  FolderOpen, Bot, Settings, X, GraduationCap, Flame, NotebookPen,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

const MAIN_NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/assessments', label: 'Assessments', icon: ClipboardList },
  { to: '/notes', label: 'Study Notes', icon: FileText },
  { to: '/files', label: 'File Library', icon: FolderOpen },
  { to: '/assistant', label: 'Study Assistant', icon: Bot },
  { to: '/reflections', label: 'Reflections', icon: NotebookPen },
]

export default function Sidebar({ open, onClose }) {
  const { streak } = useApp()

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon">
            <GraduationCap size={20} />
          </div>
          <div className="brand-text">
            <span className="brand-title">TAFE Dashboard</span>
            <span className="brand-sub">Study Vault</span>
          </div>
          <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        {/* Streak */}
        {streak.current > 0 && (
          <div className="streak-widget">
            <Flame size={15} className="streak-icon" />
            <span className="streak-label">{streak.current} day study streak 🔥</span>
          </div>
        )}

        {/* Main Nav */}
        <nav className="sidebar-nav">
          <span className="nav-section-label">Menu</span>
          {MAIN_NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              onClick={onClose}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="sidebar-divider" />

          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            onClick={onClose}
          >
            <Settings size={17} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-footer-text">TAFE Study Dashboard v1.0</p>
        </div>
      </aside>
    </>
  )
}
