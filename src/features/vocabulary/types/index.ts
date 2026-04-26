export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

export interface VocabWord {
  vocab: string
  cefr: CEFRLevel
  part_of_speech: string[]
  meaningTH: string
}
