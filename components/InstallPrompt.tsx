'use client'

import { useEffect, useState } from 'react'

type Platform = 'ios' | 'android' | null

function detectPlatform(): Platform {
  if (typeof window === 'undefined') return null
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return null
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as any).standalone === true)
  )
}

export default function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [platform, setPlatform] = useState<Platform>(null)

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa_prompt_dismissed')
    const p = detectPlatform()
    if (!dismissed && p && !isStandalone()) {
      setPlatform(p)
      // Pequeno delay para não aparecer imediatamente ao abrir
      const t = setTimeout(() => setShow(true), 2500)
      return () => clearTimeout(t)
    }
  }, [])

  function dismiss() {
    localStorage.setItem('pwa_prompt_dismissed', '1')
    setShow(false)
  }

  if (!show || !platform) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gray-900 dark:bg-gray-800 text-white rounded-3xl p-5 shadow-2xl max-w-sm mx-auto">

        {/* Ícone + título */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center text-2xl shrink-0">
            💘
          </div>
          <div>
            <p className="font-semibold text-sm">Adicione à tela inicial</p>
            <p className="text-gray-400 text-xs mt-0.5">
              Acesse o app direto, sem abrir o navegador.
            </p>
          </div>
        </div>

        {/* Instruções por plataforma */}
        {platform === 'ios' && (
          <div className="bg-gray-800 dark:bg-gray-700 rounded-2xl p-4 mb-4 flex flex-col gap-2">
            <Step n={1} text={<>Toque em <strong>Compartilhar</strong> <span className="text-base">⎙</span> no Safari</>} />
            <Step n={2} text={<>Role e toque em <strong>"Adicionar à Tela de Início"</strong></>} />
            <Step n={3} text={<>Confirme tocando em <strong>Adicionar</strong></>} />
          </div>
        )}

        {platform === 'android' && (
          <div className="bg-gray-800 dark:bg-gray-700 rounded-2xl p-4 mb-4 flex flex-col gap-2">
            <Step n={1} text={<>Toque no menu <strong>⋮</strong> do Chrome</>} />
            <Step n={2} text={<>Toque em <strong>"Adicionar à tela inicial"</strong></>} />
            <Step n={3} text={<>Confirme tocando em <strong>Adicionar</strong></>} />
          </div>
        )}

        <button
          onClick={dismiss}
          className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
        >
          Entendi, obrigado!
        </button>
      </div>
    </div>
  )
}

function Step({ n, text }: { n: number; text: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="w-5 h-5 rounded-full bg-white/20 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        {n}
      </span>
      <p className="text-xs text-gray-300 leading-relaxed">{text}</p>
    </div>
  )
}
