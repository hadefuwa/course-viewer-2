'use client'
import { useState, useEffect, useCallback } from 'react'
import { progressKey } from '@/lib/utils'

// Phase 1: localStorage. Phase 2: swap internals for Supabase, same API.
export function useProgress(courseId: string, screenIds: string[]) {
  const key = progressKey(courseId)

  const read = (): Set<string> => {
    try {
      const raw = localStorage.getItem(key)
      return new Set(raw ? JSON.parse(raw) : [])
    } catch { return new Set() }
  }

  const [completed, setCompleted] = useState<Set<string>>(new Set())

  useEffect(() => {
    setCompleted(read())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  const toggle = useCallback((screenId: string) => {
    setCompleted(prev => {
      const next = new Set(prev)
      if (next.has(screenId)) next.delete(screenId)
      else next.add(screenId)
      try { localStorage.setItem(key, JSON.stringify([...next])) } catch {}
      return next
    })
  }, [key])

  const percent = screenIds.length
    ? Math.round((completed.size / screenIds.length) * 100)
    : 0

  return { completed, toggle, percent }
}
