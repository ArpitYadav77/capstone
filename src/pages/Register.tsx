import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { StaticBackground } from '@/components/layout/StaticBackground'
import { Logo } from '@/components/layout/Logo'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Eyebrow } from '@/components/ui/Eyebrow'

export function Register() {
  const { user, register, loading } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (user) return <Navigate to="/app/dashboard" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('Please use a password of at least 6 characters.')
      return
    }
    try {
      await register({ name, email, password })
      navigate('/app/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.')
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
            <Eyebrow>Create account</Eyebrow>
            <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
              Start your first check
            </h1>
            <p className="mt-2 text-sm text-ink-soft">
              Your account and data stay local to this browser for the prototype.
            </p>

            <form onSubmit={onSubmit} className="mt-7 space-y-4">
              <Input
                id="name"
                label="Name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
              />
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                {loading ? 'Creating…' : 'Create account'}
              </Button>
            </form>
          </Panel>

          <p className="mt-6 text-center text-sm text-ink-soft">
            Already have an account?{' '}
            <Link to="/login" className="text-teal hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
