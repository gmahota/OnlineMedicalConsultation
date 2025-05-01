import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Medical Consultation App',
  description: 'A telemedicine platform for remote medical consultations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <main className="app">
          {children}
        </main>
      </body>
    </html>
  )
}