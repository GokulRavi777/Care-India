import { NextResponse } from 'next/server'

const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-2.5-flash'
]

export async function POST(request: Request) {
  try {
    const { diagnosis, income, state, hospitalType } = await request.json()

    if (!diagnosis || !income || !state) {
      return NextResponse.json({ error: 'Missing required inputs: diagnosis, income, or state' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 })
    }

    const promptText = `
Analyze the following patient scenario for Indian healthcare scheme eligibility and generic medicine savings:
- Diagnosis/Treatment: "${diagnosis}"
- Annual Household Income: "${income}"
- State of Residence: "${state}"
- Hospital Type: "${hospitalType || 'Not specified'}"

Determine their eligibility for:
1. Ayushman Bharat PM-JAY (national scheme).
2. Any major state-specific health entitlement scheme active in their state (e.g., Mahatma Jyotirao Phule Jan Arogya Yojana in Maharashtra, Swasthya Sathy in West Bengal, Aarogyasri in Andhra Pradesh, Chief Minister's Comprehensive Health Insurance Scheme in Tamil Nadu, Delhi Arogya Kosh in Delhi, Arogya Karnataka, etc.).
3. Suggest generic vs branded medicine savings for 3-4 typical medications prescribed for their diagnosis/treatment.

Return a JSON object conforming exactly to this schema:
{
  "schemes": [
    {
      "name": "string (Scheme name)",
      "coverage": "string (e.g., Up to ₹5 Lakhs per family per year)",
      "eligibility": "string (one of: 'Eligible', 'Likely Eligible', 'Not Eligible')",
      "reason": "string (Detailed reason matching their income and state eligibility conditions)",
      "cashless": "boolean (Whether the scheme is cashless at empanelled hospitals)",
      "howToAvail": [
        "string (Step 1 to avail benefits)",
        "string (Step 2 to avail benefits)",
        "string (Step 3 to avail benefits)"
      ]
    }
  ],
  "genericSavings": [
    {
      "genericName": "string (e.g., Atorvastatin 10mg)",
      "brandExample": "string (e.g., Lipitor / Atorva)",
      "brandPrice": "number (Estimated price for branded 10-tablet strip in ₹)",
      "genericPrice": "number (Estimated price for generic / Jan Aushadhi strip in ₹)",
      "savingsPercent": "number (Calculated savings percentage, integer)"
    }
  ]
}

Provide realistic and factual Indian healthcare scheme details. If they reside in a state with an active state-specific scheme, prioritize listing it. Ensure all prices and details are realistic approximations for the Indian pharmaceutical market.
`

    let parsedResult = null
    let lastError: Error | null = null

    for (const model of GEMINI_MODELS) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: promptText
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json'
            }
          })
        })

        if (!response.ok) {
          const errText = await response.text()
          console.warn(`Gemini model ${model} failed for scheme matching (${response.status}):`, errText)
          lastError = new Error(errText)
          continue
        }

        const resData = await response.json()
        const contentText = resData.candidates?.[0]?.content?.parts?.[0]?.text
        if (!contentText) {
          continue
        }

        parsedResult = JSON.parse(contentText)
        if (parsedResult) break
      } catch (err: unknown) {
        console.warn(`Error trying Gemini model ${model} for scheme matching:`, err)
        lastError = err instanceof Error ? err : new Error(String(err))
      }
    }

    if (!parsedResult) {
      console.error('All Gemini scheme matching models failed:', lastError)
      return NextResponse.json({ error: 'Failed to retrieve scheme matches from AI. Please try again.' }, { status: 502 })
    }

    return NextResponse.json(parsedResult)
  } catch (error: unknown) {
    console.error('Scheme matching error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
