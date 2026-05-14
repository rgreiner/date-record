'use client'

import { useEffect, useState } from 'react'

type ToastProps = {
  message: string
  emoji?: string
  onClose: () => void
  duration?: number
}

export function Toast({ message, emoji = '💘', onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration])

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 max-w-xs">
        <span className="text-xl">{emoji}</span>
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-200 dark:hover:text-gray-600 ml-1">×</button>
      </div>
    </div>
  )
}
