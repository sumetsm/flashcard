'use client'

import { QuizQuestion } from '../hooks/useQuizSession'
import { Badge } from '@/components/ui/badge'
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

const CEFR_COLORS: Record<string, string> = {
  A1: 'bg-green-500',
  A2: 'bg-blue-500',
  B1: 'bg-yellow-500',
  B2: 'bg-red-500',
  C1: 'bg-purple-600',
}

interface QuizCardProps {
  question: QuizQuestion
  selected: number | null
  onSelect: (i: number) => void
}

export default function QuizCard({ question, selected, onSelect }: QuizCardProps) {
  const isAnswered = selected !== null

  return (
    <div className="space-y-5">
      <div className="border rounded-2xl p-8 text-center bg-card">
        <Badge className={`text-white border-0 mb-4 ${CEFR_COLORS[question.word.cefr]}`}>
          {question.word.cefr}
        </Badge>
        <p className="text-4xl font-bold mb-3">{question.word.vocab}</p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {question.word.part_of_speech.map((pos) => (
            <Badge key={pos} variant="secondary" className="text-xs">{pos}</Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.choices.map((choice, i) => {
          const isCorrect = i === question.correctIndex
          const isSelected = i === selected

          let style = 'border bg-card hover:bg-muted/50 cursor-pointer'
          if (isAnswered) {
            if (isCorrect) style = 'border-2 border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
            else if (isSelected) style = 'border-2 border-red-400 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
            else style = 'border bg-card opacity-50'
          }

          return (
            <button
              key={i}
              onClick={() => !isAnswered && onSelect(i)}
              disabled={isAnswered}
              className={cn(
                'rounded-xl p-4 text-left transition-colors flex items-center gap-3',
                style
              )}
            >
              <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="font-medium">{choice}</span>
              {isAnswered && isCorrect && <CheckCircledIcon width={16} height={16} className="ml-auto text-green-500 flex-shrink-0" />}
              {isAnswered && isSelected && !isCorrect && <CrossCircledIcon width={16} height={16} className="ml-auto text-red-500 flex-shrink-0" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
