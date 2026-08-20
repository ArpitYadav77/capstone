import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Mic, MicOff, Send, Volume2 } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { neoApi } from '@/services/neoApi'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ThinkingDots } from '@/components/ui/ThinkingDots'
import { cn } from '@/lib/cn'

interface Turn {
  role: 'user' | 'neo'
  text: string
  tools?: string[]
}

const EXAMPLES = [
  'NEO, how focused am I?',
  'How was my focus today?',
  'Should I take a break?',
  'Start monitoring.',
  'Stop monitoring.',
]

// Minimal typing for the Web Speech API (not in lib.dom by default).
type SpeechRec = {
  lang: string
  interimResults: boolean
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void
  onend: () => void
  onerror: () => void
  start: () => void
  stop: () => void
}

function getRecognition(): SpeechRec | null {
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec }
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
  return Ctor ? new Ctor() : null
}

function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 1.03
  u.pitch = 1
  window.speechSynthesis.speak(u)
}

export function Assistant() {
  const { user } = useAuth()
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recRef = useRef<SpeechRec | null>(null)
  // Kept across turns so the backend groups the conversation thread.
  const sessionIdRef = useRef<string | undefined>(undefined)
  const speechSupported = typeof window !== 'undefined' && !!getRecognition()

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  const ask = async (text: string) => {
    const message = text.trim()
    if (!message || busy) return
    setError(null)
    setInput('')
    setTurns((t) => [...t, { role: 'user', text: message }])
    setBusy(true)
    try {
      const res = await neoApi.chat(message, { sessionId: sessionIdRef.current, userId: user?.id })
      sessionIdRef.current = res.sessionId
      setTurns((t) => [...t, { role: 'neo', text: res.reply }])
      speak(res.reply)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void ask(input)
  }

  const toggleMic = () => {
    if (listening) {
      recRef.current?.stop()
      return
    }
    const rec = getRecognition()
    if (!rec) return
    recRef.current = rec
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInput(transcript)
      void ask(transcript)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    setListening(true)
    rec.start()
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Eyebrow>NEO Assistant</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
        Talk to NEO
      </h1>
      <p className="mt-2 max-w-xl text-sm text-ink-soft">
        Ask about your focus and NEO answers using your live and session metrics. Voice is optional —
        speak or type. Powered by Gemini (conversation only; no video is ever sent).
      </p>

      {/* Example prompts */}
      <div className="mt-5 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => ask(ex)}
            disabled={busy}
            className="rounded-full border border-line bg-card px-3 py-1.5 text-[13px] text-ink-soft transition-colors hover:border-teal/40 hover:text-ink disabled:opacity-50"
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Conversation */}
      <Panel className="mt-6 min-h-[220px] p-5">
        {turns.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-muted">
            Start by asking “NEO, how focused am I?”
          </p>
        ) : (
          <div className="space-y-4">
            {turns.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={cn('flex', t.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px]',
                    t.role === 'user'
                      ? 'bg-ink text-ivory'
                      : 'border border-line bg-card-soft text-ink',
                  )}
                >
                  {t.role === 'neo' && (
                    <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-teal">
                      <Volume2 className="h-3 w-3" /> NEO
                    </div>
                  )}
                  <p className="leading-relaxed">{t.text}</p>
                  {t.tools && t.tools.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {[...new Set(t.tools)].map((tool) => (
                        <span
                          key={tool}
                          className="rounded-full bg-ink/[0.06] px-2 py-0.5 font-mono text-[10px] text-ink-soft"
                        >
                          {tool}()
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            <AnimatePresence>
              {busy && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-sm text-ink-muted"
                >
                  NEO is thinking <ThinkingDots />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </Panel>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm text-danger"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Input row */}
      <form onSubmit={onSubmit} className="mt-4 flex items-end gap-3">
        <div className="flex-1">
          <Input
            id="assistant-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={listening ? 'Listening…' : 'Ask NEO something…'}
          />
        </div>
        {speechSupported && (
          <button
            type="button"
            onClick={toggleMic}
            className={cn(
              'relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-colors',
              listening
                ? 'border-teal/50 bg-teal/10 text-teal'
                : 'border-line bg-card text-ink-soft hover:text-ink',
            )}
            aria-label={listening ? 'Stop listening' : 'Start voice input'}
          >
            {listening && (
              <motion.span
                className="pointer-events-none absolute inset-0 rounded-xl border border-teal/60"
                animate={{ scale: [1, 1.25], opacity: [0.6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        )}
        <Button type="submit" disabled={busy} rightIcon={<Send className="h-4 w-4" />}>
          Send
        </Button>
      </form>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
        Requires the NEO backend running with a Gemini API key.
      </p>
    </div>
  )
}
