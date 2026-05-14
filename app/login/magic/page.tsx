'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Step = 'email' | 'code'

export default function MagicLogin() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })

    if (error) {
      setError('Não encontramos esse e-mail. Verifique ou crie uma conta.')
      setLoading(false)
      return
    }

    setStep('code')
    setLoading(false)
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

    if (error) {
      setError('Código inválido ou expirado. Tente novamente.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-[#faf6f0] dark:bg-gray-950 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-caveat text-5xl text-gray-800 mb-1">Date Record</h1>
          <p className="text-gray-500">
            {step === 'email' ? 'Entrar com código por e-mail' : 'Digite o código enviado'}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-6">
          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="flex flex-col gap-4">
              <p className="text-sm text-gray-500">
                Vamos enviar um código de 6 dígitos para o seu e-mail.
              </p>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-gray-400 transition-colors"
                />
              </div>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold text-base hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar código'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
              <p className="text-sm text-gray-500">
                Enviamos um código para <strong>{email}</strong>. Verifique sua caixa de entrada.
              </p>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Código de 6 dígitos</label>
                <input
                  type="text"
                  required
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-center text-2xl tracking-widest outline-none focus:border-gray-400 transition-colors font-caveat"
                />
              </div>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold text-base hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Entrar'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('email'); setCode(''); setError('') }}
                className="text-sm text-gray-500 underline text-center"
              >
                Reenviar código
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          <Link href="/login" className="text-gray-800 font-medium underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </main>
  )
}
