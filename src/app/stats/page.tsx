'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useVocab } from '@/hooks/useVocab'
import { useProgressStore } from '@/store/progressStore'
import { CEFRLevel } from '@/features/vocabulary/types'
import { ExclamationTriangleIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

const CEFR_COLORS: Record<CEFRLevel, string> = {
  A1: 'bg-green-500',
  A2: 'bg-blue-500',
  B1: 'bg-yellow-500',
  B2: 'bg-red-500',
  C1: 'bg-purple-600',
}

const ALL_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1']

const STATUS_CONFIG = [
  { key: 'new' as const, label: 'ยังไม่เรียน', color: 'bg-slate-400' },
  { key: 'learning' as const, label: 'อยู่ในระบบทบทวน', color: 'bg-blue-500' },
  { key: 'mastered' as const, label: 'จำได้แล้ว', color: 'bg-green-500' },
]

export default function StatsPage() {
  const { words, loading } = useVocab()
  const getStats = useProgressStore((s) => s.getStats)
  const resetProgress = useProgressStore((s) => s.resetProgress)
  const progress = useProgressStore((s) => s.progress)

  const [showMastered, setShowMastered] = useState(false)
  const [cefrFilter, setCefrFilter] = useState<CEFRLevel | 'all'>('all')

  const masteredWords = useMemo(() => {
    return words.filter((w) => progress[w.vocab]?.status === 'mastered')
  }, [words, progress])

  const filteredMastered = useMemo(() => {
    return cefrFilter === 'all' ? masteredWords : masteredWords.filter((w) => w.cefr === cefrFilter)
  }, [masteredWords, cefrFilter])

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">กำลังโหลด...</div>
  }

  const stats = getStats(words)
  const overallPct = Math.round((stats.mastered / stats.total) * 100)
  const studiedPct = Math.round(((stats.total - stats.new) / stats.total) * 100)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">สถิติการเรียน</h1>

      {/* Overall progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-muted-foreground text-sm">จำได้แล้ว</p>
              <p className="text-4xl font-bold">{stats.mastered.toLocaleString()}</p>
              <p className="text-muted-foreground text-sm">จาก {stats.total.toLocaleString()} คำ</p>
            </div>
            <p className="text-5xl font-bold text-primary">{overallPct}%</p>
          </div>
          <Progress value={overallPct} className="h-3 mb-2" />
          <p className="text-xs text-muted-foreground">เริ่มเรียนแล้ว {studiedPct}% จากทั้งหมด</p>
        </CardContent>
      </Card>

      {/* Status bars */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">สถานะการจำ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {STATUS_CONFIG.map(({ key, label, color }) => {
            const value = stats[key]
            const pct = stats.total > 0 ? Math.round((value / stats.total) * 100) : 0
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    <span>{label}</span>
                  </div>
                  <span className="text-muted-foreground">{value.toLocaleString()} ({pct}%)</span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Per-CEFR breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">แยกตามระดับ CEFR</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {ALL_LEVELS.map((level) => {
            const { total, mastered } = stats.byLevel[level]
            const pct = total > 0 ? Math.round((mastered / total) * 100) : 0
            return (
              <div key={level} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-white border-0 ${CEFR_COLORS[level]}`}>{level}</Badge>
                    <span className="text-sm text-muted-foreground">{mastered} / {total} คำ</span>
                  </div>
                  <span className="font-semibold text-sm">{pct}%</span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Mastered word list */}
      <Card>
        <CardHeader className="pb-2">
          <button
            className="flex items-center justify-between w-full text-left"
            onClick={() => setShowMastered((s) => !s)}
          >
            <CardTitle className="text-base">
              คำที่จำได้แล้ว
              <span className="ml-2 text-sm font-normal text-muted-foreground">({masteredWords.length} คำ)</span>
            </CardTitle>
            {showMastered
              ? <ChevronUpIcon width={18} height={18} className="text-muted-foreground flex-shrink-0" />
              : <ChevronDownIcon width={18} height={18} className="text-muted-foreground flex-shrink-0" />
            }
          </button>
        </CardHeader>

        {showMastered && (
          <CardContent className="pt-0 space-y-4">
            {masteredWords.length === 0 ? (
              <p className="text-muted-foreground text-sm">ยังไม่มีคำที่จำได้ — ไปเรียนกันเลย!</p>
            ) : (
              <>
                {/* CEFR filter chips */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCefrFilter('all')}
                    className={cn(
                      'px-3 py-1 text-sm rounded-full border font-medium transition-colors',
                      cefrFilter === 'all'
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                    )}
                  >
                    ทั้งหมด ({masteredWords.length})
                  </button>
                  {ALL_LEVELS.filter((l) => masteredWords.some((w) => w.cefr === l)).map((level) => {
                    const count = masteredWords.filter((w) => w.cefr === level).length
                    return (
                      <button
                        key={level}
                        onClick={() => setCefrFilter(level)}
                        className={cn(
                          'px-3 py-1 text-sm rounded-full border font-medium transition-colors',
                          cefrFilter === level
                            ? `${CEFR_COLORS[level]} text-white border-transparent`
                            : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                        )}
                      >
                        {level} ({count})
                      </button>
                    )
                  })}
                </div>

                {/* Word grid */}
                <div className="flex flex-wrap gap-2">
                  {filteredMastered.map((w) => (
                    <div
                      key={w.vocab}
                      className="flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 text-sm bg-card hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium">{w.vocab}</span>
                      <span className="text-muted-foreground hidden sm:inline">— {w.meaningTH}</span>
                      <Badge className={`text-white border-0 text-[10px] px-1 py-0 ${CEFR_COLORS[w.cefr]}`}>
                        {w.cefr}
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>

      {/* Due today */}
      <Card className="border-yellow-200 dark:border-yellow-900">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold">ต้องทบทวนวันนี้</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.dueToday} คำ</p>
          </div>
          <div className="text-4xl">📅</div>
        </CardContent>
      </Card>

      {/* Reset */}
      <div className="border rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon width={18} height={18} className="text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm">รีเซ็ต progress ทั้งหมด</p>
            <p className="text-xs text-muted-foreground">ลบข้อมูลการเรียนทั้งหมดออกจาก browser</p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            if (confirm('แน่ใจหรือไม่? ข้อมูลทั้งหมดจะถูกลบ')) resetProgress()
          }}
        >
          รีเซ็ต
        </Button>
      </div>
    </div>
  )
}
