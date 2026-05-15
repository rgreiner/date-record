'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-[#faf6f0] dark:bg-gray-950 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="font-caveat text-3xl text-gray-800 mb-2">E-mail enviado!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Verifique sua caixa de entrada e clique no link para redefinir sua senha.
          </p>
          <Link href="/login" className="text-gray-800 font-medium underline text-sm">
            Voltar para o login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#faf6f0] dark:bg-gray-950 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-caveat text-5xl text-gray-800 mb-1">Melhores Encontros</h1>
          <p className="text-gray-500">Recuperar senha</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            Digite seu e-mail e enviaremos um link para redefinir sua senha.
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold text-base hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          <Link href="/login" className="text-gray-800 font-medium underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </main>
  )
}
