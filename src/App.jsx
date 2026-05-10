import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Layout from './components/Layout/Layout'
import LoadingScreen from './components/common/LoadingScreen'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import CoursePage from './pages/CoursePage'
import Assessments from './pages/Assessments'
import StudyNotes from './pages/StudyNotes'
import FileLibrary from './pages/FileLibrary'
import StudyAssistant from './pages/StudyAssistant'
import Settings from './pages/Settings'

export default function App() {
  const { ready } = useApp()

  if (!ready) return <LoadingScreen />

  return (
    <Layout>
      <Routes>
        <Route path="/"           element={<Dashboard />} />
        <Route path="/courses"    element={<Courses />} />
        <Route path="/courses/:id" element={<CoursePage />} />
        <Route path="/assessments" element={<Assessments />} />
        <Route path="/notes"      element={<StudyNotes />} />
        <Route path="/files"      element={<FileLibrary />} />
        <Route path="/assistant"  element={<StudyAssistant />} />
        <Route path="/settings"   element={<Settings />} />
        <Route path="*"           element={<Dashboard />} />
      </Routes>
    </Layout>
  )
}
