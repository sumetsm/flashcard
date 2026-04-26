'use client'

import Link from 'next/link'
import { ReaderIcon, LightningBoltIcon, BarChartIcon, RocketIcon, StarFilledIcon, ClockIcon } from '@radix-ui/react-icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useVocab } from '@/hooks/useVocab'
import { useProgressStore } from '@/store/progressStore'
import { CEFRLevel } from '@/features/vocabulary/types'
import { ROUND_LABELS, SRSRound } from '@/features/srs/lib/sm2'

const CEFR_COLORS: Record<CEFRLevel, string> = {
  A1: 'bg-green-500',
  A2: 'bg-blue-500',
  B1: 'bg-yellow-500',
  B2: 'bg-red-500',
  C1: 'bg-purple-600',
}

export default function Dashboard() {
  const { words, loading } = useVocab()
  const getStats = useProgressStore((s) => s.getStats)

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">กำลังโหลดคำศัพท์...</div>
  }

  const stats = getStats(words)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">สวัสดี! 👋</h1>
        <p className="text-muted-foreground mt-1">พร้อมท่องจำคำศัพท์วันนี้แล้วหรือยัง?</p>
      </div>

      {/* Due today banner */}
      {stats.dueToday > 0 ? (
        <Card className="border-2 border-primary bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔔</span>
              <div>
                <p className="font-bold text-lg">มีคำที่ต้องทบทวนวันนี้!</p>
                <p className="text-sm text-muted-foreground">
                  {stats.dueToday} คำรอคุณอยู่ — อย่าลืมทบทวนนะ
                </p>
              </div>
            </div>
            <Link href="/study">
              <Button>ทบทวนเลย →</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <p className="font-medium text-green-700 dark:text-green-400">ไม่มีคำที่ต้องทบทวนวันนี้ เยี่ยมมาก!</p>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-3">
        <Link href="/study">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="p-3 rounded-xl bg-primary/10">
                <ReaderIcon className="text-primary" width={24} height={24} />
              </div>
              <div>
                <p className="font-semibold">เรียนด้วย Flashcard</p>
                <p className="text-sm text-muted-foreground">{stats.new.toLocaleString()} คำใหม่รอคุณอยู่</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/quiz">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <LightningBoltIcon className="text-purple-500" width={24} height={24} />
              </div>
              <div>
                <p className="font-semibold">ทำ Quiz</p>
                <p className="text-sm text-muted-foreground">ทดสอบด้วย 4 ตัวเลือก</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<StarFilledIcon className="text-yellow-500" width={20} height={20} />} label="จำได้แล้ว" value={stats.mastered} />
        <StatCard icon={<ClockIcon className="text-blue-500" width={20} height={20} />} label="กำลังเรียน" value={stats.learning} />
        <StatCard icon={<BarChartIcon className="text-purple-500" width={20} height={20} />} label="ทั้งหมด" value={stats.total} />
      </div>

      {/* SRS round breakdown */}
      {stats.learning > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">สถานะการทบทวน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {([1, 2, 3, 4] as SRSRound[]).map((round) => {
              const count = stats.byRound[round]
              if (count === 0) return null
              return (
                <div key={round} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{ROUND_LABELS[round]}</span>
                  <Badge variant="secondary">{count} คำ</Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* CEFR progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">ความก้าวหน้าตามระดับ CEFR</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(['A1', 'A2', 'B1', 'B2', 'C1'] as CEFRLevel[]).map((level) => {
            const { total, mastered } = stats.byLevel[level]
            const pct = total > 0 ? Math.round((mastered / total) * 100) : 0
            return (
              <div key={level} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-white border-0 ${CEFR_COLORS[level]}`}>{level}</Badge>
                    <span className="text-muted-foreground">{mastered} / {total} คำ</span>
                  </div>
                  <span className="font-medium">{pct}%</span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4 flex flex-col gap-2">
        {icon}
        <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground leading-tight">{label}</p>
      </CardContent>
    </Card>
  )
}
