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
    <aside className="flex flex-col w-72 min-h-screen bg-slate-900 text-slate-100 shrink-0">
      {/* Header */}
      <div className="p-5 border-b border-slate-800">
        <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors mb-3 block">
          ← All courses
        </Link>
        <h1 className="text-sm font-bold text-white leading-snug">{courseTitle}</h1>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>{completed.size} of {screens.length} completed</span>
            <span>{percent}%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Screen list */}
      <nav className="flex-1 overflow-y-auto py-3">
        {screens.map((screen, i) => {
          const isActive = screen.id === activeScreenId
          const isDone = completed.has(screen.id)
          return (
            <div key={screen.id} className="flex items-start gap-2 px-3 py-1">
              {/* Completion button */}
              <button
                onClick={() => toggle(screen.id)}
                className={`mt-1 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isDone
                    ? 'bg-violet-500 border-violet-500 text-white'
                    : 'border-slate-600 hover:border-violet-400'
                }`}
                aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
              >
                {isDone && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* Screen link */}
              <Link
                href={`/course/${courseId}/screen/${screen.id}`}
                className={`flex-1 text-sm py-1 leading-snug transition-colors ${
                  isActive
                    ? 'text-white font-semibold'
                    : isDone
                    ? 'text-slate-500 hover:text-slate-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-slate-600 mr-1.5 text-xs">{i + 1}.</span>
                {screen.title}
                {screen.hours > 0 && (
                  <span className="ml-1.5 text-xs text-slate-600">{formatHours(screen.hours)}</span>
                )}
              </Link>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
