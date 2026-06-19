import Link from 'next/link'
import type { Course } from '@/types'
import { formatHours } from '@/lib/utils'

export function CourseCard({ course }: { course: Course & { screen_count?: number } }) {
  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200 hover:border-violet-300 hover:shadow-lg transition-all overflow-hidden">
      {/* Colour header */}
      <div className="h-2 bg-gradient-to-r from-violet-600 to-violet-400" />

      <div className="flex flex-col flex-1 p-6 gap-4">
        {/* Kind badge */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${
            course.kind === 'course'
              ? 'bg-violet-100 text-violet-700'
              : 'bg-slate-100 text-slate-600'
          }`}>
            {course.kind === 'course' ? 'CPD Course' : 'Curriculum Pack'}
          </span>
          {course.certificate_enabled && (
            <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
              🏆 Certificate
            </span>
          )}
        </div>

        {/* Title + description */}
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-violet-700 transition-colors leading-snug">
            {course.title}
          </h2>
          {course.description && (
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
              {course.description}
            </p>
          )}
        </div>

        {/* Category pills */}
        {course.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {course.categories.map(cat => (
              <span key={cat} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            {course.screen_count !== undefined && (
              <span>{course.screen_count} screens</span>
            )}
          </div>
          <Link
            href={`/course/${course.id}`}
            className="text-sm font-semibold text-violet-600 hover:text-violet-800 transition-colors"
          >
            Start →
          </Link>
        </div>
      </div>
    </div>
  )
}
