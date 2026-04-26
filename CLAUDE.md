# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (port 3000)
npm run build    # type-check + production build
npm run lint     # ESLint
npm run start    # serve production build
```

No test suite is configured.

## Architecture

This is a Next.js 16 App Router flashcard app for memorising Oxford 5000 Thai vocabulary using Spaced Repetition (SRS).

### Vocabulary data

`public/vocab/oxford_consolidated_thai.json` — 5,281 words loaded once at runtime via `src/hooks/useVocab.ts` (module-level cache, never re-fetched). Shape: `{ vocab, cefr: 'A1'|'A2'|'B1'|'B2'|'C1', part_of_speech: string[], meaningTH }`.

### SRS logic (`src/features/srs/lib/sm2.ts`)

Binary review (knew / didn't know), fixed 4-round schedule:

| Round | Interval |
|-------|----------|
| 1 | same day |
| 2 | +3 days |
| 3 | +10 days |
| 4 | +30 days |

- First encounter **จำได้** → `status: 'mastered'` (exits SRS entirely)
- First encounter **ไม่ได้** → `status: 'learning'`, round 1, due today
- Correct during learning → advance round; round 4 correct → `mastered`
- Wrong during learning → reset to round 1, due today

`CardProgress` fields: `vocab`, `status ('new'|'learning'|'mastered')`, `round (1–4)`, `nextReviewDate (ISO)`, `lastReviewDate`.

### State (`src/store/progressStore.ts`)

Zustand store with `zustand/middleware/persist` → `localStorage` key `flashcard-progress`. Progress keyed by `vocab` string. Key selectors: `reviewCard(vocab, knew)`, `getDueWords(words, cefrFilter?)`, `getNewWords(words, cefrFilter?)`, `getStats(words)`.

### Feature structure

```
src/features/
  srs/lib/sm2.ts              SRS algorithm (pure functions)
  vocabulary/types/index.ts   VocabWord + CEFRLevel types
  flashcard/
    components/FlashCard.tsx  3D CSS flip card
    hooks/useStudySession.ts  deck ordering + flip state
  quiz/
    components/QuizCard.tsx   4-choice question UI
    hooks/useQuizSession.ts   deck building + answer state
  filter/components/FilterBar.tsx  CEFR chip filter + shuffle toggle
```

### Pages

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — due-today banner, CEFR progress bars, SRS round breakdown |
| `/study` | Flashcard study — tabs for "ทบทวน" (due) vs "คำใหม่" (new), 2-button rating |
| `/quiz` | Quiz mode — 4 choices, distractors from same CEFR level, updates SRS |
| `/stats` | Statistics — overall mastered %, per-status bars, per-CEFR progress, reset button |

### UI

shadcn/ui components (`src/components/ui/`) + Tailwind CSS v4. Icons: `@radix-ui/react-icons` (not lucide). Font: Kanit (Google Fonts, subsets `thai` + `latin`). CEFR badge colours: A1=green, A2=blue, B1=yellow, B2=red, C1=purple.
