import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatHours } from '@/lib/utils'

export const revalidate = 60

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: course } = await supabase.from('courses').select('*').eq('id', id).single()
  if (!course) notFound()

  const { data: screens } = await supabase
    .from('screens')
    .select('*')
    .eq('course_id', id)
    .order('position')

  const screenList = screens ?? []
  const totalHours = screenList.reduce((s, sc) => s + (sc.hours ?? 0), 0)
  const firstScreen = screenList[0]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            ← Course Library
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-8">
          <div className="h-2 bg-gradient-to-r from-violet-600 to-violet-400" />
          <div className="p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-2 block">
                  {course.kind === 'course' ? 'CPD Course' : 'Curriculum Pack'} · {course.id}
                </span>
                <h1 className="text-3xl font-bold text-slate-900 mb-3">{course.title}</h1>
                {course.description && (
                  <p className="text-slate-500 max-w-2xl leading-relaxed">{course.description}</p>
                )}
              </div>
              {course.certificate_enabled && (
                <div className="text-center bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 shrink-0">
                  <div className="text-2xl mb-1">🏆</div>
                  <p className="text-xs font-semibold text-amber-700">Certificate<br/>on completion</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-100 text-sm text-slate-500">
              <span><strong className="text-slate-800">{screenList.length}</strong> screens</span>
              <span><strong className="text-slate-800">{formatHours(totalHours)}</strong> estimated</span>
              {course.categories.map((c: string) => (
                <span key={c} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{c}</span>
              ))}
            </div>

            {/* CTA */}
            {firstScreen && (
              <div className="mt-6">
                <Link
                  href={`/course/${id}/screen/${firstScreen.id}`}
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  Start course →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Screen list */}
        <h2 className="text-lg font-bold text-slate-800 mb-4">Contents</h2>
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {screenList.map((screen, i) => (
            <Link
              key={screen.id}
              href={`/course/${id}/screen/${screen.id}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
            >
              <span className="text-sm font-mono text-slate-400 w-6 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 group-hover:text-violet-700 truncate">
                  {screen.title}
                </p>
                {screen.section_heading && (
                  <p className="text-xs text-slate-400 truncate">{screen.section_heading}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-400 capitalize">{screen.type}</span>
                {screen.hours > 0 && (
                  <span className="text-xs text-slate-400">{formatHours(screen.hours)}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
