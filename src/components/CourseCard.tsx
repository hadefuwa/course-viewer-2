import Link from 'next/link'
import type { Course } from '@/types'

export function CourseCard({ course }: { course: Course & { screen_count?: number } }) {
  return (
    <article className="course-card">
      {/* Thumbnail — solid gradient until we have real images */}
      <Link href={`/course/${course.id}`} className="thumb" aria-label={course.title}
        style={{ background: 'linear-gradient(135deg, var(--primary-darker) 0%, var(--primary) 100%)' }}>
        {course.kind === 'course' && (
          <span className="thumb-tag">CPD</span>
        )}
      </Link>

      <div className="body">
        {/* Categories */}
        {course.categories.length > 0 && (
          <div className="card-cats">
            {course.categories.map(cat => (
              <span key={cat} className="card-cat">{cat}</span>
            ))}
          </div>
        )}

        <div className="code">{course.id}</div>
        <h3>{course.title}</h3>
        {course.description && <p>{course.description}</p>}

        {/* Meta chips */}
        <div className="meta">
          {course.screen_count !== undefined && (
            <span className="chip">
              <strong>{course.screen_count}</strong> screens
            </span>
          )}
          {course.certificate_enabled && (
            <span className="chip">🏆 Certificate</span>
          )}
        </div>

        {/* CTA */}
        <div className="actions">
          <Link href={`/course/${course.id}`} className="btn btn-primary">
            Start course <span className="btn-arrow">→</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
