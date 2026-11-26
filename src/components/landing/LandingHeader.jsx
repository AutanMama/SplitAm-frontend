import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from '../ui/Logo'
import Button from '../ui/Button'

const LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Why it works' },
  { href: '#faq', label: 'Questions' },
]

export default function LandingHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? 'border-b border-line bg-bg/90 text-ink backdrop-blur-md' : 'border-b border-transparent text-on-indigo'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4 md:px-6">
        <Logo onDark={!scrolled && !open} />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Sections">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className={`rounded-lg px-3 py-2 text-sm font-medium ${scrolled ? 'text-muted hover:text-ink' : 'text-indigo-muted hover:text-on-indigo'}`}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Button as={Link} to="/login" variant="ghost" className={scrolled ? '' : '!text-on-indigo hover:!bg-white/10'}>
            Sign in
          </Button>
          <Button as={Link} to="/register" variant={scrolled ? 'primary' : 'kola'}>
            Start a circle
          </Button>
        </div>
        <button
          type="button"
          className="ml-auto grid size-10 place-items-center rounded-lg hover:bg-white/10 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="animate-fade border-t border-line px-4 pt-2 pb-5 md:hidden">
          <nav className="flex flex-col" aria-label="Sections">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="border-b border-line py-3.5 font-medium">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button as={Link} to="/login" variant="secondary">
              Sign in
            </Button>
            <Button as={Link} to="/register">
              Start a circle
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
