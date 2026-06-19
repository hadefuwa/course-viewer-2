'use client'

export function PdfViewer({ src, title }: { src: string; title: string }) {
  return (
    <div style={{ display: 'flex', flex: 1, flexDirection: 'column', minHeight: '75vh' }}>
      <iframe
        src={src}
        title={title}
        style={{ flex: 1, border: 0, minHeight: '75vh', width: '100%', display: 'block' }}
      />
    </div>
  )
}
