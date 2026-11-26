const RULES = [
  {
    rule: 'Everyone sees the order.',
    how: 'The rotation is public inside the circle. Who has collected, who is collecting now and who is next. No more “I thought it was my turn.”',
  },
  {
    rule: 'Every naira is written down.',
    how: 'Payments, payouts and every change the admin makes go into an activity log the whole group can read, forever.',
  },
  {
    rule: 'Nobody chases anybody.',
    how: 'One tap sends WhatsApp reminders to whoever hasn’t paid, or switch on daily reminders and forget about it.',
  },
  {
    rule: 'Nobody is left out.',
    how: 'Mama doesn’t need a smartphone app. Add her with a name and number, mark her payments, and her history follows her if she joins later.',
  },
  {
    rule: 'Hands are shared fairly.',
    how: 'Members ask for one, two or three hands. The admin approves, places them in the rotation, and everyone can see the result.',
  },
]

const ROMAN = ['I', 'II', 'III', 'IV', 'V']

export default function FairRules() {
  return (
    <section id="features" className="mx-auto grid max-w-6xl border-t border-line scroll-mt-16 gap-10 px-4 py-20 md:px-6 md:py-28 lg:grid-cols-[0.9fr_1.4fr]">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="text-xs font-semibold tracking-[0.22em] text-kola-text uppercase">Why it works</p>
        <h2 className="serif mt-4 text-4xl md:text-6xl">Five rules every fair ajo keeps.</h2>
        <p className="mt-5 max-w-sm text-muted">Every ajo that ends in a quarrel broke one of these. SplitAm keeps them for you.</p>
      </div>
      <ol className="divide-y divide-line border-y border-line">
        {RULES.map((r, i) => (
          <li key={r.rule} className="grid grid-cols-[56px_1fr] gap-4 py-8 md:grid-cols-[80px_1fr]">
            <span className="serif text-3xl text-kola-text md:text-4xl">{ROMAN[i]}</span>
            <div>
              <h3 className="serif text-2xl md:text-3xl">{r.rule}</h3>
              <p className="mt-2 max-w-xl leading-relaxed text-muted">{r.how}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
