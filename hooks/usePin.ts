'use client'

const PIN_KEY = 'dr_pin'
const UNLOCKED_KEY = 'dr_unlocked_until'
const SESSION_MINUTES = 30

export function getPin(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(PIN_KEY)
}

export function setPin(pin: string) {
  localStorage.setItem(PIN_KEY, pin)
}

export function removePin() {
  localStorage.removeItem(PIN_KEY)
  localStorage.removeItem(UNLOCKED_KEY)
}

export function isUnlocked(): boolean {
  if (typeof window === 'undefined') return true
  const pin = getPin()
  if (!pin) return true
  const until = localStorage.getItem(UNLOCKED_KEY)
  if (!until) return false
  return Date.now() < parseInt(until)
}

export function unlock() {
  const expiry = Date.now() + SESSION_MINUTES * 60 * 1000
  localStorage.setItem(UNLOCKED_KEY, String(expiry))
}

export function lock() {
  localStorage.removeItem(UNLOCKED_KEY)
}
