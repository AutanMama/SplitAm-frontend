import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Button from '../ui/Button'
import AdirePattern from '../brand/AdirePattern'
import AdireWheel from '../brand/AdireWheel'

const MEMBERS = ['Aisha', 'Tunde', 'Ngozi', 'Musa', 'Bola', 'Chinedu']

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-indigo-deep text-on-indigo">
      <AdirePattern motif="lattice" size={56} className="absolute inset-0 size-full text-indigo-muted/[0.08]" />
      <div className="pointer-events-none absolute -right-40 -bottom-40 size-[36rem] rounded-full bg-kola/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pt-28 pb-16 md:px-6 md:pt-36 lg:grid-cols-[1.05fr_1fr] lg:pb-24">
        <div>
          <p className="rise text-xs font-semibold tracking-[0.22em] text-kola uppercase" style={{ '--d': '0ms' }}>
            Ajo · Esusu · Adashi
          </p>
          <h1 className="serif rise mt-5 text-[3.25rem] sm:text-7xl lg:text-[5.75rem]" style={{ '--d': '80ms' }}>
            Ajo, without
            <br />
            the <span className="relative inline-block">
              wahala.
              <svg viewBox="0 0 200 14" preserveAspectRatio="none" className="draw absolute -bottom-1 left-0 h-3 w-full text-kola md:-bottom-2 md:h-4" aria-hidden>
                <path d="M2 10 C 50 2, 110 2, 198 8" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" pathLength="1" />
              </svg>
            </span>
          </h1>
          <p className="rise mt-8 max-w-md text-lg leading-relaxed text-indigo-muted" style={{ '--d': '180ms' }}>
            Everybody in the circle sees the same book: whose turn it is, who has paid, and where every naira went. Reminders do the chasing, so you don’t have to.
          </p>
          <div className="rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ '--d': '260ms' }}>
            <Button as={Link} to="/register" variant="kola" size="lg">
              Start your circle <ArrowRight className="size-4" aria-hidden />
            </Button>
            <Link to="/login" className="px-2 py-3 text-center font-semibold text-on-indigo underline decoration-white/30 decoration-2 underline-offset-[6px] hover:decoration-kola">
              I already have an account
            </Link>
          </div>
        </div>

        <figure className="rise relative" style={{ '--d': '200ms' }}>
          <AdireWheel members={MEMBERS} onDark className="mx-auto w-full max-w-[480px] drop-shadow-[0_30px_60px_rgba(0,0,0,0.35)]" />
          <figcaption className="mx-auto -mt-2 max-w-xs text-center text-sm text-indigo-muted">Six friends, one pot. Each round, the turn moves round the circle.</figcaption>
        </figure>
      </div>
    </section>
  )
}
