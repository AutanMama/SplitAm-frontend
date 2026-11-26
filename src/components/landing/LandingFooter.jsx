import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Button from '../ui/Button'
import Logo from '../ui/Logo'
import AdirePattern, { AdireStrip } from '../brand/AdirePattern'

export default function LandingFooter() {
  return (
    <>
      <section className="relative overflow-hidden bg-indigo text-on-indigo">
        <AdirePattern motif="oniko" size={64} className="absolute inset-0 size-full text-indigo-muted/[0.12]" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 py-20 md:flex-row md:items-end md:justify-between md:px-6 md:py-24">
          <h2 className="serif max-w-2xl text-4xl md:text-6xl">Start your next circle the right way.</h2>
          <Button as={Link} to="/register" variant="kola" size="lg" className="shrink-0">
            Create a free account <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      </section>
      <AdireStrip />

      <footer className="bg-bg">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <Logo />
            <p className="mt-2 text-sm text-muted">Ajo, esusu and adashi, kept honest.</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted" aria-label="Footer">
            <a href="#how-it-works" className="hover:text-ink">
              How it works
            </a>
            <a href="#features" className="hover:text-ink">
              Why it works
            </a>
            <a href="#faq" className="hover:text-ink">
              Questions
            </a>
            <Link to="/login" className="hover:text-ink">
              Sign in
            </Link>
          </nav>
          <p className="text-sm text-muted">© {new Date().getFullYear()} SplitAm · Made in Nigeria</p>
        </div>
      </footer>
    </>
  )
}
