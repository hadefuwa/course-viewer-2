'use client'

export function PowerPointCard({ src, title }: { src: string; title: string }) {
  const filename = src.split('/').pop() ?? title
  return (
    <div className="stage-powerpoint">
      <div className="stage-powerpoint-card">
        <div className="icon">📊</div>
        <h3>{title}</h3>
        <p>{filename}</p>
        <a href={src} download className="btn btn-primary">
          Download PowerPoint
        </a>
      </div>
    </div>
  )
}
