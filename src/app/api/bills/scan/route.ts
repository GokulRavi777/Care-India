import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Active lightweight free-tier models in priority order (ultra-fast, low latency)
const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-2.5-flash'
]

async function tryGeminiOCR(apiKey: string, base64Data: string, mimeType: string) {
  let lastError: Error | null = null

  for (const model of GEMINI_MODELS) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Extract all line items from this medical bill or prescription. Return a JSON array where each item is an object with "description" (string) and "amount" (number). Do not wrap the JSON in markdown code blocks. Example output: [{"description": "ICU Charges", "amount": 15000}]'
                },
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: base64Data
                  }
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
        console.warn(`Gemini model ${model} failed (${response.status}):`, errText)
        lastError = new Error(`Model ${model} error: ${errText}`)
        continue // Try next lightweight model
      }

      const resData = await response.json()
      const contentText = resData.candidates?.[0]?.content?.parts?.[0]?.text
      if (!contentText) {
        lastError = new Error(`Model ${model} returned empty response`)
        continue
      }

      let cleanedContent = contentText.trim()
      const startIdx = cleanedContent.indexOf('[')
      const endIdx = cleanedContent.lastIndexOf(']')

      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        cleanedContent = cleanedContent.substring(startIdx, endIdx + 1)
      }

      const parsed = JSON.parse(cleanedContent)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Array<{ description: string; amount: number }>
      }
    } catch (err: unknown) {
      console.warn(`Error trying Gemini model ${model}:`, err)
      lastError = err instanceof Error ? err : new Error(String(err))
    }
  }

  throw lastError || new Error('All Gemini OCR models failed')
}

// 100% Free, lightweight local OCR fallback using Tesseract.js
async function tryLocalTesseractOCR(buffer: Buffer): Promise<Array<{ description: string; amount: number }>> {
  try {
    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker('eng')
    const ret = await worker.recognize(buffer)
    await worker.terminate()

    const lines = ret.data.text.split('\n')
    const items: Array<{ description: string; amount: number }> = []

    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line || line.length < 3) continue

      // Regex matching lines with prices (e.g., "ICU Charges 15000", "Consultation: ₹1200", "Medication Rs. 450.00")
      const priceMatch =
        line.match(/(?:(?:rs\.?|inr|₹)\s*)?([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)\s*$/i) ||
        line.match(/(?:rs\.?|inr|₹)\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+)/i)

      if (priceMatch) {
        const priceStr = priceMatch[1].replace(/,/g, '')
        const amount = parseFloat(priceStr)

        const description = line
          .replace(priceMatch[0], '')
          .replace(/[|:_\-=]+/g, ' ')
          .replace(/^\d+[\.\)\-]\s*/, '')
          .trim()

        if (description && !isNaN(amount) && amount > 0 && description.length >= 2) {
          const lowerDesc = description.toLowerCase()
          const ignoreKeywords = ['total', 'subtotal', 'gstin', 'phone', 'invoice', 'date', 'bill no', 'receipt', 'tax', 'balance']
          const shouldIgnore = ignoreKeywords.some(kw => lowerDesc.includes(kw))

          if (!shouldIgnore) {
            items.push({ description, amount })
          }
        }
      }
    }

    return items
  } catch (err) {
    console.error('Tesseract local OCR fallback error:', err)
    return []
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')
    const mimeType = file.type

    let items: Array<{ description: string; amount: number }> = []
    let usedFallback = false

    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey) {
      try {
        items = await tryGeminiOCR(apiKey, base64Data, mimeType)
      } catch (geminiErr) {
        console.warn('Gemini OCR chain failed, attempting local lightweight OCR fallback:', geminiErr)
        usedFallback = true
      }
    } else {
      usedFallback = true
    }

    // If Gemini failed or no API key, run local offline Tesseract engine
    if (items.length === 0) {
      items = await tryLocalTesseractOCR(buffer)
      usedFallback = true
    }

    if (items.length === 0) {
      return NextResponse.json({
        error: 'Unable to detect legible bill items. Try uploading a clearer photo or enter items manually in the ledger below.'
      }, { status: 422 })
    }

    // Retrieve reference prices from Supabase
    const supabase = await createClient()
    const { data: refPrices, error: refError } = await supabase
      .from('reference_prices')
      .select('keyword, reference_amount')

    if (refError) {
      console.error('Supabase fetch reference prices error:', refError)
    }

    // Perform matching and compute status
    const annotatedItems = items.map(item => {
      const descLower = (item.description || '').toLowerCase()
      const matchedRef = refPrices?.find(rp => descLower.includes((rp.keyword || '').toLowerCase()))

      if (matchedRef) {
        const charged = Number(item.amount) || 0
        const refAmt = Number(matchedRef.reference_amount) || 0
        let status: 'normal' | 'questionable' | 'inflated' = 'normal'

        if (charged <= refAmt * 1.08) {
          status = 'normal'
        } else if (charged <= refAmt * 1.30) {
          status = 'questionable'
        } else {
          status = 'inflated'
        }

        return {
          description: item.description,
          charged_amount: charged,
          reference_amount: refAmt,
          status
        }
      }

      return {
        description: item.description,
        charged_amount: Number(item.amount) || 0,
        reference_amount: null,
        status: 'normal' as const
      }
    })

    return NextResponse.json({ 
      items: annotatedItems,
      source: usedFallback ? 'local_ocr' : 'gemini_lightweight'
    })
  } catch (error: unknown) {
    console.error('Scan error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
