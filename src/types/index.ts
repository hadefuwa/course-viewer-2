export type CourseKind = 'course' | 'pack'
export type ScreenType = 'image' | 'html' | 'youtube' | 'pdf' | 'document' | 'powerpoint'
export type UserRole = 'learner' | 'author' | 'admin'

export interface Course {
  id: string
  title: string
  description: string | null
  kind: CourseKind
  certificate_enabled: boolean
  categories: string[]
  created_at: string
}

export interface Screen {
  id: string
  course_id: string
  position: number
  title: string
  type: ScreenType
  src: string | null
  drive_file_id: string | null
  section_heading: string | null  // Heading2 text to extract from master .docx
  hours: number
  equipment: string | null
  missing: boolean
  created_at: string
}

export interface Progress {
  id: string
  user_id: string | null
  screen_id: string
  completed: boolean
  time_spent_secs: number
  completed_at: string | null
}

export interface CourseWithScreens extends Course {
  screens: Screen[]
}

// Definition file row (from Excel/Google Sheet import)
export interface DefinitionRow {
  type: ScreenType
  hours: number
  equipment: string
  title: string
  file: string        // Drive path or URL
  section?: string    // Heading2 text — blank = whole document
}
