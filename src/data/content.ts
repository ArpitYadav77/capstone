import {
  Eye,
  ScanFace,
  Gauge,
  RefreshCw,
  LineChart,
  ShieldCheck,
  Webcam,
  Waves,
  BrainCircuit,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

/** Discriminator used to select each card's hover micro-visualization. */
export type FeatureKey = 'gaze' | 'facial' | 'load' | 'recovery' | 'insights' | 'privacy'

export interface Feature {
  key: FeatureKey
  icon: LucideIcon
  title: string
  description: string
}

/** The six product capabilities. Language is deliberately non-diagnostic. */
export const FEATURES: Feature[] = [
  {
    key: 'gaze',
    icon: Eye,
    title: 'Eye Gaze',
    description:
      'Understand changes in gaze stability, fixation and screen attention over the course of a session.',
  },
  {
    key: 'facial',
    icon: ScanFace,
    title: 'Facial Dynamics',
    description:
      'Track temporal changes in facial movement and eye activity as behavioral signals — never emotion labels.',
  },
  {
    key: 'load',
    icon: Gauge,
    title: 'Cognitive Load',
    description:
      'Transform behavioral signals into an understandable wellness indicator with an honest confidence level.',
  },
  {
    key: 'recovery',
    icon: RefreshCw,
    title: 'Adaptive Recovery',
    description:
      'Suggest short cognitive recovery activities based on observed patterns and possible elevated cognitive load.',
  },
  {
    key: 'insights',
    icon: LineChart,
    title: 'Personal Insights',
    description:
      'Understand your patterns across 7-day and 30-day periods, with trends you can actually act on.',
  },
  {
    key: 'privacy',
    icon: ShieldCheck,
    title: 'Privacy First',
    description:
      'Process webcam information locally whenever possible and avoid storing raw video, by design.',
  },
]

export interface NavLink {
  label: string
  href: string
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Product', href: '#product' },
  { label: 'How it works', href: '#how' },
  { label: 'Technology', href: '#technology' },
  { label: 'Privacy', href: '#privacy' },
]

/** The end-to-end pipeline shown in the "How it works" sequence. */
export interface FlowStage {
  icon: LucideIcon
  title: string
  caption: string
}

export const FLOW: FlowStage[] = [
  { icon: Webcam, title: 'Webcam', caption: 'On-device capture, only with consent' },
  { icon: Waves, title: 'Behavioral Signals', caption: 'Gaze, blink & facial dynamics' },
  { icon: BrainCircuit, title: 'Cognitive Load Estimate', caption: 'Signals fused into an estimate + confidence' },
  { icon: LineChart, title: 'Personal Insight', caption: 'Patterns across 7 & 30 days' },
  { icon: Sparkles, title: 'Recovery Action', caption: 'Short, practical resets' },
]

/** Labels for the floating technical annotations around the hero brain. */
export const HERO_ANNOTATIONS = [
  { id: 'gaze', line1: 'Gaze', line2: 'Stability' },
  { id: 'blink', line1: 'Blink', line2: 'Rate' },
  { id: 'facial', line1: 'Facial', line2: 'Dynamics' },
  { id: 'load', line1: 'Cognitive', line2: 'Load' },
] as const
