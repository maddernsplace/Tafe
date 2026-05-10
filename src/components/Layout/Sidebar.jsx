import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, ClipboardList, FileText,
  FolderOpen, Bot, Settings, X, GraduationCap, Flame,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/assessments', label: 'Assessments', icon: ClipboardList },
  { to: '/notes', label: 'Study Notes', icon: FileText },
  { to: '/files', label: 'File Library', icon: FolderOpen },
  { to: '/assistant', label: 'Study Assistant', icon: Bot },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ open, onClose }) {
  const { streak } = useApp()

  return (
    <>
      {/* Mobile backdrop */}
      {open && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <GraduationCap size={28} className="brand-icon" />
          <div className="brand-text">
            <span className="brand-title">TAFE</span>
            <span className="brand-sub">Study Dashboard</span>
          </div>
          <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* Streak widget */}
        {streak.current > 0 && (
          <div className="streak-widget">
            <Flame size={16} className="streak-icon" />
            <span className="streak-label">{streak.current} day streak</span>
          </div>
        )}

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              onClick={onClose}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-footer-text">TAFE Study Dashboard v1.0</p>
        </div>
      </aside>
    </>
  )
}
