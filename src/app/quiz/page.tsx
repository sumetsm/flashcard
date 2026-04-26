'use client'

import { useState } from 'react'
import { ReloadIcon, StarFilledIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { useVocab } from '@/hooks/useVocab'
import { useProgressStore } from '@/store/progressStore'
import { CEFRLevel } from '@/features/vocabulary/types'
import FilterBar from '@/features/filter/components/FilterBar'
import QuizCard from '@/features/quiz/components/QuizCard'
import { useQuizSession } from '@/features/quiz/hooks/useQuizSession'

export default function QuizPage() {
  const { words, loading } = useVocab()
  const reviewCard = useProgressStore((s) => s.reviewCard)
  const [cefrFilter, setCefrFilter] = useState<CEFRLevel[]>([])

  const { deck, current, index, selected, isAnswered, isCorrect, isFinished, score, answer, next, restart } =
    useQuizSession(words, cefrFilter)

  const toggleCefr = (level: CEFRLevel) =>
    setCefrFilter((prev) => prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level])

  const handleAnswer = (i: number) => {
    if (!current) return
    answer(i)
    reviewCard(current.word.vocab, i === current.correctIndex)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">กำลังโหลด...</div>
  }

  if (isFinished) {
    const pct = Math.round((score / deck.length) * 100)
    return (
      <div className="flex flex-col items-center justify-center gap-6 min-h-[60vh] text-center">
        <StarFilledIcon width={64} height={64} className="text-yellow-500" />
        <div>
          <h2 className="text-3xl font-bold">{score} / {deck.length}</h2>
          <p className="text-muted-foreground mt-1">คะแนนของคุณ ({pct}%)</p>
        </div>
        <p className="text-lg">
          {pct >= 80 ? '🎉 เยี่ยมมาก!' : pct >= 50 ? '👍 ดีแล้ว ฝึกต่อไป!' : '💪 อย่าท้อ ลองอีกครั้ง!'}
        </p>
        <Button onClick={restart} size="lg">
          <ReloadIcon width={16} height={16} className="mr-2" /> เล่นใหม่
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Quiz Mode</h1>
        <Button variant="ghost" size="sm" onClick={restart}>
          <ReloadIcon width={14} height={14} className="mr-1" /> เริ่มใหม่
        </Button>
      </div>

      <FilterBar
        selected={cefrFilter}
        onToggle={toggleCefr}
        shuffle={true}
        onToggleShuffle={() => {}}
        count={deck.length}
        total={words.length}
      />

      <div className="flex items-center gap-3">
        <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all"
            style={{ width: `${((index + 1) / deck.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground tabular-nums">
          {index + 1} / {deck.length} • คะแนน {score}
        </span>
      </div>

      {current && <QuizCard question={current} selected={selected} onSelect={handleAnswer} />}

      {isAnswered && (
        <div className="flex items-center justify-between">
          <p className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? '✓ ถูกต้อง!' : `✗ ตอบผิด — คำตอบที่ถูก: "${current?.choices[current.correctIndex]}"`}
          </p>
          <Button onClick={next}>
            {index < deck.length - 1 ? 'ข้อถัดไป →' : 'ดูผลลัพธ์'}
          </Button>
        </div>
      )}
    </div>
  )
}
