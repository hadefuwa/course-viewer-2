'use client'
import { youtubeId } from '@/lib/utils'

export function YouTubeViewer({ src }: { src: string }) {
  const id = youtubeId(src)
  if (!id) return (
    <div className="stage-missing">
      <div className="stage-missing-inner">
        <div className="icon">⚠️</div>
        <h3>Invalid YouTube URL</h3>
        <p>{src}</p>
      </div>
    </div>
  )
  return (
    <div className="stage-youtube">
      <div className="stage-youtube-frame">
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}
