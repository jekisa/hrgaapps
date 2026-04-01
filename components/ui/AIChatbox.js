'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Wand2, User, ArrowUp, RotateCcw, ChevronDown, ChevronRight, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const TOOL_LABELS = {
  get_dashboard_stats: 'Mengambil statistik dashboard',
  get_karyawan_data: 'Mengambil data karyawan',
  get_aset_data: 'Mengambil data aset',
  get_kendaraan_data: 'Mengambil data kendaraan',
  get_gedung_data: 'Mengambil data gedung & fasilitas',
}

const SUGGESTED_PROMPTS = [
  'Dashboard hari ini',
  'Berapa karyawan aktif?',
  'Karyawan yang kontraknya berakhir dalam 30 hari?',
  'Kendaraan apa yang tersedia?',
  'Aset apa yang sedang dipinjam?',
  'Ada maintenance apa yang pending?',
]

function MarkdownText({ text }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />
        const bulletMatch = line.match(/^[-•*]\s+(.+)/)
        if (bulletMatch) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-violet-400 mt-0.5 shrink-0 text-xs">◆</span>
              <span>{renderInline(bulletMatch[1])}</span>
            </div>
          )
        }
        const numMatch = line.match(/^(\d+)\.\s+(.+)/)
        if (numMatch) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-violet-400 shrink-0 font-bold text-xs">{numMatch[1]}.</span>
              <span>{renderInline(numMatch[2])}</span>
            </div>
          )
        }
        const headerMatch = line.match(/^#{1,3}\s+(.+)/)
        if (headerMatch) {
          return <p key={i} className="font-semibold text-gray-900">{renderInline(headerMatch[1])}</p>
        }
        return <p key={i}>{renderInline(line)}</p>
      })}
    </div>
  )
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-gradient-to-br from-violet-400 to-blue-400"
          style={{
            animation: 'dotBounce 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  )
}

function AIAvatar({ size = 'sm' }) {
  const sz = size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'
  const icon = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <div className={cn('relative shrink-0', sz)}>
      <div className={cn(
        'w-full h-full rounded-xl bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500',
        'flex items-center justify-center shadow-md shadow-violet-500/30'
      )}>
        <Wand2 className={cn('text-white', icon)} />
      </div>
      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
    </div>
  )
}

