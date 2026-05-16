'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function MencionadoPage() {
  const { token } = useParams<{ token: string }>()
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    try {
      const padLen = (4 - token.length % 4) % 4
      const b64 = token.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLen)
      const { h, n } = JSON.parse(decodeURIComponent(atob(b64)))
      setHandle(h ?? '')
      setName(n?.split(' ')[0] ?? '')
      setReady(true)
    } catch {
      setError(true)
    }
  }, [token])

  if (error) {
    return (
      <main className="min-h-screen bg-[#faf6f0] dark:bg-gray-950 flex items-center justify-center p-8 text-center">
        <div>
          <p className="text-4xl mb-4">🔍</p>
          <p className="font-caveat text-2xl text-gray-500">Link inválido</p>
        </div>
      </main>
    )
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-[#faf6f0] dark:bg-gray-950 flex items-center justify-center">
        <p className="font-caveat text-2xl text-gray-400">Carregando...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#faf6f0] dark:bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">

        <p className="font-caveat text-lg text-gray-400">Melhores Encontros</p>

        {/* Card principal */}
        <div className="w-full bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-8 flex flex-col items-center gap-4">
          <span className="text-6xl">👀</span>
          <div>
            <p className="font-caveat text-3xl text-gray-800 dark:text-gray-100">
              {name ? `Ei, ${name}!` : 'Ei!'}
            </p>
            {handle && (
              <p className="text-sm text-gray-400 mt-1">@{handle}</p>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            Seu perfil apareceu no <strong>Melhores Encontros</strong>.<br />
            Alguém que você conhece registrou um encontro contigo por lá.
          </p>

          {/* Polaroid decorativo com ? */}
          <div className="bg-white shadow-xl p-3 pb-8 w-28 -rotate-[2deg] mt-2">
            <div className="w-full aspect-square bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center">
              <span className="text-4xl">❓</span>
            </div>
            <p className="font-caveat text-sm text-gray-500 mt-2 truncate">Quem foi?</p>
          </div>
        </div>

        {/* Garantias */}
        <div className="w-full text-left flex flex-col gap-3">
          {[
            { icon: '🔒', text: 'Seus dados são seus — só você vê o que te diz respeito' },
            { icon: '✨', text: 'Você decide se quer participar ou não' },
            { icon: '💘', text: 'Se houver match mútuo, os dois são notificados' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-lg shrink-0">{item.icon}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="w-full flex flex-col gap-3">
          <Link
            href="/signup"
            className="w-full py-4 rounded-2xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold text-base text-center hover:opacity-90 transition-opacity shadow-lg"
          >
            Criar conta grátis para ver quem →
          </Link>
          <Link
            href="/login"
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Já tenho conta — entrar
          </Link>
        </div>

        <p className="text-xs text-gray-300 dark:text-gray-600 leading-relaxed max-w-xs">
          O Melhores Encontros é um app privado de organização de encontros.
          Nenhuma informação sua é compartilhada sem seu consentimento.
        </p>
      </div>
    </main>
  )
}
