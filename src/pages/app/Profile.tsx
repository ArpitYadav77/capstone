import { useState, type FormEvent } from 'react'
import { authService } from '@/services'
import { useAuth } from '@/auth/AuthContext'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Stat } from '@/components/ui/Stat'
import { Eyebrow } from '@/components/ui/Eyebrow'

export function Profile() {
  const { user, refresh } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [saved, setSaved] = useState(false)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    authService.updateProfile({ name })
    refresh()
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  const memberSince = user ? new Date(user.createdAt).toLocaleDateString() : ''

  return (
    <div className="mx-auto max-w-2xl">
      <Eyebrow>Profile</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
        Your account
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <Stat label="Email" value={<span className="text-base">{user?.email}</span>} />
        <Stat label="Member Since" value={<span className="text-base">{memberSince}</span>} />
      </div>

      <Panel className="mt-4 p-6">
        <form onSubmit={onSubmit} className="space-y-5">
          <Input
            id="name"
            label="Display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <Button type="submit">Save changes</Button>
            {saved && <span className="text-sm text-positive">Saved</span>}
          </div>
        </form>
      </Panel>

      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
        Prototype · account &amp; data are stored locally in this browser
      </p>
    </div>
  )
}
