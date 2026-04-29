'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReaderIcon, BarChartIcon, HomeIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'หน้าหลัก', icon: HomeIcon },
  { href: '/study', label: 'Flashcard', icon: ReaderIcon },
  { href: '/stats', label: 'สถิติ', icon: BarChartIcon },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-bold text-lg tracking-tight">Oxford 5000 <span className="text-primary">TH</span> <span className="text-muted-foreground font-normal text-sm">by PLM</span></span>
        <div className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon width={15} height={15} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
