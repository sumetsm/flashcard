'use client'

import { useState } from 'react'
import { VocabWord } from '@/features/vocabulary/types'
import { Badge } from '@/components/ui/badge'

const CEFR_COLORS: Record<string, string> = {
  A1: 'bg-green-500',
  A2: 'bg-blue-500',
  B1: 'bg-yellow-500',
  B2: 'bg-red-500',
  C1: 'bg-purple-600',
}

interface FlashCardProps {
  word: VocabWord
  flipped: boolean
  onClick: () => void
}

export default function FlashCard({ word, flipped, onClick }: FlashCardProps) {
  return (
    <div
      className="relative w-full cursor-pointer"
      style={{ perspective: '1000px', height: '260px' }}
      onClick={onClick}
    >
      <div
        className="absolute inset-0 transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border bg-card shadow-sm p-6"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="text-4xl font-bold tracking-tight mb-3">{word.vocab}</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {word.part_of_speech.map((pos) => (
              <Badge key={pos} variant="secondary" className="text-xs">{pos}</Badge>
            ))}
          </div>
          <p className="text-muted-foreground text-sm mt-6">แตะเพื่อดูความหมาย</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border bg-primary/5 shadow-sm p-6"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <Badge className={`text-white border-0 mb-4 ${CEFR_COLORS[word.cefr]}`}>{word.cefr}</Badge>
          <p className="text-3xl font-bold text-center mb-2">{word.meaningTH}</p>
          <p className="text-muted-foreground text-lg">{word.vocab}</p>
          <div className="flex flex-wrap gap-1.5 justify-center mt-3">
            {word.part_of_speech.map((pos) => (
              <Badge key={pos} variant="outline" className="text-xs">{pos}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
