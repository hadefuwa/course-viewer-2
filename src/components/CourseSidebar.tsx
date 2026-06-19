'use client'
import Link from 'next/link'
import { useProgress } from '@/hooks/useProgress'
import { formatHours } from '@/lib/utils'
import type { Screen } from '@/types'

interface Props {
  courseId: string
  courseTitle: string
  screens: Screen[]
  activeScreenId: string
}

export function CourseSidebar({ courseId, courseTitle, screens, activeScreenId }: Props) {
  const { completed, toggle, percent } = useProgress(courseId, screens.map(s => s.id))

  return (
    <aside className="ms-sidebar">
      {/* Course header */}
      <div className="ms-header">
        <div className="ms-brand">Matrix TSL</div>
        <div className="ms-course-code">{courseId}</div>
        <div className="ms-course-title">{courseTitle}</div>
        <Link href="/" className="ms-back">← All courses</Link>
      </div>

      {/* Overall progress */}
      <div className="ms-overall">
        <div className="ms-overall-row">
          <span className="ms-overall-label">Progress</span>
          <span className="ms-overall-pct">{percent}%</span>
        </div>
        <div className="ms-bar">
          <span className="ms-bar-fill" style={{ width: `${percent}%` }} />
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '0.4rem' }}>
          {completed.size} of {screens.length} completed
        </div>
      </div>

      {/* Screen list */}
      <nav className="ms-nav" aria-label="Course screens">
        {screens.map((screen, i) => {
          const isActive = screen.id === activeScreenId
          const isDone = completed.has(screen.id)
          return (
            <div key={screen.id} style={{ padding: '0 0.65rem' }}>
              <div className={`screen-item${isActive ? ' active' : ''}${isDone ? ' completed' : ''}`}>
                <button
                  className="screen-checkbox"
                  onClick={(e) => { e.preventDefault(); toggle(screen.id) }}
                  aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
                />
                <Link
                  href={`/course/${courseId}/screen/${screen.id}`}
                  className="screen-title"
                  style={{ textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {screen.title}
                </Link>
                <span className="screen-num">{i + 1}</span>
                {screen.hours > 0 && (
                  <span className="screen-hours">{formatHours(screen.hours)}</span>
                )}
              </div>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
