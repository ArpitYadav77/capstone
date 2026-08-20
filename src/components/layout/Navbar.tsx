import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'
import { Logo } from './Logo'
import { Button } from '@/components/ui/Button'
import { NAV_LINKS } from '@/data/content'
import { cn } from '@/lib/cn'

export function Navbar() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled ? 'border-b border-ink/10 bg-ivory/80 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <nav className="container-x flex h-16 items-center justify-between md:h-20">
        <Logo theme="light" />

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-ink-soft transition-colors hover:text-ink"
          >
            Sign in
          </button>
          <Button
            variant="ink"
            size="sm"
            onClick={() => navigate('/app/session')}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Start Cognitive Check
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-ink/10 text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="border-t border-ink/10 bg-ivory/95 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="container-x flex flex-col gap-1 py-6">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-lg text-ink transition-colors hover:bg-ink/[0.04]"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-3">
                <Button
                  variant="ink"
                  onClick={() => {
                    setOpen(false)
                    navigate('/app/session')
                  }}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Start Cognitive Check
                </Button>
                <button
                  onClick={() => {
                    setOpen(false)
                    navigate('/login')
                  }}
                  className="rounded-lg px-3 py-3 text-left text-lg text-ink-soft transition-colors hover:bg-ink/[0.04]"
                >
                  Sign in
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
