import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf6f0] dark:bg-gray-950 overflow-x-hidden">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 bg-[#faf6f0]/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-amber-100 dark:border-gray-800">
        <span className="font-caveat text-2xl text-gray-800 dark:text-gray-100">Date Record</span>
        <Link
          href="/login"
          className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          Entrar
        </Link>
      </header>

      {/* Hero */}
      <section className="px-6 pt-14 pb-6 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-500 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 tracking-wide">
          💘 Seu diário afetivo inteligente
        </div>

        <h1 className="font-caveat text-5xl md:text-6xl text-gray-900 dark:text-gray-100 leading-tight mb-5 max-w-sm">
          Organize seus dates,<br />descubra sua<br />melhor conexão.
        </h1>

        <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-[280px] mb-14">
          Responda 5 perguntas simples sobre cada encontro e veja quem você realmente quer ver de novo.
        </p>

        {/* Fake polaroids — sem pessoas reais */}
        <div className="relative w-full max-w-[320px] h-64 mb-16">
          {/* Card esquerda */}
          <div className="absolute left-0 bottom-0 bg-white dark:bg-gray-800 shadow-xl p-2 pb-7 w-[120px] -rotate-[7deg]">
            <div className="w-full aspect-square bg-gradient-to-br from-rose-200 to-pink-300 dark:from-rose-700 dark:to-pink-800" />
            <p className="font-caveat text-sm mt-1.5 text-gray-700 dark:text-gray-300 truncate">Gabi</p>
            <p className="text-xs font-bold text-amber-500">★ 4.8</p>
          </div>

          {/* Card centro — destaque */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 z-10 bg-white dark:bg-gray-800 shadow-2xl p-2 pb-8 w-[148px] rotate-[1deg]">
            <div className="w-full aspect-square bg-gradient-to-br from-purple-200 to-violet-300 dark:from-purple-700 dark:to-violet-800" />
            <p className="font-caveat text-base mt-1.5 text-gray-700 dark:text-gray-300 truncate">Luna</p>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-xs font-bold text-sky-500">★ 3.6</p>
              <span className="text-[10px] bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-semibold">✨ Match</span>
            </div>
          </div>

          {/* Card direita */}
          <div className="absolute right-0 bottom-0 bg-white dark:bg-gray-800 shadow-xl p-2 pb-7 w-[120px] rotate-[6deg]">
            <div className="w-full aspect-square bg-gradient-to-br from-sky-200 to-blue-300 dark:from-sky-700 dark:to-blue-800" />
            <p className="font-caveat text-sm mt-1.5 text-gray-700 dark:text-gray-300 truncate">Felipe</p>
            <p className="text-xs font-bold text-sky-500">★ 3.2</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/signup"
            className="flex items-center justify-center w-full py-4 px-6 rounded-2xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold text-base shadow-lg hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] transition-all"
          >
            Criar conta grátis
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center w-full py-3 px-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-base hover:scale-[1.02] hover:border-gray-300 dark:hover:border-gray-600 active:scale-[0.98] transition-all"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Divisor */}
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="border-t border-gray-200 dark:border-gray-800" />
      </div>

      {/* Como funciona */}
      <section className="px-6 pb-14">
        <div className="max-w-md mx-auto">
          <p className="font-caveat text-3xl text-center text-gray-800 dark:text-gray-100 mb-8">
            Como funciona
          </p>

          <div className="flex flex-col gap-4">
            {[
              {
                icon: '➕',
                step: '01',
                title: 'Adicione quem você saiu',
                desc: 'Salve o @ do Instagram. A foto e o nome carregam automaticamente.',
                bg: 'bg-rose-50 dark:bg-rose-950/30',
                border: 'border-rose-100 dark:border-rose-900/50',
              },
              {
                icon: '⭐',
                step: '02',
                title: 'Avalie o encontro',
                desc: 'Cinco perguntas rápidas: conversa, aparência, química, valores e diversão.',
                bg: 'bg-amber-50 dark:bg-amber-950/30',
                border: 'border-amber-100 dark:border-amber-900/50',
              },
              {
                icon: '💘',
                step: '03',
                title: 'Descubra a melhor conexão',
                desc: 'O app compara suas notas e mostra quem tem mais afinidade — e avisa quando for mútuo.',
                bg: 'bg-purple-50 dark:bg-purple-950/30',
                border: 'border-purple-100 dark:border-purple-900/50',
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`flex items-start gap-4 p-5 rounded-2xl border ${item.bg} ${item.border}`}
              >
                <span className="text-3xl leading-none shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 tracking-widest mb-1">
                    PASSO {item.step}
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{item.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bloco de pontuação — mini preview */}
      <section className="px-6 pb-14">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-6">
          <p className="font-caveat text-2xl text-gray-800 dark:text-gray-100 mb-1">
            Um score para cada critério
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
            Veja onde cada pessoa brilha de verdade.
          </p>

          <div className="flex flex-col gap-3">
            {[
              { label: '💬 Conversa',  value: 5, width: 'w-full' },
              { label: '✨ Aparência', value: 4, width: 'w-4/5' },
              { label: '🔥 Química',   value: 4, width: 'w-4/5' },
              { label: '🤝 Valores',   value: 3, width: 'w-3/5' },
              { label: '😄 Diversão',  value: 5, width: 'w-full' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 w-32 shrink-0">{item.label}</p>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full ${item.width} bg-gradient-to-r from-rose-400 to-amber-400 rounded-full transition-all`} />
                </div>
                <p className="text-xs font-bold text-amber-500 w-4 text-right">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Média geral</p>
              <p className="font-caveat text-3xl text-amber-500">4.2</p>
            </div>
            <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full font-semibold">
              ✨ Match!
            </span>
          </div>
        </div>
      </section>

      {/* Privacidade */}
      <section className="px-6 pb-14">
        <div className="max-w-md mx-auto bg-gray-900 dark:bg-gray-800 rounded-3xl p-8 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="font-caveat text-3xl text-white mb-3">Seus dados são seus.</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Suas avaliações são completamente privadas. Ninguém vê o que você escreveu —
            nem a pessoa avaliada. O único momento em que algo é compartilhado é quando há
            um <strong className="text-white">match mútuo</strong>.
          </p>
          <div className="flex flex-col gap-2.5 text-left">
            {[
              'Sem anúncios, sem venda de dados',
              'Só você acessa seu histórico',
              'Match só com consentimento de ambos os lados',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="text-emerald-400 text-sm font-bold shrink-0">✓</span>
                <p className="text-xs text-gray-400">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 pb-20 text-center">
        <div className="max-w-xs mx-auto">
          <p className="font-caveat text-4xl text-gray-800 dark:text-gray-100 mb-2">
            Pronto pra começar?
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-8">
            Gratuito. Leva menos de 2 minutos.
          </p>
          <Link
            href="/signup"
            className="flex items-center justify-center w-full py-4 px-6 rounded-2xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold text-base shadow-lg hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] transition-all"
          >
            Criar conta grátis →
          </Link>
          <Link
            href="/login"
            className="block mt-3 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Já tenho conta — entrar
          </Link>
        </div>
      </section>

    </main>
  )
}
