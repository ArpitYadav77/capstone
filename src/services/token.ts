/**
 * Demo session token — JWT-SHAPED, but NOT cryptographically signed.
 *
 * A real JWT must be signed with a secret that lives only on the server. Putting
 * that secret in frontend source would be insecure and pointless, so this
 * prototype instead issues a JWT-shaped token whose signature segment is a fixed
 * demo marker. It carries `sub`, `email`, `iat` and `exp` like a real JWT, and
 * expiry is enforced client-side — but it proves nothing and must not be trusted.
 *
 * When the Node/Express backend lands, replace this whole module with real
 * signed-JWT verification; the authService API around it stays the same.
 */

export interface TokenPayload {
  sub: string
  email: string
  iat: number
  exp: number
}

const DEMO_SIGNATURE = 'demo-unsigned-do-not-trust'
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

function b64urlEncode(obj: unknown): string {
  const json = JSON.stringify(obj)
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function b64urlDecode<T>(seg: string): T | null {
  try {
    const s = seg.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(escape(atob(s)))
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

export function createDemoToken(sub: string, email: string, ttlMs = DEFAULT_TTL_MS): string {
  const now = Date.now()
  const header = { alg: 'none', typ: 'JWT', demo: true }
  const payload: TokenPayload = { sub, email, iat: now, exp: now + ttlMs }
  return `${b64urlEncode(header)}.${b64urlEncode(payload)}.${btoa(DEMO_SIGNATURE)}`
}

export function decodeToken(token: string): TokenPayload | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  return b64urlDecode<TokenPayload>(parts[1])
}

export function isTokenValid(token: string | null | undefined): boolean {
  if (!token) return false
  const payload = decodeToken(token)
  return !!payload && typeof payload.exp === 'number' && payload.exp > Date.now()
}
