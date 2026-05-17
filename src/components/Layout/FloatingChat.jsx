import React, { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Maximize2, AlertCircle, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import ReactMarkdown from 'react-markdown'

const WELCOME = "Hi! Ask me anything about your studies. For full context controls (notes, files, assessments) open the Study Assistant page."

export default function FloatingChat() {
  const { isApiMode } = useApp()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [configured, setConfigured] = useState(null)

  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isApiMode) {
      fetch('/api/ai/status')
        .then(r => r.json())
        .then(d => setConfigured(d.configured))
        .catch(() => setConfigured(false))
    }
  }, [isApiMode])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

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
          context: {},
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
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  // Don't show if AI not available
  if (!isApiMode || configured === false) return null

  return (
    <>
      {/* Backdrop on mobile */}
      {open && <div className="fc-backdrop" onClick={() => setOpen(false)} />}

      {/* Slide-out panel */}
      <div className={`fc-panel ${open ? 'fc-panel-open' : ''}`}>
        {/* Header */}
        <div className="fc-header">
          <div className="fc-header-left">
            <Bot size={16} className="fc-header-icon" />
            <span className="fc-header-title">Study Assistant</span>
          </div>
          <div className="fc-header-actions">
            <button
              className="icon-btn fc-expand-btn"
              title="Open full assistant"
              onClick={() => { setOpen(false); navigate('/assistant') }}
            >
              <Maximize2 size={15} />
            </button>
            <button className="icon-btn" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="fc-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`fc-msg fc-msg-${msg.role}`}>
              <div className="fc-avatar">
                {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
              </div>
              <div className="fc-bubble">
                {msg.role === 'assistant'
                  ? <div className="fc-markdown"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                  : <p>{msg.content}</p>}
              </div>
            </div>
          ))}
          {loading && (
            <div className="fc-msg fc-msg-assistant">
              <div className="fc-avatar"><Bot size={14} /></div>
              <div className="fc-bubble typing-indicator"><span /><span /><span /></div>
            </div>
          )}
          {error && (
            <div className="fc-error">
              <AlertCircle size={13} />
              <span>{error}</span>
              <button className="icon-btn" onClick={() => setError(null)}><X size={12} /></button>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="fc-input-bar">
          <textarea
            ref={inputRef}
            className="fc-input"
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything… (Enter to send)"
            disabled={loading}
          />
          <button
            className="btn btn-primary fc-send-btn"
            onClick={sendMessage}
            disabled={!input.trim() || loading}
          >
            <Send size={15} />
          </button>
        </div>
      </div>

      {/* FAB button */}
      <button
        className={`fc-fab ${open ? 'fc-fab-active' : ''}`}
        onClick={() => setOpen(v => !v)}
        title="Open Study Assistant"
        aria-label="Open Study Assistant"
      >
        {open ? <X size={22} /> : <Bot size={22} />}
      </button>
    </>
  )
}
