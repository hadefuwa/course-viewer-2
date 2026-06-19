import { createClient } from '@/lib/supabase/server'
import { CourseCard } from '@/components/CourseCard'
import type { Course } from '@/types'

export const dynamic = 'force-dynamic'

export default async function CatalogPage() {
  const supabase = await createClient()

  const { data: courses, error } = await supabase
    .from('courses')
    .select('*, screens(count)')
    .order('created_at')

  if (error) console.error('[catalog] supabase error:', error)

  // Flatten the count from the relation
  const enriched = (courses ?? []).map((c: Course & { screens: { count: number }[] }) => ({
    ...c,
    screen_count: c.screens?.[0]?.count ?? 0,
  }))

  // Collect unique categories for filter pills
  const allCategories = [...new Set(enriched.flatMap(c => c.categories))].sort()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-violet-600">Matrix TSL</span>
            <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Course Library</h1>
          </div>
          <div className="text-sm text-slate-400">
            {enriched.length} course{enriched.length !== 1 ? 's' : ''}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Category filter pills */}
        {allCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {allCategories.map(cat => (
              <span
                key={cat}
                className="text-sm bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full cursor-default"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Course grid */}
        {enriched.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">📚</p>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">No courses yet</h2>
            <p className="text-slate-500 text-sm">
              Import courses from the{' '}
              <a href="/admin" className="text-violet-600 hover:underline">admin panel</a>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enriched.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
