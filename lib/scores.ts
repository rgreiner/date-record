import type { DateRecord, ScoreKey } from './types'

export const SCORE_KEYS: ScoreKey[] = [
  'score_conversation',
  'score_appearance',
  'score_chemistry',
  'score_values',
  'score_fun',
]

export function averageScore(record: Pick<DateRecord, ScoreKey>): number | undefined {
  const scores = SCORE_KEYS
    .map(k => record[k])
    .filter((s): s is number => s !== null)
  if (scores.length === 0) return undefined
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
}

export function hasScores(record: Pick<DateRecord, ScoreKey>): boolean {
  return SCORE_KEYS.some(k => record[k] !== null)
}

export function ratingTextColor(score: number): string {
  if (score >= 4) return 'text-amber-500'
  if (score >= 2.5) return 'text-sky-500'
  return 'text-gray-400'
}

export function ratingBadgeClass(score: number): string {
  if (score >= 4) return 'bg-amber-400 text-amber-950'
  if (score >= 2.5) return 'bg-sky-400 text-white'
  return 'bg-gray-400 text-white'
}

export const SCORE_CRITERIA = {
  dated: [
    { key: 'score_conversation' as ScoreKey, label: 'Conversa',  emoji: '💬' },
    { key: 'score_appearance'   as ScoreKey, label: 'Aparência', emoji: '✨' },
    { key: 'score_chemistry'    as ScoreKey, label: 'Química',   emoji: '🔥' },
    { key: 'score_values'       as ScoreKey, label: 'Valores',   emoji: '🤝' },
    { key: 'score_fun'          as ScoreKey, label: 'Diversão',  emoji: '😄' },
  ],
  interested: [
    { key: 'score_appearance'   as ScoreKey, label: 'Atração pelo perfil',  emoji: '✨' },
    { key: 'score_conversation' as ScoreKey, label: 'Conversa online',      emoji: '💬' },
    { key: 'score_chemistry'    as ScoreKey, label: 'Interesse recíproco',  emoji: '🔁' },
    { key: 'score_values'       as ScoreKey, label: 'Vibe geral',           emoji: '🎯' },
    { key: 'score_fun'          as ScoreKey, label: 'Intenção de sair',     emoji: '📅' },
  ],
} as const
