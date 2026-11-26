import AdirePattern from '../brand/AdirePattern'

const MOMENTS = [
  { day: 'Day 1', title: 'The round opens', body: 'Six hands, ₦50,000 each. Everyone can see that Aisha collects this time.' },
  { day: 'Day 2', title: 'Payments come in', body: 'Ngozi transfers and taps “I’ve paid”. The book updates on every phone in the circle.' },
  { day: 'Day 5', title: 'Reminders, not drama', body: 'Two people haven’t paid. They get a polite WhatsApp nudge. Nobody has to make the awkward call.' },
  { day: 'Day 7', title: 'The pot goes out', body: '₦300,000 is complete. The admin sends it to Aisha, marks it sent, and round two begins.' },
]

export default function RoundStory() {
  return (
    <section id="how-it-works" className="relative scroll-mt-16 overflow-hidden bg-surface text-ink">
      <AdirePattern motif="lattice" size={56} className="absolute inset-0 size-full text-indigo/[0.04]" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-end">
          <h2 className="serif text-4xl md:text-6xl">A round in the life of an ajo.</h2>
          <p className="max-w-lg text-lg text-muted lg:justify-self-end">The same ajo your mother ran with her market women, only now the notebook lives on everyone’s phone.</p>
        </div>

        <ol className="mt-14 grid border-t border-line md:grid-cols-4">
          {MOMENTS.map((m, i) => (
            <li key={m.day} className={`py-8 md:px-6 md:py-10 ${i > 0 ? 'border-t border-line md:border-t-0 md:border-l' : ''} md:first:pl-0`}>
              <p className="serif text-6xl text-kola-text">{m.day.split(' ')[1]}</p>
              <p className="mt-1 text-xs font-semibold tracking-[0.2em] text-muted uppercase">{m.day}</p>
              <h3 className="mt-6 text-xl font-semibold">{m.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{m.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
