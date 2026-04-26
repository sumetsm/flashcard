'use client'

import { useState, useMemo } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ReloadIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useVocab } from '@/hooks/useVocab'
import { useProgressStore } from '@/store/progressStore'
import { CEFRLevel } from '@/features/vocabulary/types'
import { ROUND_LABELS, SRSRound } from '@/features/srs/lib/sm2'
import FlashCard from '@/features/flashcard/components/FlashCard'
import FilterBar from '@/features/filter/components/FilterBar'
import { useStudySession, StudyMode } from '@/features/flashcard/hooks/useStudySession'
import { cn } from '@/lib/utils'

export default function StudyPage() {
  const { words, loading } = useVocab()
  const reviewCard = useProgressStore((s) => s.reviewCard)
  const getDueWords = useProgressStore((s) => s.getDueWords)
  const getNewWords = useProgressStore((s) => s.getNewWords)
  const progress = useProgressStore((s) => s.progress)

  const [mode, setMode] = useState<StudyMode>('review')
  const [cefrFilter, setCefrFilter] = useState<CEFRLevel[]>([])
  const [doShuffle, setDoShuffle] = useState(false)
  const [sessionKey, setSessionKey] = useState(0)

  const dueWords = useMemo(() => getDueWords(words, cefrFilter), [words, cefrFilter, getDueWords, progress])
  const newWords = useMemo(() => getNewWords(words, cefrFilter), [words, cefrFilter, getNewWords, progress])

  const deck = mode === 'review' ? dueWords : newWords

  const { orderedDeck, current, index, flipped, flip, next, prev } = useStudySession(deck, doShuffle, sessionKey)

  const toggleCefr = (level: CEFRLevel) =>
    setCefrFilter((prev) => prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level])

  const handleRate = (knew: boolean) => {
    if (!current) return
    reviewCard(current.vocab, knew)
    next()
  }

  const restart = () => {
    setSessionKey((k) => k + 1)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">กำลังโหลด...</div>
  }

  const cardProgress = current ? progress[current.vocab] : null
  const roundLabel = cardProgress?.status === 'learning'
    ? ROUND_LABELS[cardProgress.round as SRSRound]
    : null

  const isLastCard = index === orderedDeck.length - 1

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Flashcard</h1>
        <Button variant="ghost" size="sm" onClick={restart}>
          <ReloadIcon width={14} height={14} className="mr-1" /> เริ่มใหม่
        </Button>
      </div>

      {/* Mode tabs */}
      <div className="flex rounded-lg border p-1 gap-1 bg-muted/40">
        {([
          { id: 'review' as StudyMode, label: 'ทบทวน', count: dueWords.length },
          { id: 'new' as StudyMode, label: 'คำใหม่', count: newWords.length },
        ] as const).map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => { setMode(id); setSessionKey((k) => k + 1) }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-colors',
              mode === id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded-full',
              mode === id
                ? (id === 'review' && count > 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')
                : 'bg-muted text-muted-foreground'
            )}>
              {count}
            </span>
          </button>
        ))}
      </div>

      <FilterBar
        selected={cefrFilter}
        onToggle={toggleCefr}
        shuffle={doShuffle}
        onToggleShuffle={() => setDoShuffle((s) => !s)}
        count={orderedDeck.length}
        total={words.length}
      />

      {orderedDeck.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-56 border rounded-2xl gap-3 text-center px-6">
          {mode === 'review' ? (
            <>
              <p className="text-2xl">🎉</p>
              <p className="font-semibold">ไม่มีคำที่ต้องทบทวนวันนี้</p>
              <p className="text-sm text-muted-foreground">มาเรียนคำใหม่กันดีกว่า!</p>
              <Button size="sm" onClick={() => setMode('new')}>ไปเรียนคำใหม่ →</Button>
            </>
          ) : (
            <>
              <p className="text-2xl">✅</p>
              <p className="font-semibold">คำใหม่หมดแล้ว</p>
              <p className="text-sm text-muted-foreground">ลองเปลี่ยนตัวกรองระดับ CEFR</p>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${((index + 1) / orderedDeck.length) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-2">
              {roundLabel && (
                <Badge variant="outline" className="text-xs hidden sm:flex">{roundLabel}</Badge>
              )}
              <span className="text-sm text-muted-foreground tabular-nums">{index + 1} / {orderedDeck.length}</span>
            </div>
          </div>

          {current && <FlashCard word={current} flipped={flipped} onClick={flip} />}

          {!flipped ? (
            <div className="flex justify-between">
              <Button variant="outline" onClick={prev} disabled={index === 0}>
                <ChevronLeftIcon width={16} height={16} /> ก่อนหน้า
              </Button>
              <Button onClick={flip}>พลิกดูความหมาย</Button>
              <Button variant="outline" onClick={next} disabled={isLastCard}>
                ถัดไป <ChevronRightIcon width={16} height={16} />
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-sm text-muted-foreground">จำได้ไหม?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleRate(false)}
                  className="border-2 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl py-4 text-base font-semibold transition-colors"
                >
                  ไม่ได้ 😕
                </button>
                <button
                  onClick={() => handleRate(true)}
                  className="border-2 border-green-400 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-xl py-4 text-base font-semibold transition-colors"
                >
                  จำได้ 🎉
                </button>
              </div>
              {mode === 'review' && cardProgress?.status === 'learning' && (
                <p className="text-center text-xs text-muted-foreground">
                  {cardProgress.round < 4
                    ? `จำได้ → ทบทวนอีกครั้งใน ${ROUND_LABELS[(cardProgress.round + 1) as SRSRound].split('— ')[1]}`
                    : 'จำได้ → จบครบ 4 รอบ! 🏆'}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
