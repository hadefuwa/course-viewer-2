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

  const enriched = (courses ?? []).map((c: Course & { screens: { count: number }[] }) => ({
    ...c,
    screen_count: c.screens?.[0]?.count ?? 0,
  }))

  const allCategories = [...new Set(enriched.flatMap(c => c.categories))].sort()
  const totalHours = enriched.reduce((sum, c) => sum + (c.screen_count ?? 0), 0)

  return (
    <>
      {/* Hero */}
      <section className="catalog-hero">
        <div className="hero-inner">
          <span className="eyebrow">Matrix TSL</span>
          <h1>Engineering Course Library</h1>
          <p>Professional development courses for electronic and electrical engineering technicians.</p>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-num">{enriched.length}</span>
              <span className="stat-label">Courses</span>
            </div>
            <div className="stat">
              <span className="stat-num">{totalHours}</span>
              <span className="stat-label">Screens</span>
            </div>
            <div className="stat">
              <span className="stat-num">{allCategories.length || '—'}</span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <div className="catalog-section">
        {allCategories.length > 0 && (
          <div className="catalog-filter">
            <button className="catalog-filter-pill active">All</button>
            {allCategories.map(cat => (
              <button key={cat} className="catalog-filter-pill">
                {cat}
                <span className="pill-count">{enriched.filter(c => c.categories.includes(cat)).length}</span>
              </button>
            ))}
          </div>
        )}

        <div className="catalog-heading">
          <h2>{enriched.length} course{enriched.length !== 1 ? 's' : ''}</h2>
        </div>

        {enriched.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</p>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>No courses yet</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Import courses from the <a href="/admin">admin panel</a>.
            </p>
          </div>
        ) : (
          <div className="catalog">
            {enriched.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
