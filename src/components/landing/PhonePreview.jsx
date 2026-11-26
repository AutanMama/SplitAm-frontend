import { BellRing, Check } from 'lucide-react'
import Avatar from '../ui/Avatar'
import ProgressRing from '../ui/ProgressRing'

const ROTATION = [
  { name: 'Aisha Bello', state: 'collected' },
  { name: 'Zulkiflu Garba', state: 'now', note: 'Collects this round' },
  { name: 'Musa Ibrahim', state: 'next' },
  { name: 'Ngozi Eze', state: 'next' },
]

// A static, scaled-down copy of the ajo screen, used as product imagery.
export default function PhonePreview() {
  return (
    <div className="relative mx-auto w-[300px] sm:w-[320px]" aria-hidden>
      <div className="rounded-[2.6rem] bg-ink p-2.5 shadow-float">
        <div className="overflow-hidden rounded-[2.1rem] bg-bg">
          <div className="flex items-center justify-between px-6 pt-3 pb-2 text-[11px] font-semibold">
            <span>9:41</span>
            <span className="h-5 w-20 rounded-full bg-ink" />
            <span>100%</span>
          </div>

          <div className="space-y-3 px-3.5 pb-5">
            <div className="rounded-2xl bg-forest p-4 text-on-forest">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] text-forest-muted">Office Adashi</p>
                  <p className="font-bold">December savings</p>
                  <p className="money mt-2 text-2xl font-bold">₦300,000</p>
                  <p className="text-[11px] text-forest-muted">pot this round</p>
                </div>
                <ProgressRing value={2} max={6} size={70} stroke={7}>
                  <span className="text-[10px] leading-tight text-forest-muted">
                    <span className="block text-lg font-bold text-on-forest">2</span>of 6
                  </span>
                </ProgressRing>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
                <div className="h-full w-2/3 rounded-full bg-lime" />
              </div>
              <p className="mt-1.5 text-[11px] text-forest-muted">₦200,000 of ₦300,000 paid in</p>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-3">
              <p className="mb-2 text-[11px] font-semibold text-muted">ROTATION</p>
              <ol className="space-y-2">
                {ROTATION.map((r, i) => (
                  <li key={r.name} className="flex items-center gap-2.5">
                    <span className="w-4 text-center text-[11px] font-semibold text-muted">{i + 1}</span>
                    <Avatar name={r.name} size="sm" tone={r.state === 'collected' ? 'paid' : r.state === 'now' ? 'turn' : 'neutral'} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold">{r.name}</p>
                      {r.note && <p className="text-[11px] text-paid">{r.note}</p>}
                    </div>
                    {r.state === 'collected' && <Check className="size-4 text-paid" />}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-sheet absolute top-[58%] -left-44 hidden w-52 lg:-left-40 items-center gap-2.5 rounded-2xl border border-line bg-surface p-3 shadow-float xl:flex">
        <Avatar name="Ngozi Eze" size="sm" tone="paid" />
        <div className="text-[12px] leading-tight">
          <p className="font-semibold">Ngozi paid ₦50,000</p>
          <p className="text-muted">Round 2 · just now</p>
        </div>
      </div>
      <div className="animate-sheet absolute top-8 -right-44 hidden w-56 lg:-right-40 items-center gap-2.5 rounded-2xl bg-ink p-3 text-white shadow-float xl:flex" style={{ animationDelay: '0.2s' }}>
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-lime text-on-lime">
          <BellRing className="size-4" />
        </span>
        <div className="text-[12px] leading-tight">
          <p className="font-semibold">WhatsApp reminder sent</p>
          <p className="text-white/60">to 2 members who haven’t paid</p>
        </div>
      </div>
    </div>
  )
}
