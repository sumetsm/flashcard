'use client'

import { useState, useCallback, useMemo } from 'react'
import { VocabWord, CEFRLevel } from '@/features/vocabulary/types'

export type StudyMode = 'new' | 'review'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function useStudySession(
  deck: VocabWord[],
  doShuffle: boolean,
  sessionKey: number,
) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const orderedDeck = useMemo(() => {
    return doShuffle ? shuffle(deck) : deck
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck, doShuffle, sessionKey])

  const current = orderedDeck[index] ?? null

  const next = useCallback(() => {
    setFlipped(false)
    setTimeout(() => setIndex((i) => Math.min(i + 1, orderedDeck.length - 1)), 150)
  }, [orderedDeck.length])

  const prev = useCallback(() => {
    setFlipped(false)
    setTimeout(() => setIndex((i) => Math.max(i - 1, 0)), 150)
  }, [])

  const flip = useCallback(() => setFlipped((f) => !f), [])

  return { orderedDeck, current, index, flipped, flip, next, prev }
}
