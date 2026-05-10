import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, ClipboardList, FileText, FolderOpen } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/assessments', label: 'Assess', icon: ClipboardList },
  { to: '/notes', label: 'Notes', icon: FileText },
  { to: '/files', label: 'Files', icon: FolderOpen },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <div className="bottom-nav-icon">
              <item.icon size={20} />
            </div>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
