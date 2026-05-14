'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type DateRecord = {
  name: string
  status: string
  flags: string[]
  score_conversation: number | null
  score_appearance: number | null
  score_chemistry: number | null
  score_values: number | null
  score_fun: number | null
}

function avg(scores: (number | null)[]): number | null {
  const valid = scores.filter((s): s is number => s !== null)
  if (!valid.length) return null
  return Math.round(valid.reduce((a, b) => a + b) / valid.length * 10) / 10
}

function Bar({ value, max = 5, color = 'bg-purple-400' }: { value: number; max?: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-6 text-right">{value}</span>
    </div>
  )
}

export default function Insights() {
  const router = useRouter()
  const [records, setRecords] = useState<DateRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('dates').select('*').eq('user_id', user.id)
      setRecords(data ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  const scored = records.filter(r =>
    [r.score_conversation, r.score_appearance, r.score_chemistry, r.score_values, r.score_fun].some(s => s !== null)
  )

  const criteriaAvgs = [
    { label: 'Conversa',  emoji: '💬', val: avg(scored.map(r => r.score_conversation)) },
    { label: 'Aparência', emoji: '✨', val: avg(scored.map(r => r.score_appearance)) },
    { label: 'Química',   emoji: '🔥', val: avg(scored.map(r => r.score_chemistry)) },
    { label: 'Valores',   emoji: '🤝', val: avg(scored.map(r => r.score_values)) },
    { label: 'Diversão',  emoji: '😄', val: avg(scored.map(r => r.score_fun)) },
  ].filter(c => c.val !== null) as { label: string; emoji: string; val: number }[]

  const statusCounts = {
    matched:      records.filter(r => r.status === 'matched').length,
    dated:        records.filter(r => r.status === 'dated').length,
    interested:   records.filter(r => r.status === 'interested').length,
    not_interested: records.filter(r => r.status === 'not_interested').length,
  }

  const conversionRate = records.length > 0
    ? Math.round(((statusCounts.dated + statusCounts.matched) / records.length) * 100)
    : 0

  const matchRate = (statusCounts.dated + statusCounts.matched) > 0
    ? Math.round((statusCounts.matched / (statusCounts.dated + statusCounts.matched)) * 100)
    : 0

  const allFlags = records.flatMap(r => r.flags ?? [])
  const flagCounts: Record<string, number> = {}
  allFlags.forEach(f => { flagCounts[f] = (flagCounts[f] ?? 0) + 1 })
  const topRedFlags = Object.entries(flagCounts).filter(([k]) => k.startsWith('🚩')).sort((a,b) => b[1]-a[1]).slice(0, 3)
  const topGreenFlags = Object.entries(flagCounts).filter(([k]) => k.startsWith('💚')).sort((a,b) => b[1]-a[1]).slice(0, 3)

  const topCriteria = criteriaAvgs.length > 0
    ? criteriaAvgs.reduce((a, b) => a.val > b.val ? a : b)
    : null

  const weakCriteria = criteriaAvgs.length > 0
    ? criteriaAvgs.reduce((a, b) => a.val < b.val ? a : b)
    : null

  if (loading) return (
    <main className="min-h-screen bg-[#faf6f0] dark:bg-gray-950 flex items-center justify-center">
      <p className="font-caveat text-2xl text-gray-400">Carregando...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#faf6f0] dark:bg-gray-950 pb-12">
      <div className="max-w-sm mx-auto px-6 pt-8 flex flex-col gap-6">

        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
          <h1 className="font-caveat text-3xl text-gray-800 dark:text-gray-100">Seus padrões</h1>
        </div>

        {records.length < 3 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-8 text-center">
            <p className="font-caveat text-2xl text-gray-400">Ainda poucos dados</p>
            <p className="text-sm text-gray-400 mt-2">Adicione pelo menos 3 pessoas para ver seus padrões</p>
          </div>
        ) : (
          <>
            {/* Funil de conversão */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-6 flex flex-col gap-4">
              <h2 className="font-caveat text-xl text-gray-800 dark:text-gray-100">Funil de relacionamentos</h2>
              {[
                { label: 'Total de pessoas',  value: records.length,              color: 'bg-gray-400', max: records.length },
                { label: 'Interesse',         value: statusCounts.interested,     color: 'bg-blue-400', max: records.length },
                { label: 'Saíram juntos',     value: statusCounts.dated + statusCounts.matched, color: 'bg-rose-400', max: records.length },
                { label: 'Matches',           value: statusCounts.matched,        color: 'bg-amber-400', max: records.length },
              ].map(s => (
                <div key={s.label} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{s.label}</span>
                    <span>{s.value}</span>
                  </div>
                  <Bar value={s.value} max={s.max || 1} color={s.color} />
                </div>
              ))}
              <div className="flex gap-3 mt-2">
                <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 text-center">
                  <p className="font-caveat text-2xl text-rose-500">{conversionRate}%</p>
                  <p className="text-xs text-gray-400">chegaram ao date</p>
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 text-center">
                  <p className="font-caveat text-2xl text-amber-500">{matchRate}%</p>
                  <p className="text-xs text-gray-400">viraram match</p>
                </div>
              </div>
            </div>

            {/* Critérios médios */}
            {criteriaAvgs.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-6 flex flex-col gap-4">
                <h2 className="font-caveat text-xl text-gray-800 dark:text-gray-100">O que você valoriza mais</h2>
                {criteriaAvgs
                  .sort((a, b) => b.val - a.val)
                  .map(c => (
                    <div key={c.label} className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{c.emoji} {c.label}</span>
                      </div>
                      <Bar value={c.val} color="bg-purple-400" />
                    </div>
                  ))}

                {topCriteria && weakCriteria && topCriteria.label !== weakCriteria.label && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-3 text-sm text-purple-700 dark:text-purple-300">
                    Você tende a valorizar mais <strong>{topCriteria.emoji} {topCriteria.label}</strong> e é mais tolerante com <strong>{weakCriteria.emoji} {weakCriteria.label}</strong>.
                  </div>
                )}
              </div>
            )}

            {/* Flags */}
            {(topGreenFlags.length > 0 || topRedFlags.length > 0) && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-6 flex flex-col gap-4">
                <h2 className="font-caveat text-xl text-gray-800 dark:text-gray-100">Flags mais frequentes</h2>
                {topGreenFlags.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-green-500 uppercase tracking-wide mb-2">Green flags</p>
                    {topGreenFlags.map(([flag, count]) => (
                      <div key={flag} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{flag}</span>
                        <span className="text-xs text-green-500 font-medium">×{count}</span>
                      </div>
                    ))}
                  </div>
                )}
                {topRedFlags.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2">Red flags</p>
                    {topRedFlags.map(([flag, count]) => (
                      <div key={flag} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{flag}</span>
                        <span className="text-xs text-red-400 font-medium">×{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
