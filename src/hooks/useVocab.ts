'use client'

import { useState, useEffect } from 'react'
import { VocabWord } from '@/features/vocabulary/types'

let cachedWords: VocabWord[] | null = null

export function useVocab() {
  const [words, setWords] = useState<VocabWord[]>(cachedWords ?? [])
  const [loading, setLoading] = useState(!cachedWords)

  useEffect(() => {
    if (cachedWords) return
    fetch('/vocab/oxford_consolidated_thai.json')
      .then((r) => r.json())
      .then((data: VocabWord[]) => {
        cachedWords = data
        setWords(data)
        setLoading(false)
      })
  }, [])

  return { words, loading }
}
