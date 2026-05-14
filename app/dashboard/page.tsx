'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import PolaroidCard from '@/components/PolaroidCard'
import AddCard from '@/components/AddCard'
import { Toast } from '@/components/Toast'

type DateRecord = {
  id: string
  name: string
  instagram_handle: string
  photo_url: string
  status: 'interested' | 'not_interested' | 'dated' | 'matched' | 'together'
  score_conversation: number | null
  score_appearance: number | null
  score_chemistry: number | null
  score_values: number | null
  score_fun: number | null
  created_at: string
}

type Profile = {
  full_name: string
  instagram_handle: string | null
  avatar_url: string | null
}

function averageScore(record: DateRecord): number | undefined {
  const scores = [
    record.score_conversation,
    record.score_appearance,
    record.score_chemistry,
    record.score_values,
    record.score_fun,
  ].filter((s): s is number => s !== null)
  if (scores.length === 0) return undefined
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
}

function hasScores(r: DateRecord) {
  return [r.score_conversation, r.score_appearance, r.score_chemistry, r.score_values, r.score_fun]
    .some(s => s !== null)
}

const rotations = [-3, 2, -1, 4, -2, 3, -4, 1]

function TogetherCard({ partner, userPhoto, userName }: { partner: DateRecord; userPhoto: string; userName: string }) {
  return (
    <Link href={`/dates/${partner.id}`} className="block">
      <div className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border border-red-100 rounded-3xl p-6 hover:shadow-lg transition-shadow overflow-hidden relative">

        {/* Texto decorativo de fundo */}
        <p className="absolute top-3 right-4 font-caveat text-7xl text-red-100 select-none leading-none">❤</p>

        <p className="text-xs font-semibold text-red-400 tracking-widest uppercase mb-5">
          ❤️ Em relacionamento
        </p>

        {/* Dois polaroids lado a lado */}
        <div className="flex justify-center items-end gap-4">
          <div className="bg-white shadow-xl p-2.5 pb-7 w-36 rotate-[-5deg] hover:rotate-[-3deg] transition-transform">
            {userPhoto ? (
              <img src={userPhoto} alt={userName} className="w-full aspect-square object-cover" />
            ) : (
              <div className="w-full aspect-square bg-rose-100 flex items-center justify-center">
                <span className="font-caveat text-4xl text-rose-300">{userName.charAt(0)}</span>
              </div>
            )}
            <p className="font-caveat text-base text-gray-700 mt-2 truncate">{userName}</p>
          </div>

          <div className="bg-white shadow-xl p-2.5 pb-7 w-36 rotate-[5deg] hover:rotate-[3deg] transition-transform">
            {partner.photo_url ? (
              <img src={partner.photo_url} alt={partner.name} className="w-full aspect-square object-cover" />
            ) : (
              <div className="w-full aspect-square bg-red-100 flex items-center justify-center">
                <span className="font-caveat text-4xl text-red-300">{partner.name.charAt(0)}</span>
              </div>
            )}
            <p className="font-caveat text-base text-gray-700 mt-2 truncate">{partner.name}</p>
          </div>
        </div>

        <p className="text-xs text-red-300 text-center mt-5">Toque para ver detalhes →</p>
      </div>
    </Link>
  )
}

