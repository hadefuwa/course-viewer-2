'use client'

export function PdfViewer({ src, title }: { src: string; title: string }) {
  return (
    <div className="w-full h-full min-h-[75vh]">
      <iframe
        src={src}
        title={title}
        className="w-full h-full min-h-[75vh] rounded-lg border border-slate-200"
      />
    </div>
  )
}
