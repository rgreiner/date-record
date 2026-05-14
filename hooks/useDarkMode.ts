'use client'

import { useEffect, useState } from 'react'

export function useDarkMode() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('dr_dark')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const enabled = stored !== null ? stored === 'true' : prefersDark
    setDark(enabled)
    document.documentElement.classList.toggle('dark', enabled)
  }, [])

  function toggle() {
    setDark(prev => {
      const next = !prev
      localStorage.setItem('dr_dark', String(next))
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }

  return { dark, toggle }
}
