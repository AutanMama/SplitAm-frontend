import { BellRing, CloudOff, History, Layers, ListOrdered, Share2, UserPlus } from 'lucide-react'

const FEATURES = [
  { icon: ListOrdered, title: 'A rotation everyone can see', body: 'Who has collected, who collects now and who’s next. No more “I thought it was my turn”.' },
  { icon: Layers, title: 'More than one hand', body: 'Members can take two or three hands. They pay for each one and collect once per hand.' },
  { icon: UserPlus, title: 'Members without the app', body: 'Add Mama Chioma with just her name and number. When she signs up later, her history follows her.' },
  { icon: BellRing, title: 'WhatsApp reminders', body: 'Remind everyone who hasn’t paid in one tap, or switch on daily reminders and forget about it.' },
  { icon: History, title: 'A record nobody can argue with', body: 'Every payment, payout and change is written to an activity log the whole group can read.' },
  { icon: Share2, title: 'Round updates for your group chat', body: 'Generate a clean “who has paid” summary and send it straight to your WhatsApp group.' },
  { icon: CloudOff, title: 'Keeps working offline', body: 'Bad network? Changes are saved on your phone and synced when you’re back online.' },
]

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 md:px-6">
      <p className="text-sm font-semibold text-paid">Features</p>
      <h2 className="mt-2 max-w-xl text-3xl font-bold md:text-4xl">Built for how ajo actually works in Nigeria.</h2>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }, i) => (
          <article key={title} className={`rounded-card border border-line bg-surface p-6 shadow-card ${i === 0 ? 'sm:col-span-2 lg:col-span-1 lg:row-span-2 lg:bg-forest lg:text-on-forest' : ''}`}>
            <span className={`grid size-11 place-items-center rounded-xl ${i === 0 ? 'bg-lime text-on-lime' : 'bg-sunk text-forest'}`}>
              <Icon className="size-5" aria-hidden />
            </span>
            <h3 className={`mt-5 text-lg font-bold ${i === 0 ? 'lg:text-2xl' : ''}`}>{title}</h3>
            <p className={`mt-1.5 ${i === 0 ? 'text-muted lg:text-forest-muted' : 'text-muted'}`}>{body}</p>
            {i === 0 && (
              <ol className="mt-8 hidden space-y-2 lg:block" aria-hidden>
                {['Aisha · collected', 'You · collecting now', 'Musa · next', 'Ngozi · round 4'].map((row, n) => (
                  <li key={row} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${n === 1 ? 'bg-lime font-semibold text-on-lime' : 'bg-white/10'}`}>
                    <span className="money w-4 text-center opacity-70">{n + 1}</span>
                    {row}
                  </li>
                ))}
              </ol>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
