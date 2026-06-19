'use client'
import Image from 'next/image'

export function ImageViewer({ src, title }: { src: string; title: string }) {
  return (
    <div className="stage-image">
      <Image
        src={src}
        alt={title}
        width={1280}
        height={720}
        style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-lg)' }}
      />
    </div>
  )
}
