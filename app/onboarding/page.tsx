'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const steps = ['Quem é você?', 'Seu interesse', 'Seu Instagram', 'Primeiros dates']

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    gender: '',
    interested_in: '',
    instagram_handle: '',
  })
  const [handles, setHandles] = useState(['', '', ''])
  const [loading, setLoading] = useState(false)

  async function handleFinish() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: user.user_metadata.full_name,
      gender: form.gender,
      interested_in: form.interested_in,
      instagram_handle: form.instagram_handle.replace('@', ''),
    })

    const validHandles = handles
      .map(h => h.replace('@', '').trim())
      .filter(h => h.length > 0)

    if (validHandles.length > 0) {
      await supabase.from('dates').insert(
        validHandles.map(handle => ({
          user_id: user.id,
          name: handle,
          instagram_handle: handle,
          status: 'interested',
        }))
      )
    }

    router.push('/dashboard')
  }

  function updateHandle(index: number, value: string) {
    setHandles(prev => prev.map((h, i) => i === index ? value : h))
  }

  const LAST_STEP = steps.length - 1

  return (
    <main className="min-h-screen bg-[#faf6f0] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="font-caveat text-5xl text-gray-800 mb-1">Date Record</h1>
          <p className="text-gray-500">Vamos configurar seu perfil</p>
        </div>

        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-gray-800' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h2 className="font-caveat text-2xl text-gray-800 mb-6">{steps[step]}</h2>

          {/* Step 0 — Gênero */}
          {step === 0 && (
            <div className="flex flex-col gap-3">
              {[
                { value: 'man', label: 'Homem' },
                { value: 'woman', label: 'Mulher' },
                { value: 'other', label: 'Prefiro não informar' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setForm(f => ({ ...f, gender: opt.value }))}
                  className={`w-full py-3 px-4 rounded-xl border-2 text-left font-medium transition-colors ${
                    form.gender === opt.value
                      ? 'border-gray-800 bg-gray-50 text-gray-800'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Step 1 — Interesse */}
          {step === 1 && (
            <div className="flex flex-col gap-3">
              {[
                { value: 'men', label: 'Homens' },
                { value: 'women', label: 'Mulheres' },
                { value: 'both', label: 'Ambos' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setForm(f => ({ ...f, interested_in: opt.value }))}
                  className={`w-full py-3 px-4 rounded-xl border-2 text-left font-medium transition-colors ${
                    form.interested_in === opt.value
                      ? 'border-gray-800 bg-gray-50 text-gray-800'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Step 2 — Instagram */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-500">
                Opcional — usado para que outras pessoas possam te encontrar para um match.
              </p>
              <input
                type="text"
                placeholder="@seu.instagram"
                value={form.instagram_handle}
                onChange={e => setForm(f => ({ ...f, instagram_handle: e.target.value }))}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-gray-400 transition-colors"
              />
            </div>
          )}

          {/* Step 3 — Primeiros dates */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-500">
                Adicione o @ de até 3 pessoas com quem saiu ou tem interesse. Você pode avaliar depois.
              </p>
              {handles.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-gray-300 font-caveat text-xl w-4">{i + 1}.</span>
                  <input
                    type="text"
                    placeholder={`@instagram${i + 1}`}
                    value={h}
                    onChange={e => updateHandle(i, e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
              ))}
              <p className="text-xs text-gray-400 text-center">
                Pode pular se preferir adicionar depois
              </p>
            </div>
          )}

          <button
            onClick={() => step < LAST_STEP ? setStep(s => s + 1) : handleFinish()}
            disabled={
              (step === 0 && !form.gender) ||
              (step === 1 && !form.interested_in) ||
              loading
            }
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold text-base mt-6 hover:bg-gray-700 transition-colors disabled:opacity-40"
          >
            {loading ? 'Salvando...' : step < LAST_STEP ? 'Continuar' : 'Começar'}
          </button>
        </div>

      </div>
    </main>
  )
}
