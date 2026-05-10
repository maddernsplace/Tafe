import React from 'react'
import { Menu, Sun, Moon, Bell } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useApp } from '../../context/AppContext'
import { isOverdue, isDueSoon } from '../../utils/dateUtils'

export default function Header({ onMenuClick, pageTitle }) {
  const { theme, toggleTheme } = useTheme()
  const { assessments } = useApp()

  const overdueCount = assessments.filter(
    a => a.status !== 'Completed' && a.status !== 'Submitted' && isOverdue(a.dueDate)
  ).length
  const dueSoonCount = assessments.filter(
    a => a.status !== 'Completed' && a.status !== 'Submitted' && !isOverdue(a.dueDate) && isDueSoon(a.dueDate)
  ).length
  const alertCount = overdueCount + dueSoonCount

  return (
    <header className="header">
      <div className="header-left">
        <button className="icon-btn menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <h1 className="header-title">{pageTitle}</h1>
      </div>
      <div className="header-right">
        {alertCount > 0 && (
          <div className="header-alert" title={`${overdueCount} overdue, ${dueSoonCount} due soon`}>
            <Bell size={18} />
            <span className="alert-badge">{alertCount}</span>
          </div>
        )}
        <button className="icon-btn theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  )
}
