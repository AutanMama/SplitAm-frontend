import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Button from '../ui/Button'
import Logo from '../ui/Logo'

export default function LandingFooter() {
  return (
    <>
      <section className="px-4 pb-20 md:px-6">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-forest px-6 py-14 text-center text-on-forest md:py-20">
          <div className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full border-[36px] border-lime/10" aria-hidden />
          <div className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full border-[28px] border-lime/10" aria-hidden />
          <h2 className="relative text-3xl font-bold md:text-5xl">Start your next ajo the right way.</h2>
          <p className="relative mx-auto mt-4 max-w-md text-forest-muted">Set it up in five minutes. Your members will thank you in December.</p>
          <div className="relative mt-8 flex justify-center">
            <Button as={Link} to="/register" variant="lime" size="lg">
              Create your free account <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <Logo />
            <p className="mt-2 text-sm text-muted">Ajo, esusu and adashi, kept honest.</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted" aria-label="Footer">
            <a href="#how-it-works" className="hover:text-ink">How it works</a>
            <a href="#features" className="hover:text-ink">Features</a>
            <a href="#faq" className="hover:text-ink">FAQ</a>
            <Link to="/login" className="hover:text-ink">Sign in</Link>
          </nav>
          <p className="text-sm text-muted">© {new Date().getFullYear()} SplitAm · Made in Nigeria</p>
        </div>
      </footer>
    </>
  )
}
