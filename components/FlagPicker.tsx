'use client'

const RED_FLAGS = [
  { key: '🚩 Chegou atrasado',     emoji: '🚩', label: 'Chegou atrasado' },
  { key: '🚩 Falou só de si',      emoji: '🚩', label: 'Falou só de si' },
  { key: '🚩 Ficou no celular',    emoji: '🚩', label: 'Ficou no celular' },
  { key: '🚩 Foi grosseiro',       emoji: '🚩', label: 'Foi grosseiro' },
  { key: '🚩 Mentiu sobre algo',   emoji: '🚩', label: 'Mentiu sobre algo' },
  { key: '🚩 Me deu ghost',        emoji: '🚩', label: 'Me deu ghost' },
]

const GREEN_FLAGS = [
  { key: '💚 Me fez rir muito',    emoji: '💚', label: 'Me fez rir muito' },
  { key: '💚 Boa conversa',        emoji: '💚', label: 'Boa conversa' },
  { key: '💚 Muito atencioso',     emoji: '💚', label: 'Muito atencioso' },
  { key: '💚 Pontual',             emoji: '💚', label: 'Pontual' },
  { key: '💚 Muito interessante',  emoji: '💚', label: 'Muito interessante' },
  { key: '💚 Boa energia',         emoji: '💚', label: 'Boa energia' },
]

type Props = {
  selected: string[]
  onChange: (flags: string[]) => void
}

export default function FlagPicker({ selected, onChange }: Props) {
  function toggle(key: string) {
    onChange(
      selected.includes(key)
        ? selected.filter(f => f !== key)
        : [...selected, key]
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2">Red flags</p>
        <div className="flex flex-wrap gap-2">
          {RED_FLAGS.map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => toggle(f.key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selected.includes(f.key)
                  ? 'bg-red-50 border-red-300 text-red-600 font-medium'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {f.emoji} {f.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-green-500 uppercase tracking-wide mb-2">Green flags</p>
        <div className="flex flex-wrap gap-2">
          {GREEN_FLAGS.map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => toggle(f.key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selected.includes(f.key)
                  ? 'bg-green-50 border-green-300 text-green-600 font-medium'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {f.emoji} {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
