'use client'

export function PowerPointCard({ src, title }: { src: string; title: string }) {
  const filename = src.split('/').pop() ?? title
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 px-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
      <div className="text-6xl">📊</div>
      <div className="text-center">
        <p className="text-lg font-semibold text-slate-800 mb-1">{title}</p>
        <p className="text-sm text-slate-500 mb-6">{filename}</p>
        <a
          href={src}
          download
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Download PowerPoint
        </a>
      </div>
    </div>
  )
}
