/**
 * authService — the single boundary for authentication.
 *
 * Prototype behavior (frontend-only):
 *  - Registered accounts live in localStorage (`deskrbo:users`), passwords are
 *    stored only as a salted SHA-256 hash (via Web Crypto — no dependency, no
 *    plaintext). This is a demo, not production-grade security.
 *  - The active session/token lives in `deskrbo:session`; the current user in
 *    `deskrbo:user`.
 *
 * The public API (register/login/logout/getCurrentUser/…) is intentionally the
 * shape a real backend client would expose, so it can be swapped for Node/Express
 * JWT auth later without touching the UI.
 */

import { GlobalKeys, makeId, storageService } from './storageService'
import { createDemoToken, isTokenValid } from './token'
import type { User } from './types'

interface StoredAccount {
  id: string
  name: string
  email: string
  createdAt: number
  salt: string
  passwordHash: string
}

interface AuthSession {
  token: string
  userId: string
}

export interface Credentials {
  email: string
  password: string
}

export interface RegisterInput extends Credentials {
  name: string
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return toHex(digest)
}

function makeSalt(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return toHex(bytes.buffer)
}

function getAccounts(): StoredAccount[] {
  return storageService.get<StoredAccount[]>(GlobalKeys.users, [])
}

function saveAccounts(accounts: StoredAccount[]): void {
  storageService.set(GlobalKeys.users, accounts)
}

function toUser(a: StoredAccount): User {
  return { id: a.id, name: a.name, email: a.email, createdAt: a.createdAt }
}

function startSession(account: StoredAccount): User {
  const token = createDemoToken(account.id, account.email)
  const session: AuthSession = { token, userId: account.id }
  storageService.set(GlobalKeys.session, session)
  const user = toUser(account)
  storageService.set(GlobalKeys.user, user)
  return user
}

async function register(input: RegisterInput): Promise<User> {
  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  if (!name || !email || !input.password) {
    throw new Error('Please fill in every field.')
  }
  const accounts = getAccounts()
  if (accounts.some((a) => a.email === email)) {
    throw new Error('An account with this email already exists.')
  }
  const salt = makeSalt()
  const account: StoredAccount = {
    id: makeId(),
    name,
    email,
    createdAt: Date.now(),
    salt,
    passwordHash: await hashPassword(input.password, salt),
  }
  saveAccounts([...accounts, account])
  return startSession(account)
}

async function login(creds: Credentials): Promise<User> {
  const email = creds.email.trim().toLowerCase()
  const account = getAccounts().find((a) => a.email === email)
  if (!account) throw new Error('No account found for that email.')
  const hash = await hashPassword(creds.password, account.salt)
  if (hash !== account.passwordHash) throw new Error('Incorrect email or password.')
  return startSession(account)
}

/** Clears the auth session only. The user's stored data is intentionally kept. */
function logout(): void {
  storageService.remove(GlobalKeys.session)
  storageService.remove(GlobalKeys.user)
}

function getToken(): string | null {
  const session = storageService.get<AuthSession | null>(GlobalKeys.session, null)
  return session?.token ?? null
}

function isAuthenticated(): boolean {
  return isTokenValid(getToken())
}

function getCurrentUser(): User | null {
  if (!isAuthenticated()) return null
  return storageService.get<User | null>(GlobalKeys.user, null)
}

/** Update the current account's display name (kept in sync with the session). */
function updateProfile(patch: { name: string }): User {
  const current = getCurrentUser()
  if (!current) throw new Error('Not authenticated.')
  const accounts = getAccounts()
  const idx = accounts.findIndex((a) => a.id === current.id)
  if (idx === -1) throw new Error('Account not found.')
  accounts[idx] = { ...accounts[idx], name: patch.name.trim() || accounts[idx].name }
  saveAccounts(accounts)
  const user = toUser(accounts[idx])
  storageService.set(GlobalKeys.user, user)
  return user
}

export const authService = {
  register,
  login,
  logout,
  getToken,
  isAuthenticated,
  getCurrentUser,
  updateProfile,
}
