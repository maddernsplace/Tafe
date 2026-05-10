import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, BookOpen, Info } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatDateTime } from '../utils/dateUtils'

/**
 * STUDY ASSISTANT PAGE
 * ─────────────────────
 * This is a frontend-only placeholder. No API keys are used here.
 *
 * FUTURE AI INTEGRATION:
 * ─────────────────────────────────────────────────────────────────
 * To connect a real AI chatbot:
 *
 * 1. OpenAI Responses API + File Search:
 *    - Create a serverless function (e.g. Supabase Edge Function, Netlify Function, Cloudflare Worker)
 *    - The function receives the user's question and calls the OpenAI Responses API
 *    - Upload study notes and PDFs to an OpenAI Vector Store
 *    - Enable File Search tool so the model retrieves answers only from your documents
 *    - Never expose OPENAI_API_KEY in frontend code – keep it in the serverless function's env
 *
 * 2. RAG Architecture:
 *    - Chunk uploaded PDFs/notes into smaller text segments
 *    - Generate embeddings via OpenAI Embeddings API
 *    - Store embeddings in a vector database (Supabase pgvector, Pinecone, etc.)
 *    - At query time: embed the question → find similar chunks → inject into the prompt as context
 *    - Model answers using only retrieved context, refusing hallucinated answers
 *
 * 3. Backend endpoint placeholder:
 *    const response = await fetch('/api/chat', {
 *      method: 'POST',
 *      headers: { 'Content-Type': 'application/json' },
 *      body: JSON.stringify({ message: userInput, sessionId: '...' })
 *    })
 *    const { reply } = await response.json()
 */

const PLACEHOLDER_REPLIES = [
  "I'm a placeholder AI assistant. Connect me to OpenAI to answer questions from your study materials!",
  "Once connected to OpenAI + your uploaded notes, I'll search your PDFs and study notes to answer this accurately.",
  "Great question! When the AI backend is set up, I'll search your course materials before answering.",
  "I can see you have study materials uploaded. A real AI integration will let me search them for you.",
]

export default function StudyAssistant() {
  const { notes, files, courses } = useApp()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your TAFE Study Assistant. I'm currently in demo mode. Once connected to an AI backend, I'll be able to search your uploaded notes and files to answer your questions accurately.",
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')

    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    // Simulate a delay – replace this block with a real fetch() to your backend
    await new Promise(r => setTimeout(r, 1200))
    const reply = PLACEHOLDER_REPLIES[Math.floor(Math.random() * PLACEHOLDER_REPLIES.length)]
    setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date().toISOString() }])
    setIsTyping(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="page assistant-page">
      <div className="assistant-layout">
        {/* Sidebar – materials panel */}
        <aside className="assistant-sidebar">
          <h3 className="assistant-sidebar-title">Study Materials</h3>
          <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
            These will be searchable by AI once connected.
          </p>

          <div className="material-section">
            <p className="material-label">Notes ({notes.length})</p>
            {notes.slice(0, 6).map(n => (
              <div key={n.id} className="material-item">
                <BookOpen size={12} />
                <span>{n.title}</span>
              </div>
            ))}
            {notes.length > 6 && <p className="text-muted" style={{ fontSize: '0.75rem' }}>+{notes.length - 6} more</p>}
          </div>

          <div className="material-section">
            <p className="material-label">Files ({files.length})</p>
            {files.slice(0, 6).map(f => (
              <div key={f.id} className="material-item">
                <BookOpen size={12} />
                <span>{f.name}</span>
              </div>
            ))}
            {files.length > 6 && <p className="text-muted" style={{ fontSize: '0.75rem' }}>+{files.length - 6} more</p>}
          </div>

          <div className="assistant-info-box">
            <Info size={14} />
            <p>AI integration coming soon. See code comments for setup instructions.</p>
          </div>
        </aside>

        {/* Chat panel */}
        <div className="assistant-chat">
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                <div className="chat-avatar">
                  {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                </div>
                <div className="chat-bubble">
                  <p className="chat-text">{msg.content}</p>
                  <p className="chat-time">{formatDateTime(msg.timestamp)}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message assistant">
                <div className="chat-avatar"><Bot size={18} /></div>
                <div className="chat-bubble typing-indicator">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-bar">
            <textarea
              ref={inputRef}
              className="chat-input"
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your study materials…"
            />
            <button className="btn btn-primary send-btn" onClick={sendMessage} disabled={!input.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
