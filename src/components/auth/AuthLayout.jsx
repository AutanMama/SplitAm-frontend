import { Link } from 'react-router-dom'
import { BellRing, ListOrdered, ShieldCheck } from 'lucide-react'
import RotationArt from './RotationArt'
import { LogoMark } from '../ui/Logo'

const POINTS = [
  { icon: ListOrdered, text: 'Everyone sees the rotation, so nobody argues about whose turn it is.' },
  { icon: ShieldCheck, text: 'Every payment and payout is logged for the whole group to see.' },
  { icon: BellRing, text: 'WhatsApp reminders go out, so you don’t have to chase anyone.' },
]

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-forest p-12 text-on-forest lg:flex">
        <Link to="/login" className="flex items-center gap-2" aria-label="SplitAm">
          <LogoMark className="size-9" />
          <span className="text-xl font-bold">SplitAm</span>
        </Link>
        <div className="flex justify-center py-6">
          <RotationArt />
        </div>
        <div>
          <h2 className="max-w-md text-4xl leading-tight font-bold">Ajo, without the chasing.</h2>
          <ul className="mt-6 space-y-3">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-forest-muted">
                <Icon className="mt-0.5 size-5 shrink-0 text-lime" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="flex flex-col px-5 py-8 sm:px-10 lg:justify-center lg:px-16">
        <Link to="/login" className="mb-10 flex items-center gap-2 lg:hidden" aria-label="SplitAm">
          <LogoMark />
          <span className="text-lg font-bold">SplitAm</span>
        </Link>
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-center text-sm text-muted">{footer}</p>
        </div>
      </section>
    </div>
  )
}
