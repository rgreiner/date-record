'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Invite = {
  id: string
  token: string
  sender_id: string
  date_id: string
  response_score: number | null
  responded_at: string | null
  profiles: {
    full_name: string
    avatar_url: string | null
    instagram_handle: string | null
  }
  dates: {
    name: string
  }
}

const questions = [
  { key: 'q1', label: 'Atração',        emoji: '✨', question: 'Você sentiu atração?' },
  { key: 'q2', label: 'Conversa',       emoji: '💬', question: 'Como foi a conversa?' },
  { key: 'q3', label: 'Química',        emoji: '🔥', question: 'Sentiu química?' },
  { key: 'q4', label: 'Vibe',           emoji: '🎯', question: 'A vibe estava boa?' },
  { key: 'q5', label: 'Ver de novo?',   emoji: '📅', question: 'Gostaria de se encontrar de novo?' },
]

function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          className="text-3xl transition-transform hover:scale-110"
        >
          {s <= (hovered || value) ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  )
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const [invite, setInvite] = useState<Invite | null>(null)
  const [loading, setLoading] = useState(true)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [isMatch, setIsMatch] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('invites')
        .select('*, profiles(full_name, avatar_url, instagram_handle), dates(name)')
        .eq('token', token)
        .single()

      if (data) {
        setInvite(data as Invite)
        if (data.responded_at) setDone(true)
      }
      setLoading(false)
    }
    load()
  }, [token])

  async function handleSubmit() {
    if (!invite) return
    const values = Object.values(scores)
    if (values.length < questions.length) return
    setSaving(true)

    const avg = Math.round(values.reduce((a, b) => a + b) / values.length * 10) / 10
    const supabase = createClient()

    await supabase.from('invites').update({
      response_score: avg,
      responded_at: new Date().toISOString(),
    }).eq('token', token)

    // Verifica se há match — se o sender também avaliou bem essa pessoa
    const { data: dateData } = await supabase
      .from('dates')
      .select('score_conversation, score_appearance, score_chemistry, score_values, score_fun')
      .eq('id', invite.date_id)
      .single()

    if (dateData) {
      const senderScores = [
        dateData.score_conversation,
        dateData.score_appearance,
        dateData.score_chemistry,
        dateData.score_values,
        dateData.score_fun,
      ].filter((s): s is number => s !== null)

      if (senderScores.length > 0) {
        const senderAvg = senderScores.reduce((a, b) => a + b) / senderScores.length
        if (senderAvg >= 3 && avg >= 3) {
          await supabase.from('dates').update({ status: 'matched' }).eq('id', invite.date_id)
          setIsMatch(true)
        }
      }
    }

    setDone(true)
    setSaving(false)
  }

  const allAnswered = Object.keys(scores).length === questions.length

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf6f0] flex items-center justify-center">
        <p className="font-caveat text-2xl text-gray-400">Carregando...</p>
      </main>
    )
  }

  if (!invite) {
    return (
      <main className="min-h-screen bg-[#faf6f0] flex items-center justify-center p-8">
        <div className="text-center">
          <p className="font-caveat text-3xl text-gray-400">Link inválido</p>
          <p className="text-sm text-gray-400 mt-2">Este convite não existe ou expirou.</p>
        </div>
      </main>
    )
  }

  const sender = invite.profiles
  const senderPhoto = sender.avatar_url ||
    (sender.instagram_handle ? `https://unavatar.io/instagram/${sender.instagram_handle}` : '')

  if (done) {
    return (
      <main className="min-h-screen bg-[#faf6f0] flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm text-center flex flex-col items-center gap-6">
          {isMatch ? (
            <>
              <div className="bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-100 rounded-3xl p-8 w-full">
                <p className="text-5xl mb-4">💘</p>
                <p className="font-caveat text-4xl text-rose-500 mb-2">É um Match!</p>
                <p className="text-gray-500 text-sm">
                  Você e <strong>{sender.full_name}</strong> se curtiram mutuamente.
                </p>

                {/* Polaroids do match */}
                <div className="flex justify-center gap-3 mt-6">
                  <div className="bg-white shadow-lg p-2 pb-5 w-24 rotate-[-4deg]">
                    {senderPhoto ? (
                      <img src={senderPhoto} alt={sender.full_name} className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="w-full aspect-square bg-rose-100 flex items-center justify-center">
                        <span className="font-caveat text-2xl text-rose-300">{sender.full_name.charAt(0)}</span>
                      </div>
                    )}
                    <p className="font-caveat text-xs text-gray-600 mt-1 truncate">{sender.full_name.split(' ')[0]}</p>
                  </div>
                  <div className="bg-white shadow-lg p-2 pb-5 w-24 rotate-[3deg] mt-3">
                    <div className="w-full aspect-square bg-purple-100 flex items-center justify-center">
                      <span className="text-3xl">😊</span>
                    </div>
                    <p className="font-caveat text-xs text-gray-600 mt-1 truncate">Você</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400">Conta pro {sender.full_name.split(' ')[0]} que também deu match!</p>
            </>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm p-8 w-full">
              <p className="text-4xl mb-4">✅</p>
              <p className="font-caveat text-3xl text-gray-800 mb-2">Resposta enviada!</p>
              <p className="text-gray-500 text-sm">
                Obrigado por responder o convite de <strong>{sender.full_name}</strong>.
              </p>
            </div>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#faf6f0] pb-12">
      <div className="max-w-sm mx-auto px-6 pt-8 flex flex-col gap-6">

        {/* Quem convidou */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            <strong>{sender.full_name}</strong> quer saber se vocês têm match 💘
          </p>
          <div className="flex justify-center">
            <div className="bg-white shadow-xl p-3 pb-8 w-36 rotate-[-2deg]">
              {senderPhoto ? (
                <img src={senderPhoto} alt={sender.full_name} className="w-full aspect-square object-cover" />
              ) : (
                <div className="w-full aspect-square bg-rose-100 flex items-center justify-center">
                  <span className="font-caveat text-5xl text-rose-300">{sender.full_name.charAt(0)}</span>
                </div>
              )}
              <p className="font-caveat text-lg text-gray-800 mt-2">{sender.full_name.split(' ')[0]}</p>
              {sender.instagram_handle && (
                <p className="text-xs text-gray-400">@{sender.instagram_handle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Avaliação */}
        <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-6">
          <p className="text-sm text-gray-600 text-center">Avalie honestamente — só você e {sender.full_name.split(' ')[0]} vão saber o resultado.</p>

          {questions.map(q => (
            <div key={q.key} className="flex flex-col gap-2">
              <p className="text-sm font-medium text-gray-700 text-center">
                {q.emoji} {q.question}
              </p>
              <Stars
                value={scores[q.key] ?? 0}
                onChange={v => setScores(s => ({ ...s, [q.key]: v }))}
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!allAnswered || saving}
          className="w-full py-4 rounded-2xl bg-gray-900 text-white font-semibold text-base hover:bg-gray-700 transition-colors disabled:opacity-40 shadow-lg"
        >
          {saving ? 'Enviando...' : 'Enviar avaliação'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Suas respostas são anônimas. Só haverá notificação se for um match mútuo.
        </p>

      </div>
    </main>
  )
}
