'use client'

import { useState, useEffect, useCallback } from 'react'

interface Course {
  id: string
  title: string
  kind: string
  certificate_enabled: boolean
  categories: string[]
  screens?: Screen[]
}

interface Screen {
  id: string
  type: string
  title: string
  hours: number
  missing: boolean
}

const NAME_KEY = 'matrix-lms:account-name'
const PROGRESS_PFX = 'matrix-lms:progress:'

function getProgress(courseId: string): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(PROGRESS_PFX + courseId) || '{}') } catch { return {} }
}

function getCourseStats(course: Course) {
  const screens = course.screens ?? []
  if (!screens.length) return { completed: 0, total: 0, pct: 0 }
  const prog = getProgress(course.id)
  const completed = screens.filter(s => Boolean(prog[s.id])).length
  const total = screens.length
  return { completed, total, pct: total > 0 ? Math.round(completed / total * 100) : 0 }
}

export default function AccountPage() {
  const [name, setName] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCourse, setActiveCourse] = useState<string | null>(null)

  useEffect(() => {
    setName(localStorage.getItem(NAME_KEY) || '')

    // Fetch all courses with their screens
    const loadAll = async () => {
      try {
        const res = await fetch('/api/courses')
        const list: Course[] = await res.json()
        // Fetch screens for each course
        const withScreens = await Promise.all(
          list.map(async c => {
            try {
              const sr = await fetch(`/api/courses/${c.id}`)
              const full = await sr.json()
              return { ...c, screens: full.screens ?? [] }
            } catch { return c }
          })
        )
        setCourses(withScreens)
        if (withScreens.length > 0) setActiveCourse(withScreens[0].id)
      } catch { /* ignore */ }
      setLoading(false)
    }
    loadAll()
  }, [])

  const handleNameChange = useCallback((v: string) => {
    setName(v)
    localStorage.setItem(NAME_KEY, v)
  }, [])

  const greeting = name.trim() ? `Hi, ${name.trim().split(' ')[0]}` : 'My Account'
  const visibleCourses = courses.filter(c => c.kind !== 'pack')

  const totalCompleted = visibleCourses.reduce((acc, c) => acc + getCourseStats(c).completed, 0)
  const totalScreens = visibleCourses.reduce((acc, c) => acc + (c.screens?.length ?? 0), 0)

  const activeCourseData = courses.find(c => c.id === activeCourse)
  const activeProgress = activeCourse ? getProgress(activeCourse) : {}

  function handleReset() {
    if (!confirm('Reset all progress? This will wipe completion across every course. Cannot be undone.')) return
    Object.keys(localStorage)
      .filter(k => k.startsWith('matrix-lms:'))
      .forEach(k => localStorage.removeItem(k))
    window.location.reload()
  }

  return (
    <>
      <section className="stats-hero account-hero">
        <div className="hero-inner">
          <span className="eyebrow">Your account</span>
          <h1 id="account-greeting">{greeting}</h1>
          <p>Your progress, time logged, certificates and achievements — all in one place.</p>
          <div className="account-name-row">
            <label htmlFor="account-name-input">Your name (used on certificates)</label>
            <input
              type="text"
              id="account-name-input"
              placeholder="Enter your full name"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
            />
          </div>
        </div>
      </section>

      <main className="stats-section">

        {/* ── Stats grid ── */}
        <div className="stats-grid">
          <div className="stat-card stat-card-lg stat-card-time">
            <span className="stat-card-eyebrow">Total time</span>
            <span className="stat-card-num">—</span>
            <span className="stat-card-foot">across all courses</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-eyebrow">Day streak</span>
            <span className="stat-card-num">—</span>
            <span className="stat-card-foot">days</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-eyebrow">Screens ticked</span>
            <span className="stat-card-num">{totalCompleted}</span>
            <span className="stat-card-foot">of {totalScreens} total</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-eyebrow">Courses</span>
            <span className="stat-card-num">{visibleCourses.length}</span>
            <span className="stat-card-foot">enrolled</span>
          </div>
        </div>

        {/* ── My courses ── */}
        <div className="stats-courses">
          <h2 className="stats-h2">My courses</h2>
          <p className="account-section-hint">
            Continue where you left off — and download a certificate the moment a course hits 100%.
          </p>
          <div className="stats-courses-list">
            {loading && <p className="stage-loading">Loading courses…</p>}
            {!loading && visibleCourses.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No courses found.</p>
            )}
            {visibleCourses.map(course => {
              const cs = getCourseStats(course)
              const isComplete = cs.pct === 100 && cs.total > 0
              const hasCert = course.certificate_enabled
              const status = isComplete ? 'Completed' : cs.completed > 0 ? 'In progress' : 'Not started'
              const statusCls = isComplete ? 'status-pill done' : cs.completed > 0 ? 'status-pill todo' : 'status-pill missing'
              return (
                <div key={course.id} className="account-course-row">
                  <a
                    className="stats-course-row-thumb"
                    href={`/course/${course.id}`}
                    style={{ backgroundImage: `url('/content/${course.id}/opening.svg')` }}
                  />
                  <div className="stats-course-row-body">
                    <div className="stats-course-row-head">
                      <span className="code">{course.id}</span>
                      <strong>{course.title}</strong>
                      <span className={statusCls}>{status}</span>
                    </div>
                    <div className="stats-course-row-bar">
                      <span style={{ width: `${cs.pct}%` }} />
                    </div>
                    <div className="stats-course-row-meta">
                      <span><strong>{cs.completed}</strong> / {cs.total} screens</span>
                      <span><strong>{cs.pct}%</strong> complete</span>
                    </div>
                  </div>
                  <div className="account-course-actions">
                    <a className="btn btn-secondary" href={`/course/${course.id}`}>
                      {cs.completed > 0 ? 'Continue' : 'Start'} →
                    </a>
                    {hasCert && (
                      <a
                        className={`btn ${isComplete ? 'btn-primary' : 'btn-secondary'}`}
                        href={isComplete ? `/certificate/${course.id}` : '#'}
                        aria-disabled={!isComplete ? 'true' : undefined}
                        style={!isComplete ? { opacity: 0.55, pointerEvents: 'none' } : undefined}
                      >
                        {isComplete ? '🎓 Download certificate' : 'Certificate at 100%'}
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Time per screen ── */}
        {!loading && activeCourseData && (
          <div className="stats-screens">
            <div className="stats-screens-header">
              <h2 className="stats-h2">Time per screen</h2>
              <select
                className="stats-select"
                value={activeCourse ?? ''}
                onChange={e => setActiveCourse(e.target.value)}
              >
                {visibleCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.id} · {c.title}</option>
                ))}
              </select>
            </div>
            <div className="stats-screens-table">
              <div className="stats-screen-row stats-screen-head">
                <span>#</span>
                <span>Title</span>
                <span>Type</span>
                <span>Status</span>
                <span className="num">Time</span>
              </div>
              {(activeCourseData.screens ?? []).map((s, i) => {
                const done = Boolean(activeProgress[s.id])
                return (
                  <div key={s.id} className={`stats-screen-row${done ? ' done' : ''}`}>
                    <span className="num">{i + 1}</span>
                    <span className="title">{s.title}</span>
                    <span><span className="type-label">{s.type}</span></span>
                    <span>
                      {done
                        ? <span className="status-pill done">Complete</span>
                        : s.missing
                          ? <span className="status-pill missing">Missing</span>
                          : <span className="status-pill todo">Pending</span>}
                    </span>
                    <span className="num">—</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Achievements ── */}
        <div className="stats-achievements">
          <h2 className="stats-h2">Achievements</h2>
          <div className="achievements-grid">
            <div className="achievement locked">
              <div className="achievement-icon">🎓</div>
              <div className="achievement-title">First completion</div>
              <div className="achievement-desc">Complete your first course</div>
            </div>
            <div className="achievement locked">
              <div className="achievement-icon">⚡</div>
              <div className="achievement-title">Quick start</div>
              <div className="achievement-desc">Complete a screen in under 5 minutes</div>
            </div>
            <div className="achievement locked">
              <div className="achievement-icon">🔥</div>
              <div className="achievement-title">On a roll</div>
              <div className="achievement-desc">3-day learning streak</div>
            </div>
            <div className="achievement locked">
              <div className="achievement-icon">🏆</div>
              <div className="achievement-title">Course master</div>
              <div className="achievement-desc">Complete all available courses</div>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="stats-actions">
          <button className="btn btn-secondary" onClick={handleReset}>
            Reset all progress
          </button>
          <a className="btn btn-ghost" href="/">Back to courses</a>
        </div>

      </main>
    </>
  )
}
