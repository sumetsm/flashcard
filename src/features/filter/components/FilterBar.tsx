'use client'

import { CEFRLevel } from '@/features/vocabulary/types'
import { cn } from '@/lib/utils'
import { ShuffleIcon, ReloadIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'

const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1']
const CEFR_STYLE: Record<CEFRLevel, string> = {
  A1: 'data-[active=true]:bg-green-500 data-[active=true]:text-white data-[active=true]:border-green-500',
  A2: 'data-[active=true]:bg-blue-500 data-[active=true]:text-white data-[active=true]:border-blue-500',
  B1: 'data-[active=true]:bg-yellow-500 data-[active=true]:text-white data-[active=true]:border-yellow-500',
  B2: 'data-[active=true]:bg-red-500 data-[active=true]:text-white data-[active=true]:border-red-500',
  C1: 'data-[active=true]:bg-purple-600 data-[active=true]:text-white data-[active=true]:border-purple-600',
}

interface FilterBarProps {
  selected: CEFRLevel[]
  onToggle: (level: CEFRLevel) => void
  shuffle: boolean
  onToggleShuffle: () => void
  onReset?: () => void
  count: number
  total: number
}

export default function FilterBar({ selected, onToggle, shuffle, onToggleShuffle, onReset, count, total }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground mr-1">ระดับ:</span>
      {CEFR_LEVELS.map((level) => {
        const active = selected.includes(level) || selected.length === 0
        return (
          <button
            key={level}
            data-active={selected.includes(level)}
            onClick={() => onToggle(level)}
            className={cn(
              'px-3 py-1 text-sm rounded-full border font-medium transition-colors',
              'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
              CEFR_STYLE[level]
            )}
          >
            {level}
          </button>
        )
      })}
      <div className="ml-auto flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{count} คำ</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleShuffle}
          className={cn(shuffle && 'bg-primary text-primary-foreground border-primary')}
        >
          <ShuffleIcon width={14} height={14} className="mr-1" /> สุ่ม
        </Button>
        {onReset && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <ReloadIcon width={14} height={14} />
          </Button>
        )}
      </div>
    </div>
  )
}
