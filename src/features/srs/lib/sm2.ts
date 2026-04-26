export type SRSRound = 1 | 2 | 3 | 4

// Days until next review for each round
const ROUND_INTERVALS: Record<SRSRound, number> = {
  1: 0,   // same day (evening)
  2: 3,   // 3 days
  3: 10,  // ~1-2 weeks
  4: 30,  // ~1 month
}

export const ROUND_LABELS: Record<SRSRound, string> = {
  1: 'รอบ 1 — วันนี้',
  2: 'รอบ 2 — 3 วัน',
  3: 'รอบ 3 — 1-2 สัปดาห์',
  4: 'รอบ 4 — 1 เดือน',
}

export interface CardProgress {
  vocab: string
  status: 'new' | 'learning' | 'mastered'
  round: SRSRound
  nextReviewDate: string
  lastReviewDate?: string
}

function addDays(date: Date, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function createNewCard(vocab: string): CardProgress {
  return {
    vocab,
    status: 'new',
    round: 1,
    nextReviewDate: new Date().toISOString().split('T')[0],
  }
}

export function reviewCard(card: CardProgress, knew: boolean): CardProgress {
  const today = new Date()
  const todayISO = today.toISOString().split('T')[0]

  if (card.status === 'new') {
    if (knew) {
      // Knew immediately → mastered, exits SRS entirely
      return { ...card, status: 'mastered', lastReviewDate: todayISO }
    }
    // Didn't know → enter SRS at round 1 (review same day)
    return { ...card, status: 'learning', round: 1, nextReviewDate: todayISO, lastReviewDate: todayISO }
  }

  if (card.status === 'learning') {
    if (!knew) {
      // Failed → reset to round 1, review same day again
      return { ...card, round: 1, nextReviewDate: todayISO, lastReviewDate: todayISO }
    }
    if (card.round === 4) {
      // Completed all 4 rounds → mastered
      return { ...card, status: 'mastered', lastReviewDate: todayISO }
    }
    const nextRound = (card.round + 1) as SRSRound
    return {
      ...card,
      round: nextRound,
      nextReviewDate: addDays(today, ROUND_INTERVALS[nextRound]),
      lastReviewDate: todayISO,
    }
  }

  return card
}

export function isDueToday(card: CardProgress): boolean {
  if (card.status !== 'learning') return false
  const today = new Date().toISOString().split('T')[0]
  return card.nextReviewDate <= today
}
