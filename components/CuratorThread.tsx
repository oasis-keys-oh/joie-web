'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { createClient } from '@supabase/supabase-js'

interface Message {
  id: string
  sender_key: string
  traveler_name: string | null
  body: string
  created_at: string
}

interface Props {
  tripId: string
  tripSlug: string
  travelerName?: string
  curatorWhatsApp?: string   // optional phone number for WhatsApp fallback
  curatorPhone?: string      // optional phone for iMessage fallback
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CuratorThread({ tripId, travelerName, curatorWhatsApp, curatorPhone }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState('')
  const [name, setName] = useState(travelerName || '')
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    // Load messages
    supabase
      .from('curator_messages')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data || []))

    // Subscribe to realtime
    const channel = supabase
      .channel(`curator-${tripId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'curator_messages',
        filter: `trip_id=eq.${tripId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [open, tripId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    if (!body.trim() || !name.trim()) return
    startTransition(async () => {
      await supabase.from('curator_messages').insert({
        trip_id: tripId,
        sender_key: 'traveler',
        traveler_name: name,
        body: body.trim(),
      })
      setBody('')
      setSent(true)
      setTimeout(() => setSent(false), 3000)
    })
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full shadow-lg text-white text-xs uppercase tracking-widest transition-all hover:opacity-90 active:scale-95"
        style={{ background: '#1B2B4B', letterSpacing: '0.14em', boxShadow: '0 8px 32px rgba(27,43,75,0.35)' }}
      >
        <span style={{ fontSize: '1.1rem' }}>✉</span>
        Ask the Curator
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            className="bg-white w-full sm:max-w-lg sm:mx-6 sm:rounded-sm overflow-hidden flex flex-col"
            style={{ maxHeight: '80vh', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}
          >
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between" style={{ background: '#1B2B4B' }}>
              <div>
                <p className="text-gold text-xs tracking-widest uppercase" style={{ letterSpacing: '0.18em' }}>Oukala Journeys</p>
                <h2 className="font-serif text-white font-bold text-lg mt-0.5">Ask the Curator</h2>
                <p className="text-white opacity-40 text-xs mt-0.5">We typically respond within 2 hours</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white opacity-40 hover:opacity-80 text-xl leading-none">✕</button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4" style={{ background: '#faf8f4' }}>
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-3xl mb-3">💬</p>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Questions about restaurants, logistics, recommendations, emergencies — we&apos;re here.
                  </p>
                </div>
              )}
              {messages.map(m => (
                <div
                  key={m.id}
                  className={`flex ${m.sender_key === 'traveler' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-sm text-sm leading-relaxed ${
                      m.sender_key === 'traveler'
                        ? 'text-white'
                        : 'text-navy border border-gray-100 bg-white'
                    }`}
                    style={m.sender_key === 'traveler' ? { background: '#1B2B4B' } : {}}
                  >
                    {m.sender_key === 'curator' && (
                      <p className="text-xs text-gold font-semibold mb-1" style={{ letterSpacing: '0.1em' }}>Curator</p>
                    )}
                    {m.body}
                    <p className={`text-xs mt-1 opacity-50 ${m.sender_key === 'traveler' ? 'text-right text-white' : 'text-ink-muted'}`}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-5 py-4 border-t border-gray-100 bg-white space-y-3">
              {!travelerName && (
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold"
                  style={{ background: '#faf8f4' }}
                />
              )}
              <div className="flex gap-2">
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Ask anything about your trip…"
                  rows={2}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  className="flex-1 border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold resize-none"
                  style={{ background: '#faf8f4' }}
                />
                <button
                  onClick={handleSend}
                  disabled={pending || !body.trim() || !name.trim()}
                  className="px-4 py-2 text-white text-xs uppercase tracking-widest rounded-sm disabled:opacity-40 hover:opacity-85 transition-opacity shrink-0"
                  style={{ background: '#C9A84C', letterSpacing: '0.12em' }}
                >
                  {sent ? '✓' : 'Send'}
                </button>
              </div>

              {/* Fallback links */}
              {(curatorWhatsApp || curatorPhone) && (
                <div className="flex gap-3 pt-1">
                  <p className="text-xs text-ink-muted">Also reach us via:</p>
                  {curatorWhatsApp && (
                    <a
                      href={`https://wa.me/${curatorWhatsApp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 hover:underline"
                    >
                      WhatsApp
                    </a>
                  )}
                  {curatorPhone && (
                    <a href={`sms:${curatorPhone}`} className="text-xs text-blue-600 hover:underline">
                      iMessage
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
