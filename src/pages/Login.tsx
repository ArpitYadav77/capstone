import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { StaticBackground } from '@/components/layout/StaticBackground'
import { Logo } from '@/components/layout/Logo'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Eyebrow } from '@/components/ui/Eyebrow'

export function Login() {
  const { user, login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const from = (location.state as { from?: string } | null)?.from ?? '/app/dashboard'

  if (user) return <Navigate to={from} replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.')
    }
  }

  return (
    <>
      <StaticBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>
          <Panel className="p-8">
            <Eyebrow>Sign in</Eyebrow>
            <h1 className="mt-4 font-display text-2xl font-semibold text-white">Welcome back</h1>
            <p className="mt-2 text-sm text-[#8a97a5]">
              Continue to your private cognitive-wellness workspace.
            </p>

            <form onSubmit={onSubmit} className="mt-7 space-y-4">
              <Input
                id="email"
                type="email"
                label="Email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <Input
                id="password"
                type="password"
                label="Password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              {error && <p className="text-sm text-warm">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </Panel>

          <p className="mt-6 text-center text-sm text-[#8a97a5]">
            New to DeskRobo?{' '}
            <Link to="/register" className="text-neon-cyan hover:underline">
              Create an account
            </Link>
          </p>
          <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-[#5b6672]">
            Demo session · data stored locally in your browser
          </p>
        </div>
      </div>
    </>
  )
}
