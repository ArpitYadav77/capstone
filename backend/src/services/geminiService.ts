/**
 * geminiService — isolated Gemini reasoning for the NEO assistant.
 *
 * Uses the current official Google GenAI SDK (@google/genai). The API key stays
 * server-side (GEMINI_API_KEY) and is never exposed to the browser. Only derived
 * NEO metrics/context are sent — never webcam frames or video.
 */
import { GoogleGenAI } from '@google/genai'

const SYSTEM_INSTRUCTION = `You are NEO, an AI desk companion.
- Answer concisely and naturally (1-3 sentences) — replies may be spoken aloud.
- When the user asks about focus, attention, fatigue or their session, use the supplied NEO metrics/context. If no metrics are provided, say so briefly.
- Describe all values as behavioral indicators or estimates.
- Never claim to medically diagnose stress, mental health, emotions, or cognitive disorders.`

export function geminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash'
}

/**
 * Generate a reply from a NEO context string + the user's message.
 * Throws a clear error if the key is missing or the request fails.
 */
export async function generateReply(userMessage: string, context: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Add it to backend/.env to enable the assistant.')
  }

  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({
    model: geminiModel(),
    contents: `${context}\n\nUser: ${userMessage}`,
    config: { systemInstruction: SYSTEM_INSTRUCTION },
  })

  return response.text?.trim() || "I couldn't produce a reply just now."
}
