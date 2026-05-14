'use client'

import { useEffect, useState } from 'react'
import { getPin, isUnlocked, unlock } from '@/hooks/usePin'

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState(false)
  const [digits, setDigits] = useState<string[]>([])
  const [error, setError] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (getPin() && !isUnlocked()) setLocked(true)
  }, [])

  function handleDigit(d: string) {
    if (digits.length >= 4) return
    const next = [...digits, d]
    setDigits(next)
    setError(false)

    if (next.length === 4) {
      const entered = next.join('')
      const stored = getPin()
      if (entered === stored) {
        unlock()
        setLocked(false)
      } else {
        setError(true)
        setTimeout(() => setDigits([]), 600)
      }
    }
  }

  function handleBackspace() {
    setDigits(d => d.slice(0, -1))
    setError(false)
  }

  if (!mounted || !locked) return <>{children}</>

  return (
    <main className="min-h-screen bg-[#faf6f0] dark:bg-gray-950 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-xs flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="font-caveat text-5xl text-gray-800 dark:text-gray-100 mb-2">Date Record</h1>
          <p className="text-gray-500 text-sm">Digite seu PIN para entrar</p>
        </div>

        {/* Dots */}
        <div className="flex gap-4">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-150 ${
                digits.length > i
                  ? error ? 'bg-red-400' : 'bg-gray-900 dark:bg-gray-100'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        {error && <p className="text-sm text-red-400 -mt-4">PIN incorreto</p>}

        {/* Teclado */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
            k === '' ? <div key={i} /> :
            <button
              key={k}
              onClick={() => k === '⌫' ? handleBackspace() : handleDigit(k)}
              className="h-16 rounded-2xl bg-white dark:bg-gray-900 shadow-sm font-caveat text-2xl text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-transform"
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
