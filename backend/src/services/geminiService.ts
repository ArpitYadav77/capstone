/**
 * geminiService — the NEO voice-assistant reasoning layer.
 *
 * Uses the official Google GenAI SDK (@google/genai) with function calling so
 * the model reads LIVE NEO metrics via backend tools instead of guessing.
 * Gemini is used ONLY for conversation/reasoning — never for webcam analysis,
 * and no video is ever sent to it.
 */
import { GoogleGenAI, Type } from '@google/genai'
import { getLatest, getSessionStats } from '../state.js'
import { runTool } from './neoTools.js'

const SYSTEM_INSTRUCTION = `You are NEO, a focus-and-wellbeing desk companion.
- Answer briefly and conversationally (1–3 sentences) — your replies are spoken aloud.
- For anything about the user's current focus, attention, fatigue, or session, CALL the tools to get real data; never invent numbers.
- Talk in terms of attention and fatigue-related behavioral indicators. Never diagnose stress, emotion, or any medical condition.
- If asked to start/stop monitoring or to take a break, call the matching tool.`

const NO_ARGS = { type: Type.OBJECT, properties: {} }

const functionDeclarations = [
  { name: 'get_current_attention', description: "Get the user's current attention score, fatigue indicator, gaze, blink rate and status.", parameters: NO_ARGS },
  { name: 'get_session_stats', description: 'Get session focus stats: current & average attention, focus duration, distraction events.', parameters: NO_ARGS },
  { name: 'start_monitoring', description: 'Start counting a focus-monitoring session.', parameters: NO_ARGS },
  { name: 'stop_monitoring', description: 'Stop the focus-monitoring session.', parameters: NO_ARGS },
  { name: 'take_break', description: 'Suggest a short break and signal the NEO device.', parameters: NO_ARGS },
]

function contextLine(): string {
  const m = getLatest()
  const s = getSessionStats()
  if (!m) return 'Live NEO context: CV engine not connected yet.'
  return `Live NEO context — current attention: ${m.attentionScore}%, average: ${s.averageAttention}%, status: ${m.status}, gaze: ${m.gaze.direction}, distraction events: ${s.distractionEvents}.`
}

export interface ChatResult {
  reply: string
  toolsUsed: string[]
}

export async function chat(userMessage: string): Promise<ChatResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Add it to backend/.env to enable the assistant.')
  }

  const ai = new GoogleGenAI({ apiKey })
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash'

  const chatSession = ai.chats.create({
    model,
    config: {
      systemInstruction: `${SYSTEM_INSTRUCTION}\n${contextLine()}`,
      tools: [{ functionDeclarations }],
    },
  })

  const toolsUsed: string[] = []
  let response = await chatSession.sendMessage({ message: userMessage })

  let guard = 0
  while (response.functionCalls && response.functionCalls.length > 0 && guard < 5) {
    guard += 1
    const parts = []
    for (const call of response.functionCalls) {
      const name = call.name ?? ''
      toolsUsed.push(name)
      const result = await runTool(name, (call.args as Record<string, unknown>) ?? {})
      parts.push({ functionResponse: { name, response: { result } } })
    }
    response = await chatSession.sendMessage({ message: parts })
  }

  return { reply: response.text ?? "I couldn't produce a reply.", toolsUsed }
}
