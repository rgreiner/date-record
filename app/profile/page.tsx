'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useDarkMode } from '@/hooks/useDarkMode'
import { getPin, setPin, removePin } from '@/hooks/usePin'

export default function Profile() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const { dark, toggle: toggleDark } = useDarkMode()
  const [pinInput, setPinInput] = useState('')
  const [pinSet, setPinSet] = useState(false)
  const [pinMsg, setPinMsg] = useState('')

  useEffect(() => { setPinSet(!!getPin()) }, [])

  function handleSavePin() {
    if (pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) {
      setPinMsg('Digite exatamente 4 números')
      return
    }
    setPin(pinInput)
    setPinSet(true)
    setPinInput('')
    setPinMsg('PIN ativado!')
    setTimeout(() => setPinMsg(''), 2000)
  }

  function handleRemovePin() {
    removePin()
    setPinSet(false)
    setPinMsg('PIN removido')
    setTimeout(() => setPinMsg(''), 2000)
  }

  const [form, setForm] = useState({
    full_name: '',
    instagram_handle: '',
    avatar_url: '',
  })
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('profiles')
        .select('full_name, instagram_handle, avatar_url')
        .eq('id', user.id)
        .single()

      if (data) {
        setForm({
          full_name: data.full_name ?? '',
          instagram_handle: data.instagram_handle ?? '',
          avatar_url: data.avatar_url ?? '',
        })
      }
      setLoading(false)
    }
    load()
  }, [router])

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    const url = URL.createObjectURL(file)
    setPhotoFile(file)
    setPhotoPreview(url)
  }

  const [saveError, setSaveError] = useState('')

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    const supabase = createClient()

    let avatar_url = form.avatar_url

    if (photoFile) {
      try {
        const ext = photoFile.name.split('.').pop()
        const path = `${userId}/avatar-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(path, photoFile, { upsert: true })

        if (uploadError) {
          setSaveError(`Erro no upload da foto: ${uploadError.message}. Salvando sem a foto.`)
        } else {
          const { data } = supabase.storage.from('photos').getPublicUrl(path)
          avatar_url = data.publicUrl
        }
      } catch {
        setSaveError('Erro ao enviar a foto. Salvando sem a foto.')
      }
    }

    const { error: dbError } = await supabase.from('profiles').update({
      full_name: form.full_name,
      instagram_handle: form.instagram_handle.replace('@', ''),
      avatar_url,
    }).eq('id', userId)

    if (dbError) {
      setSaveError(`Erro ao salvar: ${dbError.message}`)
      setSaving(false)
      return
    }

    router.push('/dashboard')
  }

  const currentPhoto = photoPreview || form.avatar_url ||
    (form.instagram_handle ? `https://unavatar.io/instagram/${form.instagram_handle}` : '')

  const firstName = form.full_name?.split(' ')[0] ?? 'Você'

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

        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
          <h1 className="font-caveat text-3xl text-gray-800">Meu perfil</h1>
        </div>

        {/* Polaroid do usuário */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="bg-white shadow-xl p-3 pb-8 w-44 rotate-[1deg] cursor-pointer group"
            onClick={() => fileRef.current?.click()}
          >
            <div className="relative w-full aspect-square overflow-hidden">
              {currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt={firstName}
                  className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              ) : (
                <div className="w-full h-full bg-rose-50 flex items-center justify-center">
                  <span className="font-caveat text-6xl text-rose-200">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                  trocar foto
                </span>
              </div>
            </div>
            <p className="font-caveat text-xl text-gray-800 mt-2 truncate">{firstName}</p>
            {form.instagram_handle && (
              <p className="text-xs text-gray-400">@{form.instagram_handle}</p>
            )}
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

        {/* Dados */}
        <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-4">
          <h2 className="font-caveat text-xl text-gray-800">Informações</h2>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">@ do Instagram</label>
            <input
              type="text"
              placeholder="@seu.instagram"
              value={form.instagram_handle}
              onChange={e => setForm(f => ({ ...f, instagram_handle: e.target.value }))}
              className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-gray-400 transition-colors"
            />
            <p className="text-xs text-gray-400">Usado para que outras pessoas te encontrem para um match</p>
          </div>
        </div>

        {saveError && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-700">
            {saveError}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-2xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold text-base hover:bg-gray-700 transition-colors disabled:opacity-40 shadow-lg"
        >
          {saving ? 'Salvando...' : 'Salvar perfil'}
        </button>

        {/* Preferências */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-6 flex flex-col gap-5">
          <h2 className="font-caveat text-xl text-gray-800 dark:text-gray-100">Preferências</h2>

          {/* Dark mode */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Modo escuro</p>
              <p className="text-xs text-gray-400">Tema escuro para uso noturno</p>
            </div>
            <button
              onClick={toggleDark}
              className={`w-12 h-6 rounded-full transition-colors relative ${dark ? 'bg-gray-900 dark:bg-gray-100' : 'bg-gray-200'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white dark:bg-gray-900 shadow absolute top-0.5 transition-all ${dark ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>

          {/* PIN */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">PIN de acesso</p>
              <p className="text-xs text-gray-400">Protege o app com um código de 4 dígitos</p>
            </div>
            {pinSet ? (
              <div className="flex gap-2">
                <div className="flex-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-2.5 text-sm text-green-600 dark:text-green-400">
                  ✓ PIN ativado
                </div>
                <button
                  onClick={handleRemovePin}
                  className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 text-sm hover:border-red-300 hover:text-red-500 transition-colors"
                >
                  Remover
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="4 dígitos"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 text-gray-800 text-center text-xl tracking-widest outline-none focus:border-gray-400 transition-colors font-caveat"
                />
                <button
                  onClick={handleSavePin}
                  disabled={pinInput.length !== 4}
                  className="px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium disabled:opacity-40 transition-colors"
                >
                  Ativar
                </button>
              </div>
            )}
            {pinMsg && <p className="text-xs text-center text-gray-500">{pinMsg}</p>}
          </div>
        </div>

        {/* Links rápidos */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-4 flex flex-col">
          {[
            { href: '/insights', label: '📊 Seus padrões', sub: 'Análise dos seus dates' },
            { href: '/wrapped',  label: '🎉 Dating Wrapped', sub: 'Resumo do período' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:opacity-70 transition-opacity"
            >
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.label}</p>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </div>
              <span className="text-gray-300">›</span>
            </Link>
          ))}
        </div>

        {/* Sair */}
        <button
          onClick={async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
            router.push('/')
          }}
          className="w-full py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-medium text-sm hover:border-red-300 hover:text-red-500 dark:hover:border-red-800 dark:hover:text-red-400 transition-colors"
        >
          Sair da conta
        </button>

        <div className="h-2" />

      </div>
    </main>
  )
}
