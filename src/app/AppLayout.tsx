import { useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
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
import { StaticBackground } from '@/components/layout/StaticBackground'
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
        className="relative grid h-10 w-10 place-items-center rounded-lg text-[#c3ccd6] hairline transition-colors hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.6} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-neon-cyan px-1 text-[10px] font-semibold text-base-950">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-line bg-base-900/95 p-2 backdrop-blur-xl">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#8a97a5]">
                Notifications
              </span>
              {items.length > 0 && (
                <button
                  onClick={() => {
                    notificationService.markAllRead(userId)
                    setVersion((v) => v + 1)
                  }}
                  className="inline-flex items-center gap-1 text-[11px] text-neon-cyan/80 hover:text-neon-cyan"
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-3 py-6 text-center text-[13px] text-[#7c8894]">Nothing yet.</p>
              ) : (
                items.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      'rounded-xl px-3 py-2.5',
                      !n.read && 'bg-white/[0.03]',
                    )}
                  >
                    <p className="text-[13px] text-white">{n.title}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-[#8a97a5]">{n.body}</p>
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
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-white/[0.05] text-white'
                  : 'text-[#aab6c2] hover:bg-white/[0.03] hover:text-white',
              )
            }
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
            {item.label}
          </NavLink>
        )
      })}
    </>
  )

  return (
    <>
      <StaticBackground />
      <div className="relative z-10 min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="hidden border-r border-line lg:flex lg:flex-col">
          <div className="px-6 py-6">
            <Logo />
          </div>
          <nav className="flex flex-1 flex-col gap-1 px-4">{navItems}</nav>
          <div className="border-t border-line p-4">
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-[#aab6c2] transition-colors hover:bg-white/[0.03] hover:text-white"
            >
              <LogOut className="h-[18px] w-[18px]" strokeWidth={1.6} />
              Log out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line bg-base-950/70 px-5 py-3 backdrop-blur-xl sm:px-8">
            <div className="lg:hidden">
              <Logo />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm text-[#8a97a5]">
                Welcome back, <span className="text-white">{user?.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user && <NotificationsBell userId={user.id} />}
              <button
                onClick={onLogout}
                className="grid h-10 w-10 place-items-center rounded-lg text-[#c3ccd6] hairline transition-colors hover:text-white lg:hidden"
                aria-label="Log out"
              >
                <LogOut className="h-[18px] w-[18px]" strokeWidth={1.6} />
              </button>
            </div>
          </header>

          {/* Mobile nav */}
          <nav className="flex gap-1 overflow-x-auto border-b border-line px-4 py-2 lg:hidden">
            {navItems}
          </nav>

          <main className="flex-1 px-5 py-8 sm:px-8 sm:py-10">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}
