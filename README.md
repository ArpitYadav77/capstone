# DeskRobo — Neo

A privacy-conscious **cognitive-wellness platform**. DeskRobo turns behavioral signals
(gaze stability, blink activity, facial movement) into an **understandable estimate of your
cognitive load**, so you can choose better moments to pause, reset and recover.

> DeskRobo is a wellness tool. It estimates cognitive load from behavioral signals and does
> **not** diagnose stress, anxiety, depression or any medical condition.

## NEO end-to-end prototype

The repo now contains a working NEO prototype alongside the web app:

```
Laptop webcam → OpenCV + MediaPipe → blink/gaze → attention/fatigue (rule-based)
  → WebSocket → NEO backend → React dashboard (LIVE mode)

Voice → browser STT → NEO backend → Gemini (+ live-metric tools) → reply → browser TTS
  → optional ESP32 → amplifier → speaker
```

- **`cv-engine/`** — Python (OpenCV + MediaPipe). No ML training, no datasets, no
  emotion/stress diagnosis. Streams `NeoMetrics` over WebSocket. See its README.
- **`backend/`** — Node + TypeScript. WebSocket hub, ESP32 command dispatch, and the
  Gemini voice-assistant endpoint (function-calling with live NEO tools).
- **`esp32/neo_device.ino`** — receives Wi-Fi commands and drives a speaker/amplifier.
- **Frontend** — the existing app gains a **LIVE mode** (real webcam metrics) on the
  Live Session page and a **NEO Assistant** page. `DEMO` mode still works with no backend.

### Run the full prototype
```bash
# 1) Backend (hub + Gemini + ESP32)
cd backend && cp .env.example .env && npm install && npm run dev   # :8080

# 2) CV engine (webcam → metrics)
cd cv-engine && pip install -r requirements.txt && python main.py --preview

# 3) Frontend
npm install && npm run dev                                          # :5173
#    then in the app: Live Session → switch to LIVE
```
Set `GEMINI_API_KEY` in `backend/.env` for the Assistant, and `ESP32_URL` for the device.
The shared data contract (`NeoMetrics`) lives in `src/services/neoTypes.ts` and
`backend/src/types.ts`. Raw camera footage is never stored.

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
