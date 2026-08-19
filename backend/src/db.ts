/**
 * db.ts — a single, reusable MongoClient for the whole process.
 *
 * connectDB() is called once at startup: it connects, runs a ping, and caches
 * the Db. Every request reuses the same client/connection pool via getDB() /
 * collections() — we NEVER create a MongoClient per request.
 */
import { MongoClient, type Db, type Collection } from 'mongodb'
import type { ConversationDoc, MetricDoc, SessionDoc } from './types.js'

const DB_NAME = 'deskrobo'

let client: MongoClient | null = null
let db: Db | null = null

export async function connectDB(): Promise<Db> {
  if (db) return db

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to backend/.env')
  }

  client = new MongoClient(uri)
  await client.connect()
  db = client.db(DB_NAME)

  // Startup ping — fail fast if the database is unreachable.
  await db.command({ ping: 1 })
  console.log(`[NEO] MongoDB connected — database "${DB_NAME}", ping OK`)

  return db
}

export function getDB(): Db {
  if (!db) throw new Error('Database not initialized. Call connectDB() first.')
  return db
}

/** Typed handles to the four deskrobo collections. */
export function collections(): {
  users: Collection
  sessions: Collection<SessionDoc>
  metrics: Collection<MetricDoc>
  conversations: Collection<ConversationDoc>
} {
  const d = getDB()
  return {
    users: d.collection('users'),
    sessions: d.collection<SessionDoc>('sessions'),
    metrics: d.collection<MetricDoc>('metrics'),
    conversations: d.collection<ConversationDoc>('conversations'),
  }
}

export async function closeDB(): Promise<void> {
  await client?.close()
  client = null
  db = null
}
