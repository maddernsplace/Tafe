import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, BookOpen, ClipboardList, FolderOpen, Sparkles, AlertCircle, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ReactMarkdown from 'react-markdown'

export default function StudyAssistant() {
  const { notes, assessments, files, courses, isApiMode } = useApp()

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your TAFE Study Assistant powered by GPT-4. Ask me anything about your studies — I can answer general questions, or include your notes and assessments as context so I can give you more specific help.",
    },
  ])
  const [input, setInput]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [includeNotes, setIncludeNotes]             = useState(false)
  const [includeAssessments, setIncludeAssessments] = useState(false)
  const [includeFiles, setIncludeFiles]             = useState(false)
  const [selectedCourse, setSelectedCourse]         = useState('all')
  const [configured, setConfigured] = useState(null)

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

  const getContext = () => {
    const courseFilter = c => selectedCourse === 'all' || c.courseId === selectedCourse
    return {
      notes:       includeNotes       ? notes.filter(courseFilter)       : [],
      assessments: includeAssessments ? assessments.filter(courseFilter) : [],
      files:       includeFiles       ? files.filter(courseFilter)       : [],
      courses:     courses,
    }
  }

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

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared. What would you like to talk about?",
    }])
    setError(null)
  }

  const quickPrompts = [
    'Summarise my notes for me',
    'What assessments are coming up?',
    'Help me understand my upcoming assessment',
    'Give me a study plan for this week',
  ]

  if (!isApiMode) {
    return (
      <div className="page">
        <div className="empty-state">
          <Bot size={48} />
          <h3>AI Assistant — Desktop Only</h3>
          <p>The AI assistant requires the Electron desktop app. It is not available in browser mode.</p>
        </div>
      </div>
    )
  }

  if (configured === false) {
    return (
      <div className="page">
        <div className="empty-state">
          <Bot size={48} />
          <h3>OpenAI API Key Not Set</h3>
          <p>Go to <strong>Settings → AI Study Assistant</strong> and enter your OpenAI API key to get started.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page assistant-page">
      <div className="assistant-layout">

        {/* Context sidebar */}
        <aside className="assistant-sidebar">
          <h3 className="assistant-sidebar-title">Context</h3>
          <p className="settings-desc" style={{ marginBottom: 12 }}>
            Include your data in each message so the AI can reference it.
          </p>

          <div className="form-group" style={{ marginBottom: 12 }}>
            <label>Filter by course</label>
            <select className="form-input" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
              <option value="all">All courses</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
            </select>
          </div>

          <label className="context-toggle">
            <input type="checkbox" checked={includeNotes} onChange={e => setIncludeNotes(e.target.checked)} />
            <BookOpen size={14} />
            <span>Include notes ({notes.filter(n => selectedCourse === 'all' || n.courseId === selectedCourse).length})</span>
          </label>

          <label className="context-toggle">
            <input type="checkbox" checked={includeAssessments} onChange={e => setIncludeAssessments(e.target.checked)} />
            <ClipboardList size={14} />
            <span>Include assessments ({assessments.filter(a => selectedCourse === 'all' || a.courseId === selectedCourse).length})</span>
          </label>

          <label className="context-toggle">
            <input type="checkbox" checked={includeFiles} onChange={e => setIncludeFiles(e.target.checked)} />
            <FolderOpen size={14} />
            <span>Include files ({files.filter(f => selectedCourse === 'all' || f.courseId === selectedCourse).length})</span>
          </label>

          <div style={{ marginTop: 20 }}>
            <p className="material-label" style={{ marginBottom: 8 }}>Quick prompts</p>
            {quickPrompts.map(p => (
              <button key={p} className="quick-prompt-btn" onClick={() => { setInput(p); inputRef.current?.focus() }}>
                <Sparkles size={11} /> {p}
              </button>
            ))}
          </div>

          <button className="btn btn-ghost btn-sm" style={{ marginTop: 16, width: '100%' }} onClick={clearChat}>
            Clear chat
          </button>
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
                    : <p className="chat-text">{msg.content}</p>
                  }
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
            {(includeNotes || includeAssessments || includeFiles) && (
              <div className="chat-context-badges">
                {includeNotes && <span className="badge badge-blue">+ notes</span>}
                {includeAssessments && <span className="badge badge-blue">+ assessments</span>}
                {includeFiles && <span className="badge badge-blue">+ files</span>}
              </div>
            )}
            <div className="chat-input-row">
              <textarea
                ref={inputRef}
                className="chat-input"
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything… (Enter to send, Shift+Enter for new line)"
                disabled={loading}
              />
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
