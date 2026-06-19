import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Matrix TSL Course Viewer',
  description: 'Engineering education courses from Matrix TSL',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <a href="/" className="brand">
            <span className="brand-name">Matrix TSL</span>
            <span className="brand-sub">Course Viewer</span>
          </a>
          <nav>
            <a href="/">Library</a>
            <a href="/how-it-works">How It Works</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
