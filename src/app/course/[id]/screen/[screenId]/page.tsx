import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ScreenClient from './ScreenClient'

export const revalidate = 60

export default async function ScreenPage({
  params,
}: {
  params: Promise<{ id: string; screenId: string }>
}) {
  const { id, screenId } = await params
  const supabase = await createClient()

  const [{ data: course }, { data: screens }] = await Promise.all([
    supabase.from('courses').select('*').eq('id', id).single(),
    supabase.from('screens').select('*').eq('course_id', id).order('position'),
  ])

  if (!course) notFound()

  const activeScreen = (screens ?? []).find(s => s.id === screenId)
  if (!activeScreen) notFound()

  return (
    <ScreenClient
      course={course}
      screens={screens ?? []}
      activeScreen={activeScreen}
    />
  )
}
