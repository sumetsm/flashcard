'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CardProgress, SRSRound, createNewCard, reviewCard as srsReview, isDueToday } from '@/features/srs/lib/sm2'
import { VocabWord, CEFRLevel } from '@/features/vocabulary/types'

export interface Stats {
  total: number
  new: number
  learning: number
  mastered: number
  dueToday: number
  byRound: Record<SRSRound, number>
  byLevel: Record<CEFRLevel, { total: number; mastered: number }>
}

interface ProgressState {
  progress: Record<string, CardProgress>
  reviewCard: (vocab: string, knew: boolean) => void
  getOrCreateCard: (vocab: string) => CardProgress
  resetProgress: () => void
  getDueWords: (words: VocabWord[], cefrFilter?: CEFRLevel[]) => VocabWord[]
  getNewWords: (words: VocabWord[], cefrFilter?: CEFRLevel[]) => VocabWord[]
  getStats: (words: VocabWord[]) => Stats
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: {},

      getOrCreateCard: (vocab: string) => {
        const existing = get().progress[vocab]
        if (existing) return existing
        const card = createNewCard(vocab)
        set((state) => ({ progress: { ...state.progress, [vocab]: card } }))
        return card
      },

      reviewCard: (vocab: string, knew: boolean) => {
        const card = get().getOrCreateCard(vocab)
        const updated = srsReview(card, knew)
        set((state) => ({ progress: { ...state.progress, [vocab]: updated } }))
      },

      resetProgress: () => set({ progress: {} }),

      getDueWords: (words: VocabWord[], cefrFilter?: CEFRLevel[]) => {
        const { progress } = get()
        const filtered = cefrFilter && cefrFilter.length > 0
          ? words.filter((w) => cefrFilter.includes(w.cefr))
          : words
        return filtered.filter((w) => {
          const card = progress[w.vocab]
          return card ? isDueToday(card) : false
        })
      },

      getNewWords: (words: VocabWord[], cefrFilter?: CEFRLevel[]) => {
        const { progress } = get()
        const filtered = cefrFilter && cefrFilter.length > 0
          ? words.filter((w) => cefrFilter.includes(w.cefr))
          : words
        return filtered.filter((w) => !progress[w.vocab] || progress[w.vocab].status === 'new')
      },

      getStats: (words: VocabWord[]) => {
        const { progress } = get()
        const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1']
        const byLevel = Object.fromEntries(
          levels.map((l) => {
            const lw = words.filter((w) => w.cefr === l)
            const mastered = lw.filter((w) => progress[w.vocab]?.status === 'mastered').length
            return [l, { total: lw.length, mastered }]
          })
        ) as Record<CEFRLevel, { total: number; mastered: number }>

        const byRound: Record<SRSRound, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }
        let newCount = 0, learningCount = 0, masteredCount = 0, dueToday = 0

        for (const word of words) {
          const card = progress[word.vocab]
          if (!card || card.status === 'new') {
            newCount++
          } else if (card.status === 'learning') {
            learningCount++
            byRound[card.round]++
            if (isDueToday(card)) dueToday++
          } else {
            masteredCount++
          }
        }

        return {
          total: words.length,
          new: newCount,
          learning: learningCount,
          mastered: masteredCount,
          dueToday,
          byRound,
          byLevel,
        }
      },
    }),
    { name: 'flashcard-progress' }
  )
)
