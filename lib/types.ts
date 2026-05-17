export type Status =
  | 'dated'
  | 'interested'
  | 'not_interested'
  | 'matched'
  | 'together'
  | 'one_night'
  | 'marry'
  | 'surdina'
  | 'orbit'
  | 'ghosted_them'
  | 'ghosted_me'
  | 'fwb'

export type ScoreKey =
  | 'score_conversation'
  | 'score_appearance'
  | 'score_chemistry'
  | 'score_values'
  | 'score_fun'

export type DateRecord = {
  id: string
  name: string
  instagram_handle: string
  photo_url: string
  status: Status
  date_on?: string | null
  notes?: string | null
  flags?: string[]
  score_conversation: number | null
  score_appearance: number | null
  score_chemistry: number | null
  score_values: number | null
  score_fun: number | null
  created_at: string
  position?: number | null
}

export type Profile = {
  full_name: string
  instagram_handle: string | null
  avatar_url: string | null
}
