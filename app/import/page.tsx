'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type ImportContact = {
  id: string
  name: string
  selected: boolean
}

function supportsContactPicker() {
  return typeof navigator !== 'undefined' && 'contacts' in navigator
}

export default function ImportPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [tab, setTab] = useState<'phone' | 'manual'>('phone')
  const [contacts, setContacts] = useState<ImportContact[]>([])
  const [manualName, setManualName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // ── Agenda do telefone ──────────────────────────────
  async function handlePickContacts() {
    setError('')
    if (!supportsContactPicker()) {
      setError('Seu navegador não suporta acesso à agenda. Use o Chrome no Android ou tente a busca manual.')
      return
    }
    try {
      const selected = await (navigator as any).contacts.select(['name'], { multiple: true })
      const imported: ImportContact[] = selected
        .filter((c: any) => c.name?.length > 0)
        .map((c: any, i: number) => ({
          id: `phone-${i}`,
          name: c.name[0],
          selected: true,
        }))
      setContacts(prev => {
        const existing = new Set(prev.map(p => p.name.toLowerCase()))
        return [...prev, ...imported.filter(c => !existing.has(c.name.toLowerCase()))]
      })
    } catch {
      setError('Acesso à agenda cancelado.')
    }
  }

  // ── Busca manual ────────────────────────────────────
  function handleAddManual() {
    const name = manualName.trim()
    if (!name) return
    const duplicate = contacts.some(c => c.name.toLowerCase() === name.toLowerCase())
    if (duplicate) { setManualName(''); return }
    setContacts(prev => [...prev, { id: `manual-${Date.now()}`, name, selected: true }])
    setManualName('')
    inputRef.current?.focus()
  }

  function toggleContact(id: string) {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c))
  }

  function removeContact(id: string) {
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  // ── Salvar ───────────────────────────────────────────
  async function handleSave() {
    const toSave = contacts.filter(c => c.selected)
    if (toSave.length === 0) return
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    await supabase.from('dates').insert(
      toSave.map(c => ({
        user_id: user.id,
        name: c.name,
        instagram_handle: '',
        status: 'interested',
      }))
    )

    router.push('/dashboard')
  }

  const selectedCount = contacts.filter(c => c.selected).length

  return (
    <main className="min-h-screen bg-[#faf6f0] pb-12">
      <div className="max-w-sm mx-auto px-6 pt-8 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
          <h1 className="font-caveat text-3xl text-gray-800">Importar contatos</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm">
          {([
            { key: 'phone',  label: '📱 Da agenda' },
            { key: 'manual', label: '🔍 Busca manual' },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Conteúdo da tab */}
        {tab === 'phone' ? (
          <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-4">
            <div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Selecione pessoas da sua agenda para adicionar ao Date Record.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Funciona no Chrome para Android. No iPhone use a busca manual.
              </p>
            </div>

            <button
              onClick={handlePickContacts}
              className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-600 text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              📖 Abrir agenda do telefone
            </button>

            {error && <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2">{error}</p>}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              Digite o nome de quem você quer adicionar.
            </p>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Nome da pessoa"
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddManual()}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-gray-400 transition-colors"
                autoFocus
              />
              <button
                onClick={handleAddManual}
                disabled={!manualName.trim()}
                className="px-4 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-700 transition-colors disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Lista de contatos selecionados */}
        {contacts.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-caveat text-xl text-gray-800">Para importar</h2>
              <button
                onClick={() => setContacts([])}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Limpar tudo
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {contacts.map(c => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                >
                  <button
                    onClick={() => toggleContact(c.id)}
                    className={`w-5 h-5 rounded-full border-2 shrink-0 transition-colors ${
                      c.selected
                        ? 'bg-gray-900 border-gray-900'
                        : 'border-gray-300'
                    }`}
                  >
                    {c.selected && (
                      <span className="flex items-center justify-center text-white text-xs">✓</span>
                    )}
                  </button>
                  <span className="flex-1 text-sm text-gray-800">{c.name}</span>
                  <button
                    onClick={() => removeContact(c.id)}
                    className="text-gray-300 hover:text-gray-500 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botão de importar */}
        {selectedCount > 0 && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-2xl bg-gray-900 text-white font-semibold text-base hover:bg-gray-700 transition-colors disabled:opacity-40 shadow-lg"
          >
            {saving
              ? 'Importando...'
              : `Importar ${selectedCount} ${selectedCount === 1 ? 'pessoa' : 'pessoas'}`}
          </button>
        )}

      </div>
    </main>
  )
}
