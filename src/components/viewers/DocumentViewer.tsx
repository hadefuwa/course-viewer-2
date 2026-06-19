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
      <div className="stage-loading">
        <svg className="animate-spin" style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none">
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        Loading document…
      </div>
    )
  }

  if (error) {
    return (
      <div className="stage-missing">
        <div className="stage-missing-inner">
          <div className="icon">⚠️</div>
          <h3>Could not load document</h3>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="stage-doc">
      <div
        className="stage-doc-inner"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
