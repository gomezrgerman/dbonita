'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, ExternalLink } from 'lucide-react'
import { getChatResponse, INITIAL_MESSAGE, WHATSAPP_URL, type ChatResponse } from '@/lib/chatbot'

interface Message {
  id: string
  role: 'bot' | 'user'
  text: string
  quickReplies?: string[]
  showWhatsApp?: boolean
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setTyping(true)
      const timer = setTimeout(() => {
        setMessages([
          {
            id: 'init',
            role: 'bot',
            text: INITIAL_MESSAGE.text,
            quickReplies: INITIAL_MESSAGE.quickReplies,
            showWhatsApp: INITIAL_MESSAGE.showWhatsApp,
          },
        ])
        setTyping(false)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, typing])

  const sendMessage = (text: string) => {
    if (!text.trim()) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      const response: ChatResponse = getChatResponse(text)
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        text: response.text,
        quickReplies: response.quickReplies,
        showWhatsApp: response.showWhatsApp,
      }
      setMessages((prev) => [...prev, botMsg])
      setTyping(false)
    }, 800 + Math.random() * 600)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const formatText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-6 lg:bottom-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110"
          style={{
            background: 'var(--color-brand-blue)',
            boxShadow: '0 4px 16px rgba(108,196,230,0.35), 0 0 0 0 rgba(108,196,230,0.1)',
          }}
          aria-label="Abrir chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 lg:bottom-6 z-50 flex flex-col w-[calc(100vw-3rem)] max-w-[380px]"
          style={{
            height: 'min(600px, calc(100vh - 8rem))',
            borderRadius: '20px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.15), 0 0 0 1px var(--color-accent)',
            background: 'var(--color-bg)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 shrink-0"
            style={{
              borderBottom: '1px solid var(--color-accent)',
              borderRadius: '20px 20px 0 0',
              background: '#000',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--color-pomegranate)' }}
              >
                <MessageCircle size={16} color="#fff" />
              </div>
              <div>
                <p className="text-sm text-white" style={{ fontWeight: 700 }}>
                  D Bonita
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Asistente virtual
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.15)' }}
              aria-label="Cerrar chat"
            >
              <X size={16} color="#fff" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] flex flex-col gap-2 ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className="px-4 py-3 text-sm leading-relaxed"
                    style={{
                      borderRadius: msg.role === 'user'
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                      background: msg.role === 'user' ? '#000' : 'var(--color-surface, #fff)',
                      color: msg.role === 'user' ? '#fff' : 'var(--color-text)',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--color-accent)',
                      fontWeight: 400,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {formatText(msg.text)}
                  </div>

                  {/* Quick replies */}
                  {msg.role === 'bot' && msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.quickReplies.map((qr) => (
                        <button
                          key={qr}
                          onClick={() => sendMessage(qr)}
                          className="px-3 py-1.5 text-xs rounded-full transition-all duration-200"
                          style={{
                            background: 'var(--color-surface, #fff)',
                            border: '1px solid var(--color-accent)',
                            color: 'var(--color-text)',
                            fontWeight: 500,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#000'
                            e.currentTarget.style.color = '#fff'
                            e.currentTarget.style.borderColor = '#000'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--color-surface, #fff)'
                            e.currentTarget.style.color = 'var(--color-text)'
                            e.currentTarget.style.borderColor = 'var(--color-accent)'
                          }}
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* WhatsApp button */}
                  {msg.role === 'bot' && msg.showWhatsApp && (
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs text-white rounded-xl transition-all duration-200"
                      style={{ background: '#25D366', fontWeight: 600 }}
                    >
                      <ExternalLink size={12} />
                      Hablar por WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-3 rounded-2xl"
                  style={{ background: 'var(--color-surface, #fff)', border: '1px solid var(--color-accent)' }}
                >
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-text-muted)', animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-text-muted)', animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-text-muted)', animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-4 py-3 shrink-0"
            style={{ borderTop: '1px solid var(--color-accent)' }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-white text-black placeholder:text-text-muted/50 focus:outline-none transition-colors duration-200"
              style={{
                fontWeight: 400,
                border: '1px solid var(--color-accent)',
                boxShadow: 'var(--shadow-clay)',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#000' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0"
              style={{
                background: input.trim() ? '#000' : 'var(--color-accent)',
                color: input.trim() ? '#fff' : 'var(--color-text-muted)',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
              }}
              aria-label="Enviar"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}