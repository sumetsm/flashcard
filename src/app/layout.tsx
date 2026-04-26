import type { Metadata } from 'next'
import { Kanit } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'

const kanit = Kanit({
  variable: '--font-kanit',
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Oxford 3000 Flashcard',
  description: 'ท่องจำคำศัพท์ Oxford 3000 ด้วย Spaced Repetition',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${kanit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-[family-name:var(--font-kanit)]">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  )
}
