'use client'

import { useState, useCallback, useMemo } from 'react'
import { VocabWord, CEFRLevel } from '@/features/vocabulary/types'

export interface QuizQuestion {
  word: VocabWord
  choices: string[]
  correctIndex: number
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQuestion(word: VocabWord, pool: VocabWord[]): QuizQuestion {
  const distractors = shuffle(pool.filter((w) => w.vocab !== word.vocab)).slice(0, 3).map((w) => w.meaningTH)
  const allChoices = shuffle([word.meaningTH, ...distractors])
  return {
    word,
    choices: allChoices,
    correctIndex: allChoices.indexOf(word.meaningTH),
  }
}

export function useQuizSession(words: VocabWord[], cefrFilter: CEFRLevel[]) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [sessionKey, setSessionKey] = useState(0)

  const deck = useMemo(() => {
    const filtered = cefrFilter.length > 0 ? words.filter((w) => cefrFilter.includes(w.cefr)) : words
    const shuffled = shuffle(filtered)
    // build pool from same or nearby CEFR for better distractors
    return shuffled.map((word) => {
      const sameLevel = words.filter((w) => w.cefr === word.cefr)
      const pool = sameLevel.length >= 4 ? sameLevel : words
      return buildQuestion(word, pool)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, cefrFilter, sessionKey])

  const current = deck[index] ?? null
  const isAnswered = selected !== null
  const isCorrect = selected !== null && selected === current?.correctIndex
  const isFinished = index >= deck.length

  const answer = useCallback((choiceIndex: number) => {
    if (selected !== null) return
    setSelected(choiceIndex)
    if (current && choiceIndex === current.correctIndex) {
      setScore((s) => s + 1)
    }
  }, [selected, current])

  const next = useCallback(() => {
    setSelected(null)
    setIndex((i) => i + 1)
  }, [])

  const restart = useCallback(() => {
    setIndex(0)
    setSelected(null)
    setScore(0)
    setSessionKey((k) => k + 1)
  }, [])

  return { deck, current, index, selected, isAnswered, isCorrect, isFinished, score, answer, next, restart }
}
