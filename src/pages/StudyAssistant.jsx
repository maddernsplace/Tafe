import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, BookOpen, ClipboardList, FolderOpen, Sparkles, AlertCircle, X, Save, CheckCircle, ChevronDown, ChevronUp, FileText, File, Image } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ReactMarkdown from 'react-markdown'

function fileIcon(type) {
  if (!type) return File
  if (type.includes('pdf')) return FileText
  if (type.startsWith('image/')) return Image
  return File
}

function ItemCheckbox({ id, label, subLabel, checked, onChange }) {
  return (
    <label className="context-item-row">
      <input type="checkbox" checked={checked} onChange={e => onChange(id, e.target.checked)} />
      <span className="context-item-label">{label}</span>
      {subLabel && <span className="context-item-sub">{subLabel}</span>}
    </label>
  )
}

export default function StudyAssistant() {
  const { notes, assessments, files, courses, addNote, isApiMode } = useApp()

  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hi! I'm your TAFE Study Assistant. Select a course in the sidebar, tick the items you want me to read, then ask me anything.",
  }])
  const [input, setInput]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [configured, setConfigured] = useState(null)
  const [savedMsg, setSavedMsg]     = useState(false)

  // Per-item selection
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedNotes, setSelectedNotes]   = useState(new Set())
  const [selectedFiles, setSelectedFiles]   = useState(new Set())
  const [selectedAssessments, setSelectedAssessments] = useState(new Set())

  // Other-courses picker
  const [showOther, setShowOther] = useState(false)
  const [otherCourse, setOtherCourse] = useState('')

  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    if (isApiMode) {
      fetch('/api/ai/status').then(r => r.json()).then(d => setConfigured(d.configured)).catch(() => setConfigured(false))
    }
  }, [isApiMode])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Reset selections when main course changes
  const handleCourseChange = e => {
    setSelectedCourse(e.target.value)
    setSelectedNotes(new Set())
    setSelectedFiles(new Set())
    setSelectedAssessments(new Set())
    setShowOther(false)
    setOtherCourse('')
  }

  const toggle = (setter, id, checked) => {
    setter(prev => {
      const next = new Set(prev)
      checked ? next.add(id) : next.delete(id)
      return next
    })
  }

  const selectAll = (items, setter) => {
    setter(new Set(items.map(i => i.id)))
  }
  const clearAll = setter => setter(new Set())

  // Items for selected course
  const courseNotes       = notes.filter(n => n.courseId === selectedCourse)
  const courseFiles       = files.filter(f => f.courseId === selectedCourse)
  const courseAssessments = assessments.filter(a => a.courseId === selectedCourse)

  // Items for the "other course" picker
  const otherNotes       = otherCourse ? notes.filter(n => n.courseId === otherCourse)       : []
  const otherFiles       = otherCourse ? files.filter(f => f.courseId === otherCourse)       : []
  const otherAssessments = otherCourse ? assessments.filter(a => a.courseId === otherCourse) : []

  const totalSelected = selectedNotes.size + selectedFiles.size + selectedAssessments.size

  const getContext = () => ({
    notes:       notes.filter(n => selectedNotes.has(n.id)),
    assessments: assessments.filter(a => selectedAssessments.has(a.id)),
    files:       files.filter(f => selectedFiles.has(f.id)),
    courses,
  })

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setError(null)
    const userMsg = { role: 'user', content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
          context: getContext(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setError(err.message)
      setMessages(prev => prev.slice(0, -1))
      setInput(text)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const handleClearChat = () => {
    setMessages([{ role: 'assistant', content: "Chat cleared. What would you like to talk about?" }])
    setError(null)
    setSavedMsg(false)
  }

  const saveChat = async () => {
    if (!messages.filter(m => m.role === 'user').length) return
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const timeStr = now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
    const course = courses.find(c => c.id === selectedCourse)
    const content = messages
      .filter((m, i) => !(m.role === 'assistant' && i === 0))
      .map(m => `**${m.role === 'user' ? 'Me' : 'AI Assistant'}:** ${m.content}`)
      .join('\n\n')
    await addNote({
      title: `AI Chat — ${dateStr} ${timeStr}`,
      content,
      courseId: course?.id || '',
      courseCode: course?.code || '',
      tags: ['ai-chat'],
    })
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 3000)
  }

  const quickPrompts = [
    'Summarise my selected notes',
    'What assessments are coming up?',
    'Help me understand my upcoming assessment',
    'Give me a study plan for this week',
  ]

  if (!isApiMode) return (
    <div className="page"><div className="empty-state"><Bot size={48} /><h3>AI Assistant — Desktop Only</h3><p>Not available in browser mode.</p></div></div>
  )

  if (configured === false) return (
    <div className="page"><div className="empty-state"><Bot size={48} /><h3>OpenAI API Key Not Set</h3><p>Go to <strong>Settings → AI Study Assistant</strong> to add your key.</p></div></div>
  )

  return (
    <div className="page assistant-page">
      <div className="assistant-layout">

        {/* Sidebar */}
        <aside className="assistant-sidebar">
          <h3 className="assistant-sidebar-title">Course Context</h3>

          {/* Course picker */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Select course</label>
            <select className="form-input" value={selectedCourse} onChange={handleCourseChange}>
              <option value="">— Choose a course —</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
            </select>
          </div>

          {selectedCourse && (
            <>
              {/* Files */}
              {courseFiles.length > 0 && (
                <div className="context-section">
                  <div className="context-section-header">
                    <span><FolderOpen size={13} /> Files ({courseFiles.length})</span>
                    <div className="context-section-actions">
                      <button onClick={() => selectAll(courseFiles, setSelectedFiles)}>All</button>
                      <button onClick={() => clearAll(setSelectedFiles)}>None</button>
                    </div>
                  </div>
                  {courseFiles.map(f => {
                    const FIcon = fileIcon(f.type)
                    return (
                      <ItemCheckbox key={f.id} id={f.id} label={f.name}
                        checked={selectedFiles.has(f.id)}
                        onChange={(id, checked) => toggle(setSelectedFiles, id, checked)} />
                    )
                  })}
                </div>
              )}

              {/* Notes */}
              {courseNotes.length > 0 && (
                <div className="context-section">
                  <div className="context-section-header">
                    <span><BookOpen size={13} /> Notes ({courseNotes.length})</span>
                    <div className="context-section-actions">
                      <button onClick={() => selectAll(courseNotes, setSelectedNotes)}>All</button>
                      <button onClick={() => clearAll(setSelectedNotes)}>None</button>
                    </div>
                  </div>
                  {courseNotes.map(n => (
                    <ItemCheckbox key={n.id} id={n.id} label={n.title}
                      checked={selectedNotes.has(n.id)}
                      onChange={(id, checked) => toggle(setSelectedNotes, id, checked)} />
                  ))}
                </div>
              )}

              {/* Assessments */}
              {courseAssessments.length > 0 && (
                <div className="context-section">
                  <div className="context-section-header">
                    <span><ClipboardList size={13} /> Assessments ({courseAssessments.length})</span>
                    <div className="context-section-actions">
                      <button onClick={() => selectAll(courseAssessments, setSelectedAssessments)}>All</button>
                      <button onClick={() => clearAll(setSelectedAssessments)}>None</button>
                    </div>
                  </div>
                  {courseAssessments.map(a => (
                    <ItemCheckbox key={a.id} id={a.id} label={a.title} subLabel={a.status}
                      checked={selectedAssessments.has(a.id)}
                      onChange={(id, checked) => toggle(setSelectedAssessments, id, checked)} />
                  ))}
                </div>
              )}

              {courseFiles.length === 0 && courseNotes.length === 0 && courseAssessments.length === 0 && (
                <p className="settings-desc">No items added to this course yet.</p>
              )}

              {/* Add from other courses */}
              <div className="context-other-section">
                <button className="context-other-toggle" onClick={() => setShowOther(v => !v)}>
                  {showOther ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  Add from another course
                </button>
                {showOther && (
                  <div style={{ marginTop: 8 }}>
                    <select className="form-input" style={{ marginBottom: 10 }} value={otherCourse}
                      onChange={e => setOtherCourse(e.target.value)}>
                      <option value="">— Choose course —</option>
                      {courses.filter(c => c.id !== selectedCourse).map(c =>
                        <option key={c.id} value={c.id}>{c.code}</option>
                      )}
                    </select>
                    {otherCourse && (
                      <>
                        {otherFiles.map(f => (
                          <ItemCheckbox key={f.id} id={f.id} label={f.name} subLabel="file"
                            checked={selectedFiles.has(f.id)}
                            onChange={(id, checked) => toggle(setSelectedFiles, id, checked)} />
                        ))}
                        {otherNotes.map(n => (
                          <ItemCheckbox key={n.id} id={n.id} label={n.title} subLabel="note"
                            checked={selectedNotes.has(n.id)}
                            onChange={(id, checked) => toggle(setSelectedNotes, id, checked)} />
                        ))}
                        {otherAssessments.map(a => (
                          <ItemCheckbox key={a.id} id={a.id} label={a.title} subLabel="assessment"
                            checked={selectedAssessments.has(a.id)}
                            onChange={(id, checked) => toggle(setSelectedAssessments, id, checked)} />
                        ))}
                        {otherFiles.length === 0 && otherNotes.length === 0 && otherAssessments.length === 0 && (
                          <p className="settings-desc">Nothing added to this course yet.</p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Quick prompts */}
          <div style={{ marginTop: 16 }}>
            <p className="material-label" style={{ marginBottom: 8 }}>Quick prompts</p>
            {quickPrompts.map(p => (
              <button key={p} className="quick-prompt-btn" onClick={() => { setInput(p); inputRef.current?.focus() }}>
                <Sparkles size={11} /> {p}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={saveChat}
              disabled={messages.filter(m => m.role === 'user').length === 0}>
              {savedMsg ? <><CheckCircle size={14} /> Saved!</> : <><Save size={14} /> Save Chat as Note</>}
            </button>
            <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={handleClearChat}>
              Clear chat
            </button>
          </div>
        </aside>

        {/* Chat */}
        <div className="assistant-chat">
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                <div className="chat-avatar">
                  {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                </div>
                <div className="chat-bubble">
                  {msg.role === 'assistant'
                    ? <div className="chat-markdown"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                    : <p className="chat-text">{msg.content}</p>}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message assistant">
                <div className="chat-avatar"><Bot size={18} /></div>
                <div className="chat-bubble typing-indicator"><span /><span /><span /></div>
              </div>
            )}
            {error && (
              <div className="chat-error">
                <AlertCircle size={15} />
                <span>{error}</span>
                <button className="icon-btn" onClick={() => setError(null)}><X size={13} /></button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-bar">
            {totalSelected > 0 && (
              <div className="chat-context-badges">
                {selectedFiles.size > 0 && <span className="badge badge-blue">{selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''}</span>}
                {selectedNotes.size > 0 && <span className="badge badge-blue">{selectedNotes.size} note{selectedNotes.size !== 1 ? 's' : ''}</span>}
                {selectedAssessments.size > 0 && <span className="badge badge-blue">{selectedAssessments.size} assessment{selectedAssessments.size !== 1 ? 's' : ''}</span>}
              </div>
            )}
            <div className="chat-input-row">
              <textarea ref={inputRef} className="chat-input" rows={1} value={input}
                onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Ask anything… (Enter to send, Shift+Enter for new line)"
                disabled={loading} />
              <button className="btn btn-primary send-btn" onClick={sendMessage} disabled={!input.trim() || loading}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
