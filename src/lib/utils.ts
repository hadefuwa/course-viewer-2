import type { Screen } from '@/types'

export function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`
  return `${hours.toFixed(1).replace('.0', '')}h`
}

export function screenContentUrl(screen: Screen): string {
  if (!screen.drive_file_id) return screen.src ?? ''
  const params = new URLSearchParams({ fileId: screen.drive_file_id })
  if (screen.section_heading) params.set('section', screen.section_heading)
  return `/api/content?${params}`
}

export function youtubeId(url: string): string {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([a-zA-Z0-9_-]{11})/)
  return m?.[1] ?? ''
}

export function progressKey(courseId: string) {
  return `cv2:progress:${courseId}`
}
