import { Plus } from 'lucide-react'

const QUESTIONS = [
  {
    q: 'What is an ajo?',
    a: 'A savings circle. Everyone puts in the same amount every round, and each round one person collects the whole pot, until everyone has had a turn. It’s also called esusu, adashi or a contribution.',
  },
  {
    q: 'Does SplitAm hold our money?',
    a: 'No. You keep paying each other the way you already do: transfer, cash or POS. SplitAm keeps the book: who paid, who collected and whose turn is next.',
  },
  {
    q: 'Do all my members need the app?',
    a: 'No. Add anyone with just a name and phone number. They get WhatsApp invites and reminders, and you can mark their payments for them.',
  },
  {
    q: 'What happens when someone doesn’t pay?',
    a: 'Everyone in the circle can see who hasn’t paid for the round. The admin can send WhatsApp reminders in one tap, or turn on daily automatic reminders.',
  },
  {
    q: 'What if my network is bad?',
    a: 'Changes are saved on your phone and synced as soon as you’re back online.',
  },
  {
    q: 'How much does it cost?',
    a: 'Nothing. SplitAm is free for every circle and every member.',
  },
]

export default function Faq() {
  return (
    <section id="faq" className="scroll-mt-16 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:px-6 md:py-28 lg:grid-cols-[0.9fr_1.4fr]">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-kola-text uppercase">Questions</p>
          <h2 className="serif mt-4 text-4xl md:text-6xl">What people ask before they start.</h2>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {QUESTIONS.map(({ q, a }) => (
            <details key={q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {q}
                <Plus className="size-5 shrink-0 text-kola-text transition-transform duration-300 group-open:rotate-45" aria-hidden />
              </summary>
              <p className="-mt-2 max-w-xl pb-6 leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
