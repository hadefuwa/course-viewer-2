'use client'
import { CourseSidebar } from '@/components/CourseSidebar'
import { DocumentViewer } from '@/components/viewers/DocumentViewer'
import { YouTubeViewer } from '@/components/viewers/YouTubeViewer'
import { PdfViewer } from '@/components/viewers/PdfViewer'
import { ImageViewer } from '@/components/viewers/ImageViewer'
import { PowerPointCard } from '@/components/viewers/PowerPointCard'
import { screenContentUrl } from '@/lib/utils'
import type { Course, Screen } from '@/types'

interface Props {
  course: Course
  screens: Screen[]
  activeScreen: Screen
}

function ScreenViewer({ screen }: { screen: Screen }) {
  switch (screen.type) {
    case 'document':
      return <DocumentViewer contentUrl={screenContentUrl(screen)} />

    case 'youtube':
      return <YouTubeViewer src={screen.src!} />

    case 'pdf':
      return <PdfViewer src={screen.src!} title={screen.title} />

    case 'image':
      return <ImageViewer src={screen.src!} title={screen.title} />

    case 'powerpoint':
      return <PowerPointCard src={screen.src!} title={screen.title} />

    case 'html':
      return (
        <iframe
          src={screen.src!}
          title={screen.title}
          className="w-full border-0 min-h-[75vh]"
        />
      )

    default:
      return (
        <div className="flex items-center justify-center min-h-[50vh] text-slate-400">
          <p>No viewer for type: {screen.type}</p>
        </div>
      )
  }
}

export default function ScreenClient({ course, screens, activeScreen }: Props) {
  return (
    <div className="flex min-h-screen">
      <CourseSidebar
        courseId={course.id}
        courseTitle={course.title}
        screens={screens}
        activeScreenId={activeScreen.id}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Screen header */}
        <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1 capitalize">
                {activeScreen.type}
              </p>
              <h1 className="text-xl font-bold text-slate-900">{activeScreen.title}</h1>
              {activeScreen.equipment && (
                <p className="text-sm text-slate-500 mt-1">
                  <span className="font-medium">Equipment:</span> {activeScreen.equipment}
                </p>
              )}
            </div>
            {activeScreen.hours > 0 && (
              <span className="shrink-0 text-xs bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full">
                ~{activeScreen.hours}h
              </span>
            )}
          </div>
        </div>

        {/* Viewer */}
        <div className="flex-1 p-8">
          {activeScreen.missing ? (
            <div className="max-w-lg mx-auto mt-16 text-center">
              <p className="text-4xl mb-4">🚧</p>
              <h2 className="text-lg font-semibold text-slate-700 mb-2">Content coming soon</h2>
              <p className="text-slate-400 text-sm">This screen hasn&apos;t been linked to content yet.</p>
            </div>
          ) : (
            <ScreenViewer screen={activeScreen} />
          )}
        </div>
      </div>
    </div>
  )
}
