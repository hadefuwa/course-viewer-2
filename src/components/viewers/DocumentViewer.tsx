'use client'
import { useEffect, useState } from 'react'

export function DocumentViewer({ contentUrl }: { contentUrl: string }) {
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(contentUrl)
        if (!res.ok) throw new Error(`Failed to load document (${res.status})`)
        const buf = await res.arrayBuffer()
        const mammoth = await import('mammoth')
        const result = await mammoth.convertToHtml({ arrayBuffer: buf })
        if (!cancelled) {
          setHtml(result.value)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(String(err))
          setLoading(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [contentUrl])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        Loading document…
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        Could not load document: {error}
      </div>
    )
  }

  return (
    <div
      className="doc-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
