import Link from 'next/link'

type Status =
  | 'dated' | 'interested' | 'not_interested' | 'matched' | 'together'
  | 'one_night' | 'marry' | 'surdina' | 'orbit' | 'ghosted_them' | 'ghosted_me' | 'fwb'

type PolaroidCardProps = {
  name: string
  handle: string
  photoUrl: string
  score?: number
  status: Status
  rotation?: number
  href?: string
}

const statusConfig: Record<Status, { label: string; color: string }> = {
  interested:     { label: 'Tenho interesse',  color: 'bg-rose-100 text-rose-700' },
  dated:          { label: 'Já saímos',        color: 'bg-purple-100 text-purple-700' },
  not_interested: { label: 'Sem interesse',    color: 'bg-gray-100 text-gray-500' },
  matched:        { label: '✨ Match!',         color: 'bg-amber-100 text-amber-700' },
  together:       { label: '❤️ Juntos',        color: 'bg-red-100 text-red-600' },
  one_night:      { label: '🌙 Só uma noite',  color: 'bg-orange-100 text-orange-600' },
  marry:          { label: '💍 É pra casar',   color: 'bg-yellow-100 text-yellow-700' },
  surdina:        { label: '🤫 Sigo na surdina', color: 'bg-indigo-100 text-indigo-600' },
  orbit:          { label: '🛸 Em órbita',     color: 'bg-blue-100 text-blue-600' },
  ghosted_them:   { label: '🫣 Ghostei',       color: 'bg-zinc-100 text-zinc-500' },
  ghosted_me:     { label: '👻 Me ghostaram',  color: 'bg-zinc-100 text-zinc-400' },
  fwb:            { label: '😏 AMB',           color: 'bg-teal-100 text-teal-600' },
}

function ratingTextColor(rating: number): string {
  if (rating >= 4) return 'text-amber-500'
  if (rating >= 2.5) return 'text-sky-500'
  return 'text-gray-400'
}

export default function PolaroidCard({
  name,
  handle,
  photoUrl,
  score,
  status,
  rotation = 0,
  href,
}: PolaroidCardProps) {
  const { label, color } = statusConfig[status]

  const inner = (
    <div
      className="bg-white shadow-xl p-3 pb-8 w-full cursor-pointer hover:scale-105 transition-transform duration-200 hover:shadow-2xl hover:z-10 relative"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="w-full aspect-square bg-gray-100 overflow-hidden mb-3">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-caveat text-5xl text-gray-300">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <p className="font-caveat text-xl text-gray-800 truncate">{name}</p>
      <p className="text-xs text-gray-400 truncate mb-2">@{handle}</p>

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
          {label}
        </span>
        {score !== undefined && (
          <span className={`text-xs font-medium ${ratingTextColor(score)}`}>{score}/5</span>
        )}
      </div>
    </div>
  )

  if (href) return <Link href={href}>{inner}</Link>
  return inner
}
