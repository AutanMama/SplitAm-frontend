import { Link } from 'react-router-dom'
import AdirePattern from '../brand/AdirePattern'
import AdireWheel from '../brand/AdireWheel'
import Logo from '../ui/Logo'

const MEMBERS = ['Aisha', 'Tunde', 'Ngozi', 'Musa', 'Bola', 'Chinedu']

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-indigo-deep text-on-indigo lg:flex lg:flex-col lg:justify-between lg:p-12">
        <AdirePattern motif="lattice" size={56} className="absolute inset-0 size-full text-indigo-muted/[0.07]" />
        <div className="relative">
          <Logo onDark />
        </div>
        <AdireWheel members={MEMBERS} onDark className="relative mx-auto w-full max-w-[400px]" />
        <div className="relative">
          <p className="serif max-w-md text-4xl">“Everybody sees the same book, so nobody argues.”</p>
          <p className="mt-4 text-sm text-indigo-muted">The one rule every ajo needs. SplitAm keeps it for you.</p>
        </div>
      </aside>

      <section className="flex flex-col px-5 py-8 sm:px-10 lg:justify-center lg:px-16">
        <div className="mb-12 lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto w-full max-w-sm">
          <h1 className="serif text-4xl">{title}</h1>
          <p className="mt-3 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-center text-sm text-muted">{footer}</p>
        </div>
        <Link to="/" className="mx-auto mt-10 text-sm text-muted hover:text-ink lg:hidden">
          ← What is SplitAm?
        </Link>
      </section>
    </div>
  )
}
