import { ChevronDown } from 'lucide-react'

const QUESTIONS = [
  {
    q: 'What is an ajo?',
    a: 'A savings group. Everyone puts in the same amount every round, and each round one person collects the whole pot. It runs until everyone has had their turn. It’s also called esusu, adashi or a contribution.',
  },
  {
    q: 'Does SplitAm hold our money?',
    a: 'No. You keep paying each other the way you already do: transfer, cash or POS. SplitAm keeps the record: who paid, who collected and whose turn is next.',
  },
  {
    q: 'Do all my members need to download anything?',
    a: 'No. You can add someone with just their name and phone number. They’ll get WhatsApp invites and reminders, and you can mark their payments for them.',
  },
  {
    q: 'What happens when someone doesn’t pay?',
    a: 'Everyone in the group can see who hasn’t paid for the round. The admin can send WhatsApp reminders in one tap or turn on daily automatic reminders.',
  },
  {
    q: 'How much does it cost?',
    a: 'Nothing. SplitAm is free for groups and members.',
  },
]

export default function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-20 md:px-6">
      <p className="text-sm font-semibold text-paid">FAQ</p>
      <h2 className="mt-2 text-3xl font-bold md:text-4xl">Questions people ask</h2>
      <div className="mt-10 divide-y divide-line border-y border-line">
        {QUESTIONS.map(({ q, a }) => (
          <details key={q} className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
              {q}
              <ChevronDown className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <p className="pb-5 text-muted">{a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
