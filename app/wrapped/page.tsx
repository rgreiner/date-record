'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type DateRecord = {
  id: string
  name: string
  photo_url: string
  status: string
  flags: string[]
  score_conversation: number | null
  score_appearance: number | null
  score_chemistry: number | null
  score_values: number | null
  score_fun: number | null
  created_at: string
}

function avg(r: DateRecord): number | null {
  const scores = [r.score_conversation, r.score_appearance, r.score_chemistry, r.score_values, r.score_fun]
    .filter((s): s is number => s !== null)
  return scores.length ? Math.round(scores.reduce((a, b) => a + b) / scores.length * 10) / 10 : null
}

function topFlags(records: DateRecord[], type: '🚩' | '💚') {
  const counts: Record<string, number> = {}
  records.forEach(r => (r.flags ?? []).filter(f => f.startsWith(type)).forEach(f => {
    counts[f] = (counts[f] ?? 0) + 1
  }))
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3)
}

function getTitle(records: DateRecord[], matches: number): string {
  if (matches >= 3) return 'Magneto Afetivo ✨'
  if (matches >= 1) return 'Felizardo do Amor 💘'
  const scored = records.filter(r => avg(r) !== null)
  if (scored.length === 0) return 'Explorador Curioso 🔍'
  const avgAll = scored.reduce((a, r) => a + (avg(r) ?? 0), 0) / scored.length
  if (avgAll >= 4) return 'Padrão Elevado 👑'
  if (records.length >= 5) return 'Serial Dater 🎯'
  return 'Em Busca da Conexão 🌟'
}

export default function Wrapped() {
  const router = useRouter()
  const [records, setRecords] = useState<DateRecord[]>([])
  const [userName, setUserName] = useState('')
  const [period, setPeriod] = useState<'month' | 'year'>('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles').select('full_name').eq('id', user.id).single()
      setUserName(profile?.full_name?.split(' ')[0] ?? 'Você')

      const { data } = await supabase
        .from('dates').select('*').eq('user_id', user.id)
      setRecords(data ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  const now = new Date()
  const filtered = records.filter(r => {
    const d = new Date(r.created_at)
    if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    return d.getFullYear() === now.getFullYear()
  })

  const matches = filtered.filter(r => r.status === 'matched')
  const dated = filtered.filter(r => r.status === 'dated' || r.status === 'matched')
  const scored = filtered.filter(r => avg(r) !== null)
  const topPerson = scored.sort((a, b) => (avg(b) ?? 0) - (avg(a) ?? 0))[0]
  const avgScore = scored.length
    ? Math.round(scored.reduce((a, r) => a + (avg(r) ?? 0), 0) / scored.length * 10) / 10
    : null
  const reds = topFlags(filtered, '🚩')
  const greens = topFlags(filtered, '💚')
  const title = getTitle(filtered, matches.length)

  const periodLabel = period === 'month'
    ? now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
    : `${now.getFullYear()}`

  async function handleShare() {
    const text = `Meu Melhores Encontros — ${periodLabel}\n\n${title}\n\n📸 ${filtered.length} pessoas\n💘 ${matches.length} matches\n⭐ Score médio: ${avgScore ?? '—'}\n\nwww.daterecord.app`
    if (navigator.share) {
      await navigator.share({ text })
    } else {
      await navigator.clipboard.writeText(text)
      alert('Copiado para a área de transferência!')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf6f0] dark:bg-gray-950 flex items-center justify-center">
        <p className="font-caveat text-2xl text-gray-400">Carregando...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#faf6f0] dark:bg-gray-950 pb-12">
      <div className="max-w-sm mx-auto px-6 pt-8 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
          <h1 className="font-caveat text-3xl text-gray-800">Dating Wrapped</h1>
        </div>

        {/* Período */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm">
          {([
            { key: 'month', label: 'Este mês' },
            { key: 'year',  label: 'Este ano'  },
          ] as const).map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                period === p.key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
            <p className="font-caveat text-2xl text-gray-400">Nenhum registro em {periodLabel}</p>
            <p className="text-sm text-gray-400 mt-2">Adicione pessoas para gerar seu Wrapped</p>
          </div>
        ) : (
          <>
            {/* Card principal — estilo Wrapped */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-6 text-white flex flex-col gap-5 shadow-xl">

              {/* Título gerado */}
              <div className="text-center py-2">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{periodLabel}</p>
                <p className="font-caveat text-4xl leading-tight">{title}</p>
                <p className="text-gray-400 text-sm mt-1">{userName}</p>
              </div>

              {/* Números */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: filtered.length, label: 'pessoas', color: 'text-white' },
                  { value: dated.length,    label: 'dates',   color: 'text-rose-400' },
                  { value: matches.length,  label: 'matches', color: 'text-amber-400' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/10 rounded-2xl p-3 text-center">
                    <p className={`font-caveat text-3xl ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Score médio */}
              {avgScore !== null && (
                <div className="bg-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Score médio</p>
                    <p className="font-caveat text-3xl text-purple-300">{avgScore} <span className="text-sm text-gray-500">/ 5</span></p>
                  </div>
                  {topPerson && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Melhor conexão</p>
                      <div className="flex items-center gap-2 mt-1 justify-end">
                        {topPerson.photo_url ? (
                          <img src={topPerson.photo_url} alt={topPerson.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="font-caveat text-sm">{topPerson.name.charAt(0)}</span>
                          </div>
                        )}
                        <p className="font-caveat text-lg">{topPerson.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Flags */}
              {(greens.length > 0 || reds.length > 0) && (
                <div className="flex gap-3">
                  {greens.length > 0 && (
                    <div className="flex-1 bg-green-900/30 rounded-2xl p-3">
                      <p className="text-xs text-green-400 font-medium mb-2">Top green flags</p>
                      {greens.map(([flag, count]) => (
                        <p key={flag} className="text-xs text-gray-300 truncate">
                          {flag.replace('💚 ', '')} <span className="text-green-400">×{count}</span>
                        </p>
                      ))}
                    </div>
                  )}
                  {reds.length > 0 && (
                    <div className="flex-1 bg-red-900/30 rounded-2xl p-3">
                      <p className="text-xs text-red-400 font-medium mb-2">Top red flags</p>
                      {reds.map(([flag, count]) => (
                        <p key={flag} className="text-xs text-gray-300 truncate">
                          {flag.replace('🚩 ', '')} <span className="text-red-400">×{count}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Compartilhar */}
            <button
              onClick={handleShare}
              className="w-full py-4 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-gray-700 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <span>Compartilhar Wrapped</span>
              <span>↗</span>
            </button>
          </>
        )}
      </div>
    </main>
  )
}
