'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import FlagPicker from '@/components/FlagPicker'

type DateRecord = {
  id: string
  name: string
  instagram_handle: string
  photo_url: string
  status: 'dated' | 'interested' | 'not_interested' | 'matched' | 'together' | 'one_night' | 'marry' | 'surdina' | 'orbit' | 'ghosted_them' | 'ghosted_me' | 'fwb'
  date_on: string | null
  notes: string | null
  flags: string[]
  score_conversation: number | null
  score_appearance: number | null
  score_chemistry: number | null
  score_values: number | null
  score_fun: number | null
}

type CriteriaKey = 'score_conversation' | 'score_appearance' | 'score_chemistry' | 'score_values' | 'score_fun'

const criteriaByStatus: Record<'dated' | 'matched' | 'interested', { key: CriteriaKey; label: string; emoji: string }[]> = {
  dated: [
    { key: 'score_conversation', label: 'Conversa',   emoji: '💬' },
    { key: 'score_appearance',   label: 'Aparência',  emoji: '✨' },
    { key: 'score_chemistry',    label: 'Química',    emoji: '🔥' },
    { key: 'score_values',       label: 'Valores',    emoji: '🤝' },
    { key: 'score_fun',          label: 'Diversão',   emoji: '😄' },
  ],
  matched: [
    { key: 'score_conversation', label: 'Conversa',   emoji: '💬' },
    { key: 'score_appearance',   label: 'Aparência',  emoji: '✨' },
    { key: 'score_chemistry',    label: 'Química',    emoji: '🔥' },
    { key: 'score_values',       label: 'Valores',    emoji: '🤝' },
    { key: 'score_fun',          label: 'Diversão',   emoji: '😄' },
  ],
  interested: [
    { key: 'score_appearance',   label: 'Atração pelo perfil',   emoji: '✨' },
    { key: 'score_conversation', label: 'Conversa online',       emoji: '💬' },
    { key: 'score_chemistry',    label: 'Interesse recíproco',   emoji: '🔁' },
    { key: 'score_values',       label: 'Vibe geral',            emoji: '🎯' },
    { key: 'score_fun',          label: 'Intenção de sair',      emoji: '📅' },
  ],
}

function StarRating({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange(star)}
          className="text-2xl transition-transform hover:scale-110"
        >
          {star <= (hovered ?? value ?? 0) ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  )
}