export default function AIChatbox() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Halo! Saya AI Assistant anda. Tanyakan apa saja tentang data karyawan, aset, kendaraan, atau fasilitas gedung.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [toolStatus, setToolStatus] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const chatWindowRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (open) {
      scrollToBottom()
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open, scrollToBottom])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e) => {
      if (chatWindowRef.current && !chatWindowRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    scrollToBottom()
  }, [messages, toolStatus, scrollToBottom])

  const sendMessage = useCallback(async (text) => {
    const userText = (text || input).trim()
    if (!userText || loading) return

    setInput('')
    setLoading(true)
    setToolStatus('')

    const userMsg = { role: 'user', text: userText }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)

    const apiMessages = updatedMessages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.text }))

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let finalText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue
          let event
          try { event = JSON.parse(raw) } catch { continue }
          if (event.type === 'tool_start') setToolStatus(TOOL_LABELS[event.tool] || 'Mengambil data')
          else if (event.type === 'text') finalText = event.text
          else if (event.type === 'error') throw new Error(event.message)
          else if (event.type === 'done') setToolStatus('')
        }
      }

      if (finalText) {
        setMessages((prev) => [...prev, { role: 'assistant', text: finalText, isNew: true }])
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Maaf, terjadi kesalahan: ${err.message}. Coba lagi beberapa saat.`, error: true, isNew: true },
      ])
    } finally {
      setLoading(false)
      setToolStatus('')
    }
  }, [input, messages, loading])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      text: 'Halo! Saya AI Assistant anda. Tanyakan apa saja tentang data karyawan, aset, kendaraan, atau fasilitas gedung.',
    }])
    setInput('')
    setToolStatus('')
  }

  return (
    <>
      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes messageSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes buttonFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4), 0 8px 32px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 0 8px rgba(139, 92, 246, 0), 0 8px 32px rgba(139, 92, 246, 0.5); }
        }
        @keyframes shimmerBar {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8px, -8px) scale(1.1); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-6px, 6px) scale(0.95); }
        }
        .msg-new { animation: messageSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .btn-float { animation: buttonFloat 3s ease-in-out infinite; }
        .btn-glow { animation: glowPulse 2.5s ease-in-out infinite; }
        .shimmer-bar {
          background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 30%, #06b6d4 50%, #3b82f6 70%, #8b5cf6 100%);
          background-size: 200% auto;
          animation: shimmerBar 2s linear infinite;
        }
        .orb-1 { animation: orb1 6s ease-in-out infinite; }
        .orb-2 { animation: orb2 8s ease-in-out infinite; }
        .chat-window-enter {
          animation: chatWindowIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes chatWindowIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl',
          'bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500',
          'flex items-center justify-center text-white',
          'transition-all duration-300 hover:scale-110 hover:rounded-xl',
          'btn-float btn-glow',
          open && 'opacity-0 pointer-events-none scale-75'
        )}
        aria-label="Buka AI Assistant"
      >
        <Wand2 className="w-6 h-6 drop-shadow" />
      </button>

      {/* Chat window */}
      <div
        ref={chatWindowRef}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl overflow-hidden',
          'w-[370px] sm:w-[410px] h-[600px] max-h-[88vh]',
          'shadow-2xl shadow-violet-500/20 border border-white/10',
          open ? 'chat-window-enter' : 'opacity-0 scale-90 pointer-events-none translate-y-4',
          !open && 'transition-all duration-200'
        )}
        style={{ background: '#fafafa' }}
      >
        {/* ── Header ── */}
        <div className="relative overflow-hidden shrink-0" style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1040 50%, #0a1628 100%)' }}>
          {/* Animated orbs */}
          <div className="orb-1 absolute -top-6 -left-6 w-28 h-28 rounded-full bg-violet-600/40 blur-2xl pointer-events-none" />
          <div className="orb-2 absolute -top-4 right-4 w-24 h-24 rounded-full bg-blue-500/30 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

          <div className="relative px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AIAvatar size="sm" />
              <div>
                <div className="text-white font-semibold text-sm tracking-wide">AI Assistant</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                  </span>
                  <span className="text-[10px] text-gray-400 tracking-wide">Online · Data real-time</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={clearChat}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                title="Clear chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Minimize"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Messages ── */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(139,92,246,0.03) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.03) 0%, transparent 60%)',
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                'flex gap-2.5',
                msg.role === 'user' ? 'justify-end' : 'justify-start',
                msg.isNew && 'msg-new'
              )}
            >
              {msg.role === 'assistant' && <AIAvatar />}

              <div
                className={cn(
                  'max-w-[78%] text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'rounded-2xl rounded-tr-sm px-4 py-2.5 text-white'
                    : msg.error
                    ? 'rounded-2xl rounded-tl-sm px-4 py-2.5 bg-red-50 text-red-600 border border-red-100'
                    : 'rounded-2xl rounded-tl-sm px-4 py-2.5 bg-white text-gray-800 shadow-sm border border-gray-100'
                )}
                style={msg.role === 'user' ? {
                  background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 60%, #0891b2 100%)',
                  boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
                } : {}}
              >
                {msg.role === 'assistant' && !msg.error ? (
                  <MarkdownText text={msg.text} />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-2.5 justify-start msg-new">
              <AIAvatar />
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                {toolStatus ? (
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-4 h-4 rounded-full border-2 border-violet-200 border-t-violet-500 animate-spin" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">{toolStatus}</p>
                      <div className="mt-1.5 h-0.5 w-28 rounded-full overflow-hidden bg-gray-100">
                        <div className="h-full shimmer-bar rounded-full" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <TypingDots />
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Suggested prompts ── */}
        {messages.length === 1 && !loading && (
          <div className="px-3 pb-3 shrink-0">
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <Zap className="w-3 h-3 text-violet-500" />
              <span className="text-[11px] font-semibold text-gray-400 tracking-widest uppercase">Quick Prompts</span>
            </div>
            <div className="flex flex-col gap-1">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className={cn(
                    'group flex items-center justify-between w-full text-left',
                    'px-3 py-2 rounded-xl text-xs text-gray-600',
                    'bg-gray-50 hover:bg-violet-50 border border-transparent hover:border-violet-100',
                    'hover:text-violet-700 transition-all duration-150'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-300 group-hover:bg-violet-500 transition-colors shrink-0" />
                    <span>{p}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-violet-400 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Input ── */}
        <div className="px-4 pb-4 pt-2 shrink-0 border-t border-gray-100 bg-white">
          <div className="relative flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanya tentang data HRGA..."
              rows={1}
              disabled={loading}
              className={cn(
                'flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 pr-12 text-sm outline-none',
                'focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all duration-200',
                'placeholder:text-gray-300 max-h-24 leading-relaxed bg-gray-50',
                loading && 'opacity-50 cursor-not-allowed'
              )}
              style={{ minHeight: '42px' }}
              onInput={(e) => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px'
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className={cn(
                'absolute right-2 bottom-2 w-8 h-8 rounded-lg flex items-center justify-center',
                'transition-all duration-200',
                input.trim() && !loading
                  ? 'bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-md shadow-violet-300/40 hover:scale-110 hover:shadow-violet-400/50'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              )}
              aria-label="Send"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-gray-300 mt-2 text-center tracking-wide">
            Powered by <span className="text-violet-400 font-medium">Shanale Studio App</span> · collaboration with Claude AI
          </p>
        </div>
      </div>
    </>
  )
}
