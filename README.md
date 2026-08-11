# DeskRobo — Neo

A privacy-conscious **cognitive-wellness platform**. DeskRobo turns behavioral signals
(gaze stability, blink activity, facial movement) into an **understandable estimate of your
cognitive load**, so you can choose better moments to pause, reset and recover.

> DeskRobo is a wellness tool. It estimates cognitive load from behavioral signals and does
> **not** diagnose stress, anxiety, depression or any medical condition.

## Status — Phase 1

Phase 1 delivers the **product foundation and landing page** only:

- Global design system (deep charcoal base, restrained neon accents, sophisticated typography)
- Responsive navigation
- Premium landing page with a clean, static premium dark background (pure CSS, no canvas)
- Product narrative, "how it works" pipeline, features, dashboard preview, privacy and CTA
- Interactive feature micro-visualizations and a dashboard product preview
- Fully static background — no continuous animation loop, lightweight and fast

The webcam engine, cognitive-load algorithm, dashboard, analytics, auth and backend are
**not** part of Phase 1.

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- Framer Motion

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # typecheck + production build
npm run preview  # preview the production build
```

## Project structure

```
src/
├── components/
│   ├── layout/      Navbar, Footer, Logo, StaticBackground
│   ├── sections/    Hero, Narrative, HowItWorks, Features,
│   │                DashboardPreview, FeatureVisual, Privacy, CTA
│   └── ui/          Button, Panel, Eyebrow, Reveal
├── data/            content (features, nav, narrative, pipeline copy)
├── lib/             utilities (cn)
├── pages/           Landing
└── styles/          globals.css (design tokens)
```
