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
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        {/* Back */}
        <Link href="/" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
          ← Course Library
        </Link>

        {/* Hero card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
          margin: '1.5rem 0 2rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Thumbnail gradient */}
          <div style={{
            height: 140,
            background: 'linear-gradient(135deg, var(--primary-darker) 0%, var(--primary) 100%)',
          }} />

          <div style={{ padding: '2rem 2.5rem 2.5rem' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '1.8px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: 700, marginBottom: '0.5rem' }}>
              {course.kind === 'course' ? 'CPD Course' : 'Curriculum Pack'} · {course.id}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--primary-dark)', margin: '0 0 0.7rem', letterSpacing: '-0.01em' }}>
              {course.title}
            </h1>
            {course.description && (
              <p style={{ color: 'var(--text-muted)', maxWidth: '60ch', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
                {course.description}
              </p>
            )}

            {/* Stats */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <span><strong style={{ color: 'var(--text)', fontWeight: 700 }}>{screenList.length}</strong> screens</span>
              {totalHours > 0 && <span><strong style={{ color: 'var(--text)', fontWeight: 700 }}>{formatHours(totalHours)}</strong> estimated</span>}
              {course.certificate_enabled && <span>🏆 Certificate on completion</span>}
              {course.categories.map((c: string) => (
                <span key={c} className="card-cat" style={{ display: 'inline-block' }}>{c}</span>
              ))}
            </div>

            {firstScreen && (
              <Link href={`/course/${id}/screen/${firstScreen.id}`} className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.8rem 1.75rem' }}>
                Start course <span className="btn-arrow">→</span>
              </Link>
            )}
          </div>
        </div>

        {/* Screen list */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 1rem', letterSpacing: '-0.01em' }}>
          Contents
        </h2>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          {screenList.map((screen, i) => (
            <Link
              key={screen.id}
              href={`/course/${id}/screen/${screen.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.85rem 1.5rem',
                borderBottom: i < screenList.length - 1 ? '1px solid var(--border)' : 'none',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background 120ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-50)')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', width: '1.8em', textAlign: 'right', flexShrink: 0 }}>
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {screen.title}
                </p>
                {screen.section_heading && (
                  <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: 'var(--text-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {screen.section_heading}
                  </p>
                )}
              </div>
              <div style={{ flexShrink: 0, display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.76rem', color: 'var(--text-subtle)' }}>
                <span style={{ textTransform: 'capitalize' }}>{screen.type}</span>
                {screen.hours > 0 && <span>{formatHours(screen.hours)}</span>}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
