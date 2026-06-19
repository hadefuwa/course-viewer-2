'use client'
import { CourseSidebar } from '@/components/CourseSidebar'
import { DocumentViewer } from '@/components/viewers/DocumentViewer'
import { YouTubeViewer } from '@/components/viewers/YouTubeViewer'
import { PdfViewer } from '@/components/viewers/PdfViewer'
import { ImageViewer } from '@/components/viewers/ImageViewer'
import { PowerPointCard } from '@/components/viewers/PowerPointCard'
import { screenContentUrl, formatHours } from '@/lib/utils'
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
      return <iframe src={screen.src!} title={screen.title} className="screen-stage" style={{ flex: 1, border: 0, minHeight: '75vh' }} />
    default:
      return (
        <div className="stage-missing">
          <div className="stage-missing-inner">
            <div className="icon">❓</div>
            <h3>No viewer for this type</h3>
            <p>Screen type &ldquo;{screen.type}&rdquo; is not yet supported.</p>
          </div>
        </div>
      )
  }
}

export default function ScreenClient({ course, screens, activeScreen }: Props) {
  return (
    <div className="app-body">
      <CourseSidebar
        courseId={course.id}
        courseTitle={course.title}
        screens={screens}
        activeScreenId={activeScreen.id}
      />

      {/* Main viewer */}
      <main className="viewer-main">
        {/* Screen bar */}
        <div className="screen-bar">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="meta">
              <span className="meta-k">{activeScreen.type}</span>
              {activeScreen.hours > 0 && (
                <span>~{formatHours(activeScreen.hours)}</span>
              )}
              {activeScreen.equipment && (
                <span>Equipment: {activeScreen.equipment}</span>
              )}
            </div>
            <h2>{activeScreen.title}</h2>
          </div>
        </div>

        {/* Content stage */}
        <div className="screen-stage">
          {activeScreen.missing ? (
            <div className="stage-missing">
              <div className="stage-missing-inner">
                <div className="icon">🚧</div>
                <h3>Content coming soon</h3>
                <p>This screen hasn&apos;t been linked to content yet.</p>
              </div>
            </div>
          ) : (
            <ScreenViewer screen={activeScreen} />
          )}
        </div>
      </main>
    </div>
  )
}
