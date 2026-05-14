'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AddDate() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [handle, setHandle] = useState('')
  const [resolvedHandle, setResolvedHandle] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'interested' | 'dated'>('interested')
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoFailed, setPhotoFailed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'handle' | 'details'>('handle')

  function handleLookup() {
    const clean = handle.replace('@', '').trim()
    if (!clean) return
    setResolvedHandle(clean)
    setName(clean)
    setStep('details')
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (photoPreview && !photoUrl) URL.revokeObjectURL(photoPreview)
    const url = URL.createObjectURL(file)
    setPhotoFile(file)
    setPhotoPreview(url)
    setPhotoUrl('')
    setPhotoFailed(false)
  }

  async function handleSave() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    let photo_url = photoUrl.trim()

    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${user.id}/${resolvedHandle}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(path, photoFile, { upsert: true })

      if (!uploadError) {
        const { data } = supabase.storage.from('photos').getPublicUrl(path)
        photo_url = data.publicUrl
      }
    }

    await supabase.from('dates').insert({
      user_id: user.id,
      name: name || resolvedHandle,
      instagram_handle: resolvedHandle,
      photo_url,
      status,
    })

    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-[#faf6f0] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">

        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => step === 'details' ? setStep('handle') : router.back()}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ←
          </button>
          <h1 className="font-caveat text-3xl text-gray-800">Adicionar pessoa</h1>
        </div>

        {/* Step 1 — @ do Instagram */}
        {step === 'handle' && (
          <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-4">
            <p className="text-sm text-gray-500">
              Digite o @ do Instagram de quem você quer adicionar.
            </p>
            <input
              type="text"
              placeholder="@instagram"
              value={handle}
              onChange={e => setHandle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLookup()}
              className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-gray-400 transition-colors"
              autoFocus
            />
            <button
              onClick={handleLookup}
              disabled={!handle.trim()}
              className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-700 transition-colors disabled:opacity-40"
            >
              Continuar
            </button>
          </div>
        )}

        {/* Step 2 — Detalhes */}
        {step === 'details' && (
          <div className="flex flex-col gap-4">

            {/* Polaroid preview com upload */}
            <div className="flex justify-center">
              <div
                className="bg-white shadow-xl p-3 pb-8 w-40 rotate-[-2deg] cursor-pointer group"
                onClick={() => fileRef.current?.click()}
              >
                {photoPreview && !photoFailed ? (
                  <img
                    src={photoPreview}
                    alt={name}
                    className="w-full aspect-square object-cover"
                    onError={() => setPhotoFailed(true)}
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-50 flex flex-col items-center justify-center gap-1 group-hover:bg-gray-100 transition-colors">
                    <span className="font-caveat text-5xl text-gray-200">
                      {(name || resolvedHandle).charAt(0).toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-300 text-center px-2">
                      {photoFailed ? 'link inválido' : 'toque para adicionar foto'}
                    </span>
                  </div>
                )}
                <p className="font-caveat text-lg text-gray-800 mt-2 truncate">
                  {name || resolvedHandle}
                </p>
                <p className="text-xs text-gray-400">@{resolvedHandle}</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-4">

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Foto</label>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 text-sm hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  📎 Enviar foto do dispositivo
                </button>
                <div className="flex items-center gap-2 my-1">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-300">ou</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <input
                  type="url"
                  placeholder="Cole uma URL de imagem pública"
                  value={photoUrl}
                  onChange={e => {
                    setPhotoUrl(e.target.value)
                    setPhotoPreview(e.target.value)
                    setPhotoFailed(false)
                  }}
                  className={`border rounded-xl px-4 py-3 text-gray-800 text-sm outline-none transition-colors ${
                    photoFailed ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-400'
                  }`}
                />
                {photoFailed && (
                  <p className="text-xs text-red-400">
                    Este link não funciona. Links do Instagram são bloqueados — use o botão acima para enviar a foto do seu dispositivo.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  placeholder="Como você chama essa pessoa?"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-gray-400 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Situação</label>
                <div className="flex gap-2">
                  {[
                    { value: 'interested', label: 'Tenho interesse' },
                    { value: 'dated', label: 'Já saímos' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setStatus(opt.value as 'interested' | 'dated')}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                        status === opt.value
                          ? 'border-gray-800 bg-gray-50 text-gray-800'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-700 transition-colors disabled:opacity-40"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
