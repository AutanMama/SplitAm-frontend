const STEPS = [
  { title: 'Create a group', body: 'Name it, then share the invite code in your WhatsApp group. You approve who gets in.' },
  { title: 'Add your people', body: 'Add members by email, or just a name and phone number. They don’t need an account to be tracked.' },
  { title: 'Set hands and order', body: 'Choose the amount per hand and how often. Members request hands, and you arrange who collects when.' },
  { title: 'Pay, collect, repeat', body: 'Mark payments as they come in, send the pot to whoever’s turn it is, and let reminders chase the rest.' },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <p className="text-sm font-semibold text-paid">How it works</p>
        <h2 className="mt-2 max-w-xl text-3xl font-bold md:text-4xl">The same ajo you already run, minus the notebook.</h2>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative">
              <span className="money grid size-10 place-items-center rounded-full bg-forest font-bold text-on-forest">{i + 1}</span>
              {i < STEPS.length - 1 && <span className="absolute top-5 left-12 hidden h-px w-[calc(100%-3rem)] bg-line lg:block" aria-hidden />}
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-1.5 text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
