# NEO — Backend (Express + MongoDB + Gemini)

Server-side API for the DeskRobo/NEO Assistant. Holds all secrets (Gemini API
key + MongoDB credentials) — **nothing sensitive is ever exposed to the browser.**

```
React Assistant → POST /api/chat → Express → MongoDB (context) → Gemini
              → save conversation → { reply, sessionId, timestamp } → React
```

## Setup
```bash
cd backend
cp .env.example .env      # set MONGODB_URI and GEMINI_API_KEY
npm install
npm run dev               # tsx watch, http://localhost:5000
# or:  npm run build && npm start
```

The server connects to MongoDB and runs a **startup ping** before listening. If
`MONGODB_URI` is missing or unreachable, it exits with a clear error.

## Environment (`.env`)
| Var | Purpose |
|-----|---------|
| `MONGODB_URI` | Mongo connection string (Atlas or local) |
| `GEMINI_API_KEY` | Gemini key — **server-side only** |
| `GEMINI_MODEL` | default `gemini-2.5-flash` |
| `PORT` | default `5000` |
| `CORS_ORIGIN` | default `http://localhost:5173` |

## MongoDB — database `deskrobo`
Collections: `users`, `sessions`, `metrics`, `conversations`.
One reusable `MongoClient` (`db.ts`) is shared across all requests — never one
per request.

## API
| Method | Path | Purpose |
|--------|------|---------|
| GET  | `/health` | health check |
| POST | `/api/chat` | `{ message, sessionId?, userId? }` → `{ reply, sessionId, timestamp }` |
| POST | `/api/sessions` | create a session → `{ sessionId }` |
| GET  | `/api/sessions/:id` | fetch a session |
| POST | `/api/sessions/:id/end` | end + aggregate a session |
| POST | `/api/sessions/:id/metrics` | append a derived metric sample |

`/api/chat` fetches the latest metrics/session from MongoDB, builds a concise
NEO context, sends **context + message** to Gemini (`@google/genai`), saves the
exchange in `conversations`, and returns the reply. Only derived metrics are
sent to Gemini — never webcam frames or video.

## Notes
- Gemini logic is isolated in `services/geminiService.ts`.
- NEO describes values as **behavioral indicators/estimates** and never claims
  medical diagnosis.
