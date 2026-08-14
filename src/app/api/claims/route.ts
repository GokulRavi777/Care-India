import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'

// Supabase client helper with service-role and anon-key fallback
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Supabase credentials are not configured')
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// POST /api/claims  — insert or update a claim row
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, checklist_state, readiness_score } = body

    if (checklist_state === undefined || readiness_score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: checklist_state, readiness_score' },
        { status: 400 }
      )
    }

    // Server-side auth check
    const supabaseServer = await createServerClient()
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to save claims.' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    if (!id) {
      // INSERT: Insert new row and return the generated ID
      const { data, error } = await supabase
        .from('claims')
        .insert({
          user_id: user.id,
          checklist_state,
          readiness_score,
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (error) {
        console.error('[POST /api/claims] Supabase insert error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, id: data.id })
    } else {
      // UPDATE: Update existing row matching the ID
      const { data, error } = await supabase
        .from('claims')
        .update({
          checklist_state,
          readiness_score,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('id')

      if (error) {
        console.error('[POST /api/claims] Supabase update error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (!data || data.length === 0) {
        return NextResponse.json(
          { error: 'Claim not found in database. Please refresh the page to start a new claim.' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, id: data[0].id })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[POST /api/claims] Unexpected error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET /api/claims?id=<uuid>  — verify a row exists (used in manual testing)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    const supabase = createAdminClient()
    const query = supabase.from('claims').select('*')
    if (id) query.eq('id', id)

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ claims: data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
