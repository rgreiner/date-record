import Link from 'next/link'

export default function AddCard({ rotation = 2 }: { rotation?: number }) {
  return (
    <Link href="/add">
      <div
        className="bg-white shadow-xl p-3 pb-8 w-44 cursor-pointer hover:scale-105 transition-transform duration-200 hover:shadow-2xl group"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="w-full aspect-square bg-gray-50 group-hover:bg-gray-100 transition-colors flex flex-col items-center justify-center gap-2 mb-3">
          <span className="text-4xl text-gray-300 group-hover:text-gray-400 transition-colors leading-none">+</span>
          <span className="text-xs text-gray-300 group-hover:text-gray-400 transition-colors">adicionar</span>
        </div>
        <p className="font-caveat text-xl text-gray-300 group-hover:text-gray-400 transition-colors">nova pessoa</p>
        <p className="text-xs text-gray-200">@instagram</p>
      </div>
    </Link>
  )
}
