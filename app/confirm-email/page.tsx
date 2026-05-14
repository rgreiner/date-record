'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function ConfirmEmail() {
  const [resent, setResent] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleResend(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    await supabase.auth.resend({ type: 'signup', email })

    setResent(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#faf6f0] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">

        {/* Card principal */}
        <div className="bg-white rounded-3xl shadow-sm p-8 text-center">

          {/* Ícone polaroid animado */}
          <div className="inline-block bg-white shadow-lg p-2 pb-6 w-24 rotate-[-3deg] mb-6">
            <div className="w-full aspect-square bg-rose-100 flex items-center justify-center text-3xl">
              📬
            </div>
            <p className="font-caveat text-sm text-gray-400 mt-1">e-mail</p>
          </div>

          <h2 className="font-caveat text-3xl text-gray-800 mb-2">
            Confirme seu e-mail
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Enviamos um link de confirmação para o seu e-mail.
            Clique nele para ativar sua conta e começar a usar o Date Record.
          </p>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700 text-left mb-6">
            <p className="font-medium mb-1">Não recebeu?</p>
            <p>Verifique a pasta de spam ou reenvie o e-mail abaixo.</p>
          </div>

          {!resent ? (
            <form onSubmit={handleResend} className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="Digite seu e-mail para reenviar"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm outline-none focus:border-gray-400 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium text-sm hover:border-gray-300 transition-colors disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Reenviar e-mail de confirmação'}
              </button>
            </form>
          ) : (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-sm text-green-700">
              E-mail reenviado! Verifique sua caixa de entrada.
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          Já confirmou?{' '}
          <Link href="/login" className="text-gray-700 font-medium underline">
            Fazer login
          </Link>
        </p>

      </div>
    </main>
  )
}
