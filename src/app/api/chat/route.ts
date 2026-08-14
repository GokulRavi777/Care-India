import { NextResponse } from 'next/server'
import { getOfflineHealthcareAnswer } from '@/lib/offlineHealthcareKnowledge'

const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-2.5-flash'
]

const SYSTEM_PROMPT = `You are "Care India AI Navigator", a knowledgeable, compassionate Indian healthcare affordability and legal rights assistant.
Your expertise covers:
1. Hospital Bill Auditing & Discrepancies: NPPA price ceilings on cardiac stents, orthopedic implants, NLEM essential drugs, duplicate nursing/ICU charges, and patient rights under Clinical Establishments Acts.
2. Government Schemes: Ayushman Bharat PM-JAY (including 2024-2026 senior citizen 70+ expansion), state schemes (MJPJAY Maharashtra, CMCHIS Tamil Nadu, Aarogyasri AP/TS, Swasthya Sathi WB, DAK Delhi, AB-ArK Karnataka).
3. Health Insurance & IRDAI Guidelines: 60-minute cashless pre-authorization, 3-hour discharge mandates, pre-existing disease limits, Ombudsman and Bima Bharosa escalation procedures.
4. Generic Medicines: Jan Aushadhi (PMBJP) equivalents, salt names, and typical 50-85% savings across cardiology, diabetes, hypertension, and orthopedic treatments.

Always format your response with clean Markdown (headings, bullet points, bold key terms) for maximum clarity. Keep explanations practical, empathetic, and actionable for Indian patients and families.`

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]?.content || ''
    const apiKey = process.env.GEMINI_API_KEY

    // Try online Gemini model chain if API key is present
    if (apiKey) {
      // Format chat history for Gemini generateContent
      const contents = [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }]
        },
        {
          role: 'model',
          parts: [{ text: 'Understood. I am ready to guide Indian patients and families with expert healthcare financial navigation and rights.' }]
        },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }))
      ]

      for (const model of GEMINI_MODELS) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
          const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
          })

          if (!response.ok) {
            console.warn(`Gemini chat model ${model} failed (${response.status})`)
            continue
          }

          const data = await response.json()
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) {
            return NextResponse.json({
              reply: text,
              source: 'gemini_online',
              model: model
            })
          }
        } catch (err) {
          console.warn(`Error connecting to ${model}:`, err)
        }
      }
    }

    // Fallback: Deterministic Offline Knowledge Engine
    const offlineResult = getOfflineHealthcareAnswer(lastMessage)
    return NextResponse.json({
      reply: `${offlineResult.answer}\n\n*(⚡ Generated via Care India Local Knowledge Engine)*`,
      source: 'offline_knowledge',
      topic: offlineResult.matchedTopic
    })
  } catch (error: unknown) {
    console.error('Chat endpoint error:', error)
    const lastUserQuery = 'hospital bill dispute'
    const fallback = getOfflineHealthcareAnswer(lastUserQuery)
    return NextResponse.json({
      reply: fallback.answer,
      source: 'offline_knowledge'
    })
  }
}
