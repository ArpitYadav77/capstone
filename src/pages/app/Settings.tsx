import { useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { settingsService } from '@/services'
import type { Settings as SettingsType } from '@/services'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { Input } from '@/components/ui/Input'
import { Eyebrow } from '@/components/ui/Eyebrow'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-lg font-semibold text-ink">{children}</h2>
  )
}

export function Settings() {
  const { user } = useAuth()
  const uid = user!.id
  const [settings, setSettings] = useState<SettingsType>(() => settingsService.get(uid))
  const [saved, setSaved] = useState(false)

  // Immutable update helpers keep this component free of any localStorage calls.
  const setNotif = (key: keyof SettingsType['notifications'], v: boolean) =>
    setSettings((s) => ({ ...s, notifications: { ...s.notifications, [key]: v } }))
  const setQuiet = <K extends keyof SettingsType['quietHours']>(
    key: K,
    v: SettingsType['quietHours'][K],
  ) => setSettings((s) => ({ ...s, quietHours: { ...s.quietHours, [key]: v } }))
  const setSession = <K extends keyof SettingsType['session']>(
    key: K,
    v: SettingsType['session'][K],
  ) => setSettings((s) => ({ ...s, session: { ...s.session, [key]: v } }))
  const setPrivacy = (key: keyof SettingsType['privacy'], v: boolean) =>
    setSettings((s) => ({ ...s, privacy: { ...s.privacy, [key]: v } }))

  const save = () => {
    settingsService.save(uid, settings)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-2xl pb-8">
      <Eyebrow>Settings</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
        Preferences
      </h1>

      <Panel className="mt-8 divide-y divide-line p-6">
        <div className="pb-2">
          <SectionTitle>Notifications</SectionTitle>
        </div>
        <Toggle
          label="Session summaries"
          description="Get a summary notification when a session is saved."
          checked={settings.notifications.sessionSummaries}
          onChange={(v) => setNotif('sessionSummaries', v)}
        />
        <Toggle
          label="Cognitive load alerts"
          description="Flag possible elevated cognitive load."
          checked={settings.notifications.loadAlerts}
          onChange={(v) => setNotif('loadAlerts', v)}
        />
        <Toggle
          label="Recovery nudges"
          description="Encouragement when you complete a recovery activity."
          checked={settings.notifications.recoveryNudges}
          onChange={(v) => setNotif('recoveryNudges', v)}
        />
        <Toggle
          label="Weekly report"
          description="A weekly summary of your patterns."
          checked={settings.notifications.weeklyReport}
          onChange={(v) => setNotif('weeklyReport', v)}
        />
      </Panel>

      <Panel className="mt-4 p-6">
        <SectionTitle>Quiet hours</SectionTitle>
        <Toggle
          label="Enable quiet hours"
          description="Pause notifications during a set window."
          checked={settings.quietHours.enabled}
          onChange={(v) => setQuiet('enabled', v)}
        />
        {settings.quietHours.enabled && (
          <div className="mt-3 grid grid-cols-2 gap-4">
            <Input
              id="quiet-start"
              type="time"
              label="From"
              value={settings.quietHours.start}
              onChange={(e) => setQuiet('start', e.target.value)}
            />
            <Input
              id="quiet-end"
              type="time"
              label="To"
              value={settings.quietHours.end}
              onChange={(e) => setQuiet('end', e.target.value)}
            />
          </div>
        )}
      </Panel>

      <Panel className="mt-4 divide-y divide-line p-6">
        <div className="pb-2">
          <SectionTitle>Session</SectionTitle>
        </div>
        <Toggle
          label="Demo Perception Mode"
          description="Use simulated signals (no camera). Required until MediaPipe is added."
          checked={settings.session.demoPerception}
          onChange={(v) => setSession('demoPerception', v)}
        />
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Input
            id="sample-interval"
            type="number"
            min={1}
            max={10}
            label="Sample interval (s)"
            value={settings.session.sampleIntervalSec}
            onChange={(e) => setSession('sampleIntervalSec', Number(e.target.value) || 1)}
          />
          <Input
            id="alert-threshold"
            type="number"
            min={0}
            max={100}
            label="Alert threshold"
            value={settings.session.autoAlertThreshold}
            onChange={(e) => setSession('autoAlertThreshold', Number(e.target.value) || 0)}
          />
        </div>
      </Panel>

      <Panel className="mt-4 divide-y divide-line p-6">
        <div className="pb-2">
          <SectionTitle>Privacy</SectionTitle>
        </div>
        <Toggle
          label="Store measurements"
          description="Keep raw demo measurements locally for richer analytics."
          checked={settings.privacy.storeMeasurements}
          onChange={(v) => setPrivacy('storeMeasurements', v)}
        />
        <Toggle
          label="Local processing only"
          description="Never send signals off this device."
          checked={settings.privacy.localProcessingOnly}
          onChange={(v) => setPrivacy('localProcessingOnly', v)}
        />
      </Panel>

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={save}>Save preferences</Button>
        {saved && <span className="text-sm text-positive">Saved</span>}
      </div>
    </div>
  )
}
