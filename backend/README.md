# NEO — Backend

Node + TypeScript hub that ties the prototype together:

- **WebSocket hub** — the Python CV engine connects to `/cv` and streams
  `NeoMetrics`; the React app connects to `/dashboard` and receives them live.
- **REST API** (`/api/neo/*`) — metrics snapshot, ESP32 commands, and the Gemini
  voice-assistant chat endpoint.
- **ESP32 commands** — forwards `FOCUS_LOW | BREAK | GREETING | CUSTOM_MESSAGE`
  to the device over Wi-Fi.
- **Gemini assistant** — conversation only, with function-calling tools that read
  live NEO metrics. No webcam video is ever sent to Gemini.

## Setup
```bash
cd backend
cp .env.example .env      # add GEMINI_API_KEY (optional) and ESP32_URL (optional)
npm install
npm run dev               # http://localhost:8080
```

## API
| Method | Path | Purpose |
|--------|------|---------|
| GET  | `/api/neo/health` | health + device-connected flag |
| GET  | `/api/neo/metrics` | latest metrics + session stats |
| POST | `/api/neo/command` | `{ command, message? }` → ESP32 |
| POST | `/api/neo/monitoring/start` \| `/stop` | toggle session stats |
| POST | `/api/neo/chat` | `{ message }` → Gemini reply (uses tools) |

## WebSocket
- Producer (Python): `ws://localhost:8080/cv` — send `NeoMetrics` JSON frames.
- Consumer (React): `ws://localhost:8080/dashboard` — receives
  `{ type: 'metrics' | 'command' | 'monitoring', payload }`.

## Gemini tools
`get_current_attention`, `get_session_stats`, `start_monitoring`,
`stop_monitoring`, `take_break` — the model calls these to read live data or act.