function MatchCard({ matches }: { matches: DateRecord[] }) {
  return (
    <Link href={matches.length === 1 ? `/dates/${matches[0].id}` : '/dashboard'}>
      <div className="bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
        <p className="text-xs font-medium text-rose-400 mb-3">
          💘 {matches.length === 1 ? 'Você tem um match!' : `Você tem ${matches.length} matches!`}
        </p>

        {/* Fotos dos matches */}
        <div className="flex gap-2 mb-3">
          {matches.slice(0, 3).map((m, i) => (
            <div
              key={m.id}
              className="bg-white shadow-md p-1.5 pb-4 flex-1 max-w-[90px]"
              style={{ transform: `rotate(${[-3, 2, -1][i]}deg)` }}
            >
              {m.photo_url ? (
                <img
                  src={m.photo_url}
                  alt={m.name}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square bg-rose-100 flex items-center justify-center">
                  <span className="font-caveat text-3xl text-rose-300">
                    {m.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <p className="font-caveat text-xs text-gray-600 mt-1 truncate">{m.name}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-rose-400">Ver {matches.length === 1 ? 'detalhes' : 'todos'} →</p>
      </div>
    </Link>
  )
}

function UserPhoto({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false)
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        className="w-full aspect-square object-cover"
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <div className="w-full aspect-square bg-rose-100 flex items-center justify-center">
      <span className="font-caveat text-5xl text-rose-300">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [records, setRecords] = useState<DateRecord[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: profileData }, { data: datesData }] = await Promise.all([
        supabase.from('profiles').select('full_name, instagram_handle, avatar_url').eq('id', user.id).single(),
        supabase.from('dates').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])

      setProfile(profileData ?? { full_name: user.user_metadata.full_name ?? 'Você', instagram_handle: null, avatar_url: null })
      setRecords(datesData ?? [])
      setLoading(false)

      // Notificação de novos matches
      const lastSeen = localStorage.getItem('dr_last_seen') ?? '0'
      const newMatches = (datesData ?? []).filter(
        r => r.status === 'matched' && new Date(r.created_at).getTime() > parseInt(lastSeen)
      )
      if (newMatches.length > 0) {
        setMatchToast(
          newMatches.length === 1
            ? `💘 Match com ${newMatches[0].name}!`
            : `💘 Você tem ${newMatches.length} novos matches!`
        )
      }
      localStorage.setItem('dr_last_seen', String(Date.now()))
    }
    load()
  }, [router])

  const [sortBy, setSortBy] = useState<'recent' | 'ranking' | 'status'>('recent')
  const [matchToast, setMatchToast] = useState('')

  const scoreMap = useMemo(() => new Map(records.map(r => [r.id, averageScore(r)])), [records])
  const partner = records.find(r => r.status === 'together') ?? null
  const totalMatches = records.filter(r => r.status === 'matched').length
  const topScore = useMemo(() => {
    const scores = [...scoreMap.values()].filter((s): s is number => s !== undefined)
    return scores.length > 0 ? Math.max(...scores) : null
  }, [scoreMap])

  const sortedRecords = useMemo(() => {
    if (sortBy === 'ranking') {
      return [...records].sort((a, b) => (scoreMap.get(b.id) ?? -1) - (scoreMap.get(a.id) ?? -1))
    }
    if (sortBy === 'status') {
      const order: Record<string, number> = { together: 0, matched: 1, dated: 2, interested: 3, not_interested: 4 }
      return [...records].sort((a, b) => order[a.status] - order[b.status])
    }
    return records // já vem por created_at desc do banco
  }, [records, sortBy, scoreMap])

  const statusGroups = useMemo(() => {
    if (sortBy !== 'status') return null
    const labels: Record<string, string> = {
      together: '❤️ Juntos',
      matched: '✨ Match',
      dated: 'Já saímos',
      interested: 'Tenho interesse',
      not_interested: 'Sem interesse',
    }
    const groups: { key: string; label: string; items: typeof records }[] = []
    for (const [key, label] of Object.entries(labels)) {
      const items = sortedRecords.filter(r => r.status === key)
      if (items.length > 0) groups.push({ key, label, items })
    }
    return groups
  }, [sortBy, sortedRecords])

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Você'
  const userHandle = profile?.instagram_handle
  const userPhoto = profile?.avatar_url || ''

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf6f0] flex items-center justify-center">
        <p className="font-caveat text-2xl text-gray-400">Carregando...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#faf6f0] dark:bg-gray-950">
      {matchToast && <Toast message={matchToast} onClose={() => setMatchToast('')} />}

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-amber-100 bg-[#faf6f0] dark:bg-gray-950 dark:border-gray-800">
        <h1 className="font-caveat text-3xl text-gray-800 dark:text-gray-100">Date Record</h1>
        <div className="flex items-center gap-3">
          <Link href="/insights" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
            📊
          </Link>
          <Link href="/import" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
            Importar
          </Link>
          <Link href="/add" className="flex items-center gap-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-4 py-2 rounded-full hover:bg-gray-700 transition-colors">
            <span className="text-lg leading-none">+</span> Adicionar
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-6 flex flex-col gap-6">

        {/* Barra de perfil compacta */}
        <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="shrink-0 w-11 h-11 rounded-full overflow-hidden bg-rose-100 shadow-md ring-2 ring-white dark:ring-gray-900">
            <UserPhoto src={userPhoto} name={firstName} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-caveat text-xl text-gray-800 dark:text-gray-100 leading-tight">{firstName}</p>
            {userHandle && <p className="text-xs text-gray-400 truncate">@{userHandle}</p>}
          </div>
          <div className="flex items-center gap-3 text-xs shrink-0">
            <span className="text-gray-400">📸 <span className="font-medium text-gray-600 dark:text-gray-300">{records.length}</span></span>
            <span className="text-rose-400">💘 <span className="font-medium">{totalMatches}</span></span>
            <span className="text-purple-400">⭐ <span className="font-medium">{topScore ?? '—'}</span></span>
          </div>
        </Link>

        {/* Hero — relacionamento, match ou estado neutro */}
        {partner ? (
          <TogetherCard partner={partner} userPhoto={userPhoto} userName={firstName} />
        ) : totalMatches > 0 ? (
          <MatchCard matches={records.filter(r => r.status === 'matched')} />
        ) : topScore !== null ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Melhor conexão</p>
              <p className="font-caveat text-2xl text-purple-500">{topScore} <span className="text-sm text-gray-400 font-sans">/ 5</span></p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {records.find(r => scoreMap.get(r.id) === topScore)?.name ?? ''}
              </p>
            </div>
            <div className="font-caveat text-5xl text-gray-100 dark:text-gray-800 select-none">⭐</div>
          </div>
        ) : null}

        {records.length === 0 ? (

          /* Estado vazio */
          <div className="flex flex-col items-center text-center gap-6">
            <div>
              <h2 className="font-caveat text-3xl text-gray-800 mb-2">Comece agora!</h2>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                Adicione as pessoas com quem saiu ou tem interesse e comece a montar seu histórico.
              </p>
            </div>
            <div className="bg-white rounded-3xl shadow-sm p-6 w-full text-left flex flex-col gap-4">
              <h3 className="font-caveat text-xl text-gray-800">Como funciona</h3>
              {[
                { icon: '➕', title: 'Adicione uma pessoa', desc: 'Informe o @ do Instagram' },
                { icon: '⭐', title: 'Avalie o encontro', desc: 'Dê notas por conversa, química e mais' },
                { icon: '💘', title: 'Descubra seu match', desc: 'Se a outra pessoa também te avaliar bem, é um match!' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{item.title}</p>
                    <p className="text-gray-400 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/add" className="flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold text-base hover:bg-gray-700 transition-colors shadow-lg">
              <span className="text-xl leading-none">+</span> Adicionar primeira pessoa
            </Link>
          </div>

        ) : (
          <>
            {/* Controles de ordenação */}
            <div className="flex gap-2">
              {([
                { key: 'recent',  label: 'Recentes' },
                { key: 'ranking', label: 'Ranking'  },
                { key: 'status',  label: 'Status'   },
              ] as const).map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    sortBy === opt.key
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Vista por Status — seções agrupadas */}
            {sortBy === 'status' && statusGroups ? (
              statusGroups.map((group, gi) => (
                <section key={group.key}>
                  <h2 className="font-caveat text-2xl text-gray-700 mb-2">{group.label}</h2>
                  <div className="flex flex-wrap gap-5 py-4">
                    {group.items.map((r, i) => (
                      <PolaroidCard
                        key={r.id}
                        name={r.name}
                        handle={r.instagram_handle ?? ''}
                        photoUrl={r.photo_url ?? ''}
                        status={r.status}
                        score={scoreMap.get(r.id)}
                        rotation={rotations[(gi * 3 + i) % rotations.length]}
                        href={`/dates/${r.id}`}
                      />
                    ))}
                  </div>
                </section>
              ))
            ) : sortBy === 'ranking' ? (
              /* Vista Ranking — lista com posição */
              <section>
                <div className="flex flex-col gap-3">
                  {sortedRecords.map((r, i) => (
                    <Link key={r.id} href={`/dates/${r.id}`}>
                      <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                        <span className="font-caveat text-2xl text-gray-300 w-6 shrink-0">{i + 1}</span>
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100 shrink-0">
                          {r.photo_url ? (
                            <img src={r.photo_url} alt={r.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="font-caveat text-xl text-gray-300">
                                {r.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate">{r.name}</p>
                          <p className="text-xs text-gray-400">@{r.instagram_handle}</p>
                        </div>
                        <div className="text-right shrink-0">
                          {scoreMap.get(r.id) !== undefined ? (
                            <>
                              <p className="font-caveat text-2xl text-purple-500">{scoreMap.get(r.id)}</p>
                              <p className="text-xs text-gray-400">score</p>
                            </>
                          ) : (
                            <p className="text-xs text-gray-300">sem nota</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : (
              /* Vista Recentes — polaroids */
              <section>
                <div className="flex flex-wrap gap-5 py-4">
                  {sortedRecords.map((r, i) => (
                    <PolaroidCard
                      key={r.id}
                      name={r.name}
                      handle={r.instagram_handle ?? ''}
                      photoUrl={r.photo_url ?? ''}
                      status={r.status}
                      score={scoreMap.get(r.id)}
                      rotation={rotations[i % rotations.length]}
                      href={`/dates/${r.id}`}
                    />
                  ))}
                  <AddCard rotation={-2} />
                </div>
              </section>
            )}
          </>
        )}

      </div>
    </main>
  )
}
