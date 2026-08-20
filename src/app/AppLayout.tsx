import { useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  Radio,
  MessageSquareText,
  BarChart3,
  HeartPulse,
  User,
  Settings as SettingsIcon,
  Bell,
  LogOut,
  Check,
} from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { Logo } from '@/components/layout/Logo'
import { notificationService } from '@/services'
import { cn } from '@/lib/cn'

const NAV = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/session', label: 'Live Session', icon: Radio },
  { to: '/app/assistant', label: 'Assistant', icon: MessageSquareText },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/recovery', label: 'Recovery', icon: HeartPulse },
  { to: '/app/profile', label: 'Profile', icon: User },
  { to: '/app/settings', label: 'Settings', icon: SettingsIcon },
]

function NotificationsBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [version, setVersion] = useState(0)
  const items = useMemo(() => notificationService.list(userId), [userId, version])
  const unread = items.filter((n) => !n.read).length

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-10 w-10 place-items-center rounded-lg border border-line bg-card text-ink-soft transition-colors hover:text-ink hover:border-ink/20"
        aria-label="Notifications"
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.6} />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key={unread}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 24 }}
              className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-teal px-1 text-[10px] font-semibold text-white"
            >
              {unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-line bg-card p-2 shadow-card-hover">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
                Notifications
              </span>
              {items.length > 0 && (
                <button
                  onClick={() => {
                    notificationService.markAllRead(userId)
                    setVersion((v) => v + 1)
                  }}
                  className="inline-flex items-center gap-1 text-[11px] text-teal hover:text-[#0f9aab]"
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-3 py-6 text-center text-[13px] text-ink-muted">Nothing yet.</p>
              ) : (
                items.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      'rounded-xl px-3 py-2.5',
                      !n.read && 'bg-teal/[0.06]',
                    )}
                  >
                    <p className="text-[13px] text-ink">{n.title}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">{n.body}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const navItems = (
    <>
      {NAV.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-card text-ink shadow-[0_2px_10px_rgba(30,30,20,0.05)]'
                  : 'text-ink-soft hover:bg-ink/[0.04] hover:text-ink',
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Small teal active indicator — not a large glow. */}
                <span
                  className={cn(
                    'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-teal transition-opacity',
                    isActive ? 'opacity-100' : 'opacity-0',
                  )}
                  aria-hidden
                />
                <Icon
                  className={cn(
                    'h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110',
                    isActive && 'text-teal',
                  )}
                  strokeWidth={1.6}
                />
                {item.label}
              </>
            )}
          </NavLink>
        )
      })}
    </>
  )

  return (
    <div className="relative z-10 min-h-screen bg-ivory lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar (desktop) — warm neutral, premium light */}
      <aside className="hidden border-r border-line bg-sand lg:flex lg:flex-col">
        <div className="px-6 py-6">
          <Logo />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-4">{navItems}</nav>
        <div className="border-t border-line p-4">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.6} />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line bg-ivory/90 px-5 py-3 backdrop-blur-xl sm:px-8">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm text-ink-soft">
              Welcome back, <span className="font-medium text-ink">{user?.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user && <NotificationsBell userId={user.id} />}
            <button
              onClick={onLogout}
              className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-card text-ink-soft transition-colors hover:text-ink hover:border-ink/20 lg:hidden"
              aria-label="Log out"
            >
              <LogOut className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </button>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-line bg-sand px-4 py-2 lg:hidden">
          {navItems}
        </nav>

        <main className="flex-1 px-5 py-8 sm:px-8 sm:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
