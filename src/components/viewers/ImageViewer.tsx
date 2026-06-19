'use client'
import Image from 'next/image'

export function ImageViewer({ src, title }: { src: string; title: string }) {
  return (
    <div className="flex items-center justify-center w-full bg-slate-950 rounded-lg overflow-hidden min-h-64">
      <Image
        src={src}
        alt={title}
        width={1280}
        height={720}
        className="max-w-full max-h-[75vh] object-contain"
      />
    </div>
  )
}
