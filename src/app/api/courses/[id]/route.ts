import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: course, error: courseErr } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()

  if (courseErr) return NextResponse.json({ error: courseErr.message }, { status: 404 })

  const { data: screens, error: screensErr } = await supabase
    .from('screens')
    .select('*')
    .eq('course_id', id)
    .order('position', { ascending: true })

  if (screensErr) return NextResponse.json({ error: screensErr.message }, { status: 500 })

  return NextResponse.json({ ...course, screens })
}
