'use client'
import { youtubeId } from '@/lib/utils'

export function YouTubeViewer({ src }: { src: string }) {
  const id = youtubeId(src)
  if (!id) return <p className="text-red-500">Invalid YouTube URL</p>
  return (
    <div className="w-full aspect-video">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        className="w-full h-full rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
