'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type InviteData = {
  id: string
  token: string
  responded_at: string | null
  date_id: string
  profiles: { full_name: string; avatar_url: string | null; instagram_handle: string | null }
  dates: { name: string }
}

const questions = [
  { key: 'q1', emoji: '⚡', question: 'Sentiu atração na hora?' },
  { key: 'q2', emoji: '💬', question: 'A conversa fluiu?' },
  { key: 'q3', emoji: '🔥', question: 'Teve química?' },
  { key: 'q4', emoji: '😄', question: 'Se divertiu junto?' },
  { key: 'q5', emoji: '🔁', question: 'Gostaria de se encontrar de novo?' },
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
          className="text-3xl transition-transform hover:scale-110 active:scale-95"
        >
          {s <= (hovered || value) ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  )
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const [invite, setInvite] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [isMatch, setIsMatch] = useState(false)

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setInvite(data)
          if (data.responded_at) setDone(true)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token])

  async function handleSubmit() {
    if (!invite) return
    const values = Object.values(scores)
    if (values.length < questions.length) return
    setSaving(true)

    const avg = Math.round(values.reduce((a, b) => a + b) / values.length * 10) / 10

    const res = await fetch(`/api/invite/${token}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avg, date_id: invite.date_id }),
    })
    const result = await res.json()
    setIsMatch(result.isMatch)
    setDone(true)
    setSaving(false)
  }

  const allAnswered = Object.keys(scores).length === questions.length
  const sender = invite?.profiles
  const senderName = sender?.full_name?.split(' ')[0] ?? ''
  const senderPhoto = sender?.avatar_url ||
    (sender?.instagram_handle ? `https://unavatar.io/instagram/${sender.instagram_handle}` : '')

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf6f0] dark:bg-gray-950 flex items-center justify-center">
        <p className="font-caveat text-2xl text-gray-400">Carregando...</p>
      </main>
    )
  }

  if (!invite) {
    return (
      <main className="min-h-screen bg-[#faf6f0] dark:bg-gray-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-6xl mb-6">🔍</div>
        <p className="font-caveat text-3xl text-gray-700 dark:text-gray-200 mb-2">Link não encontrado</p>
        <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
          Este convite pode ter expirado ou o link está incorreto. Peça para a pessoa gerar um novo.
        </p>
      </main>
    )
  }

  /* ── Resultado ── */
  if (done) {
    return (
      <main className="min-h-screen bg-[#faf6f0] dark:bg-gray-950 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
          {isMatch ? (
            <div className="bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-100 rounded-3xl p-8 w-full">
              <p className="text-5xl mb-3">💘</p>
              <p className="font-caveat text-4xl text-rose-500 mb-2">É um Match!</p>
              <p className="text-gray-500 text-sm mb-6">
                Você e <strong>{sender?.full_name}</strong> se curtiram mutuamente. Conta pra ele(a)!
              </p>
              <div className="flex justify-center gap-4">
                <div className="bg-white shadow-lg p-2 pb-5 w-24 -rotate-[4deg]">
                  {senderPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={senderPhoto} alt={senderName} className="w-full aspect-square object-cover" />
                  ) : (
                    <div className="w-full aspect-square bg-rose-100 flex items-center justify-center">
                      <span className="font-caveat text-2xl text-rose-300">{senderName.charAt(0)}</span>
                    </div>
                  )}
                  <p className="font-caveat text-xs text-gray-600 mt-1 truncate">{senderName}</p>
                </div>
                <div className="bg-white shadow-lg p-2 pb-5 w-24 rotate-[3deg] mt-3">
                  <div className="w-full aspect-square bg-purple-100 flex items-center justify-center">
                    <span className="text-3xl">😊</span>
                  </div>
                  <p className="font-caveat text-xs text-gray-600 mt-1">Você</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-8 w-full">
              <p className="text-4xl mb-3">✅</p>
              <p className="font-caveat text-3xl text-gray-800 dark:text-gray-100 mb-2">Resposta enviada!</p>
              <p className="text-gray-500 text-sm">
                {senderName} vai saber do resultado em breve.
              </p>
            </div>
          )}

          {/* CTA para cadastro */}
          <div className="w-full bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-6 text-center flex flex-col gap-3">
            <p className="text-2xl">💘</p>
            <p className="font-caveat text-2xl text-gray-800 dark:text-gray-100">Quer fazer o mesmo?</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              No <strong>Melhores Encontros</strong> você organiza seus dates, avalia cada encontro e descobre sua melhor conexão. Gratuito.
            </p>
            <Link
              href="/signup"
              className="w-full py-3.5 rounded-2xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Criar minha conta grátis →
            </Link>
            <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Já tenho conta — entrar
            </Link>
          </div>
        </div>
      </main>
    )
  }

  /* ── Formulário de avaliação ── */
  return (
    <main className="min-h-screen bg-[#faf6f0] dark:bg-gray-950 pb-16">
      <div className="max-w-sm mx-auto px-6 pt-10 flex flex-col gap-6">

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-caveat text-2xl text-gray-700 dark:text-gray-200">Vibe Check</span>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-xl p-3 pb-9 w-36 -rotate-[1deg]">
            {senderPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={senderPhoto} alt={senderName} className="w-full aspect-square object-cover" />
            ) : (
              <div className="w-full aspect-square bg-rose-100 flex items-center justify-center">
                <span className="font-caveat text-5xl text-rose-300">{senderName.charAt(0)}</span>
              </div>
            )}
            <p className="font-caveat text-lg text-gray-800 dark:text-gray-100 mt-2">{senderName}</p>
            {sender?.instagram_handle && (
              <p className="text-xs text-gray-400">@{sender.instagram_handle}</p>
            )}
          </div>

          <div>
            <p className="font-caveat text-2xl text-gray-800 dark:text-gray-100">
              Qual foi a vibe entre vocês? 💫
            </p>
            <p className="text-sm text-gray-400 mt-1">
              5 perguntas · resultado secreto · só aparece se for mútuo 🤐
            </p>
          </div>
        </div>

        {/* Perguntas */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-6 flex flex-col gap-6">
          {questions.map((q, i) => (
            <div key={q.key} className="flex flex-col gap-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                {q.emoji} {q.question}
              </p>
              <Stars
                value={scores[q.key] ?? 0}
                onChange={v => setScores(s => ({ ...s, [q.key]: v }))}
              />
              {i < questions.length - 1 && (
                <div className="border-b border-gray-50 dark:border-gray-800 mt-2" />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!allAnswered || saving}
          className="w-full py-4 rounded-2xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-40 shadow-lg"
        >
          {saving ? 'Revelando resultado...' : allAnswered ? 'Revelar resultado 🔮' : `Responda as ${questions.length} perguntas`}
        </button>

        <p className="text-xs text-gray-400 text-center pb-2">
          Suas respostas são anônimas. O resultado só aparece se a conexão for mútua. 🤐
        </p>

      </div>
    </main>
  )
}
