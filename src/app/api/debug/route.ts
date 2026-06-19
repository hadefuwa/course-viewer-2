import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let queryResult = null
  let queryError = null

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('courses').select('id, title').limit(5)
    queryResult = data
    queryError = error
  } catch (e) {
    queryError = String(e)
  }

  return NextResponse.json({
    supabase_url: url ? url.slice(0, 30) + '...' : 'NOT SET',
    anon_key_set: !!key && key.length > 10,
    courses: queryResult,
    error: queryError,
  })
}