export default function DateDetail() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const fileRef = useRef<HTMLInputElement>(null)

  const [record, setRecord] = useState<DateRecord | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [generatingInvite, setGeneratingInvite] = useState(false)
  const [copied, setCopied] = useState(false)
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data } = await supabase.from('dates').select('*').eq('id', id).single()
      if (!data) { router.push('/dashboard'); return }
      setRecord(data)
      setLoading(false)
    }
    load()
  }, [id, router])

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    const url = URL.createObjectURL(file)
    setPhotoFile(file)
    setPhotoPreview(url)
  }

  function updateField<K extends keyof DateRecord>(key: K, value: DateRecord[K]) {
    setRecord(r => r ? { ...r, [key]: value } : r)
  }

  const [saveError, setSaveError] = useState('')

  async function handleSave() {
    if (!record) return
    setSaving(true)
    setSaveError('')
    const supabase = createClient()

    let photo_url = record.photo_url

    if (photoFile) {
      try {
        const ext = photoFile.name.split('.').pop()
        const path = `${userId}/${record.instagram_handle || 'photo'}-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(path, photoFile, { upsert: true })
        if (uploadError) {
          setSaveError(`Erro no upload da foto: ${uploadError.message}`)
        } else {
          const { data } = supabase.storage.from('photos').getPublicUrl(path)
          photo_url = data.publicUrl
        }
      } catch {
        setSaveError('Erro ao enviar a foto. Salvando sem ela.')
      }
    }

    const { error: dbError } = await supabase.from('dates').update({
      name: record.name,
      instagram_handle: record.instagram_handle,
      photo_url,
      status: record.status,
      date_on: record.date_on,
      notes: record.notes,
      flags: record.flags ?? [],
      score_conversation: record.score_conversation,
      score_appearance: record.score_appearance,
      score_chemistry: record.score_chemistry,
      score_values: record.score_values,
      score_fun: record.score_fun,
    }).eq('id', id)

    if (dbError) {
      setSaveError(`Erro ao salvar: ${dbError.message}`)
      setSaving(false)
      return
    }

    router.push('/dashboard')
  }

  async function handleGenerateInvite() {
    if (!record) return
    setGeneratingInvite(true)
    const supabase = createClient()

    const { data: existing } = await supabase
      .from('invites')
      .select('token')
      .eq('date_id', id)
      .is('responded_at', null)
      .single()

    const token = existing?.token ?? (() => {
      // Token será gerado pelo banco via default
      return null
    })()

    if (token) {
      const link = `${window.location.origin}/invite/${token}`
      setInviteLink(link)
      setGeneratingInvite(false)
      return
    }

    const { data: newInvite } = await supabase
      .from('invites')
      .insert({ sender_id: userId, date_id: id, recipient_name: record.name })
      .select('token')
      .single()

    if (newInvite) {
      setInviteLink(`${window.location.origin}/invite/${newInvite.token}`)
    }
    setGeneratingInvite(false)
  }

  async function handleCopyInvite() {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleShareInvite() {
    if (navigator.share) {
      navigator.share({
        title: 'Melhores Encontros',
        text: `Oi ${record?.name ?? ''}! Quero saber se temos match 💘`,
        url: inviteLink,
      })
    }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('dates').delete().eq('id', id)
    router.push('/dashboard')
  }

  if (loading || !record) {
    return (
      <main className="min-h-screen bg-[#faf6f0] dark:bg-gray-950 flex items-center justify-center">
        <p className="font-caveat text-2xl text-gray-400">Carregando...</p>
      </main>
    )
  }

  const currentPhoto = photoPreview || record.photo_url

  return (
    <main className="min-h-screen bg-[#faf6f0] dark:bg-gray-950 pb-12">
      <div className="max-w-sm mx-auto px-6 pt-8 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
          <h1 className="font-caveat text-3xl text-gray-800">Editar</h1>
        </div>

        {/* Polaroid clicável */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="bg-white shadow-xl p-3 pb-8 w-44 rotate-[-2deg] cursor-pointer group"
            onClick={() => fileRef.current?.click()}
          >
            <div className="relative w-full aspect-square overflow-hidden">
              {currentPhoto ? (
                <img src={currentPhoto} alt={record.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1">
                  <span className="font-caveat text-6xl text-gray-200">
                    {record.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                  trocar foto
                </span>
              </div>
            </div>
            <p className="font-caveat text-xl text-gray-800 mt-2 truncate">{record.name}</p>
            <p className="text-xs text-gray-400">@{record.instagram_handle}</p>
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-sm text-gray-500 underline hover:text-gray-700 transition-colors"
          >
            {currentPhoto ? 'Trocar foto' : 'Adicionar foto'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>

        {/* Dados básicos */}
        <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-4">
          <h2 className="font-caveat text-xl text-gray-800">Informações</h2>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              value={record.name}
              onChange={e => updateField('name', e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">@ do Instagram</label>
            <input
              type="text"
              value={record.instagram_handle}
              onChange={e => updateField('instagram_handle', e.target.value.replace('@', ''))}
              className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Situação</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'interested',     label: 'Tenho interesse' },
                { value: 'orbit',          label: '🛸 Em órbita' },
                { value: 'surdina',        label: '🤫 Sigo na surdina' },
                { value: 'dated',          label: 'Já saímos' },
                { value: 'one_night',      label: '🌙 Só uma noite' },
                { value: 'fwb',            label: '😏 AMB' },
                { value: 'marry',          label: '💍 É pra casar' },
                { value: 'matched',        label: '✨ Match!' },
                { value: 'together',       label: '❤️ Juntos' },
                { value: 'ghosted_me',     label: '👻 Me ghostaram' },
                { value: 'ghosted_them',   label: '🫣 Ghostei' },
                { value: 'not_interested', label: 'Sem interesse' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateField('status', opt.value as DateRecord['status'])}
                  className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                    record.status === opt.value
                      ? opt.value === 'together'
                        ? 'border-red-400 bg-red-50 text-red-600'
                        : opt.value === 'matched'
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-gray-800 bg-gray-50 text-gray-800'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Avaliação — oculta só para sem interesse */}
        {record.status !== 'not_interested' && (() => {
          const preDate = ['interested', 'orbit', 'surdina']
          const isPreDate = preDate.includes(record.status)
          return (
          <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-5">

            {isPreDate ? (
              <>
                <div>
                  <h2 className="font-caveat text-xl text-gray-800">Como está indo?</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Avalie o interesse antes do encontro acontecer</p>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-caveat text-xl text-gray-800">Avaliação do encontro</h2>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Data do encontro</label>
                  <input
                    type="date"
                    value={record.date_on ?? ''}
                    onChange={e => updateField('date_on', e.target.value || null)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
              </>
            )}

            {(criteriaByStatus[isPreDate ? 'interested' : 'dated']).map(({ key, label, emoji }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{emoji} {label}</span>
                <StarRating
                  value={record[key]}
                  onChange={v => updateField(key, v)}
                />
              </div>
            ))}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Anotações</label>
              <textarea
                rows={3}
                placeholder={
                  isPreDate
                    ? 'Como está a conversa? Alguma impressão inicial?'
                    : 'Como foi o encontro? O que você sentiu?'
                }
                value={record.notes ?? ''}
                onChange={e => updateField('notes', e.target.value || null)}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-gray-400 transition-colors resize-none"
              />
            </div>

            {/* Flags */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Flags</label>
              <FlagPicker
                selected={record.flags ?? []}
                onChange={flags => updateField('flags', flags)}
              />
            </div>
          </div>
          )
        })()}

        {saveError && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-700">
            {saveError}
          </div>
        )}

        {/* Salvar */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-2xl bg-gray-900 text-white font-semibold text-base hover:bg-gray-700 transition-colors disabled:opacity-40 shadow-lg"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>

        {/* Convite para match */}
        {record.status !== 'not_interested' && record.status !== 'matched' && (
          <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3">
            <div>
              <p className="font-caveat text-xl text-gray-800">Enviar convite de match 💘</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Manda um link para {record.name} avaliar você. Se der match mútuo, os dois são notificados.
              </p>
            </div>

            {inviteLink ? (
              <div className="flex flex-col gap-2">
                <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-500 break-all font-mono">
                  {inviteLink}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyInvite}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-rose-500 text-white hover:bg-rose-600'
                    }`}
                  >
                    {copied ? 'Copiado! ✓' : 'Copiar link'}
                  </button>
                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <button
                      onClick={handleShareInvite}
                      className="px-4 py-2.5 rounded-xl border-2 border-rose-200 text-rose-500 text-sm font-medium hover:bg-rose-50 transition-colors"
                    >
                      ↗
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={handleGenerateInvite}
                disabled={generatingInvite}
                className="w-full py-2.5 rounded-xl border-2 border-rose-200 text-rose-500 text-sm font-medium hover:bg-rose-50 transition-colors disabled:opacity-40"
              >
                {generatingInvite ? 'Gerando...' : 'Gerar link de convite'}
              </button>
            )}
          </div>
        )}

        {/* Deletar */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={`w-full py-3 rounded-2xl text-sm font-medium transition-colors ${
            confirmDelete
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'text-red-400 hover:text-red-600'
          }`}
        >
          {deleting ? 'Removendo...' : confirmDelete ? 'Confirmar exclusão' : 'Remover registro'}
        </button>
        {confirmDelete && (
          <button
            onClick={() => setConfirmDelete(false)}
            className="text-xs text-gray-400 text-center hover:text-gray-600"
          >
            Cancelar
          </button>
        )}

      </div>
    </main>
  )
}
