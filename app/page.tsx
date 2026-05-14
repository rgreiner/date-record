import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf6f0] flex flex-col items-center justify-center p-8 overflow-hidden">

      {/* Polaroids decorativos ao fundo */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-20">
        <div className="absolute top-16 left-8 bg-white shadow-lg p-2 pb-6 w-28 rotate-[-8deg]">
          <div className="w-full aspect-square bg-rose-200" />
          <p className="font-caveat text-sm mt-1 text-gray-500">Ana</p>
        </div>
        <div className="absolute top-24 right-10 bg-white shadow-lg p-2 pb-6 w-28 rotate-[6deg]">
          <div className="w-full aspect-square bg-purple-200" />
          <p className="font-caveat text-sm mt-1 text-gray-500">Julia</p>
        </div>
        <div className="absolute bottom-20 left-16 bg-white shadow-lg p-2 pb-6 w-28 rotate-[4deg]">
          <div className="w-full aspect-square bg-amber-200" />
          <p className="font-caveat text-sm mt-1 text-gray-500">Carol</p>
        </div>
        <div className="absolute bottom-16 right-20 bg-white shadow-lg p-2 pb-6 w-28 rotate-[-5deg]">
          <div className="w-full aspect-square bg-pink-200" />
          <p className="font-caveat text-sm mt-1 text-gray-500">Mariana</p>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 text-center max-w-sm w-full">
        <div className="mb-10">
          <h1 className="font-caveat text-6xl text-gray-800 mb-2">Date Record</h1>
          <p className="text-gray-500 text-base leading-relaxed">
            Guarde suas memórias afetivas,<br />descubra sua melhor conexão.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/signup"
            className="flex items-center justify-center w-full py-4 px-6 rounded-2xl bg-gray-900 text-white font-semibold text-lg shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
          >
            Criar conta
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center w-full py-4 px-6 rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold text-lg transition-all hover:scale-[1.02] hover:border-gray-300 active:scale-[0.98]"
          >
            Já tenho conta
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-400 leading-relaxed">
          Suas avaliações são privadas.<br />
          Só você vê — exceto quando houver um match.
        </p>
      </div>
    </main>
  )
}
