import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import Button from '../ui/Button'
import PhonePreview from './PhonePreview'

const TRUST = ['Free to use', 'Works on any phone', 'Members don’t need the app']

export default function LandingHero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-10 pb-20 md:px-6 md:pt-16 lg:grid-cols-[1.1fr_1fr] lg:pb-28">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-sm font-medium text-muted">
          <span className="size-2 rounded-full bg-paid" aria-hidden />
          For ajo, esusu and adashi groups
        </p>
        <h1 className="mt-5 text-[2.6rem] leading-[1.05] font-bold md:text-6xl">
          Run your ajo
          <br />
          without the <span className="relative whitespace-nowrap text-forest">wahala.</span>
        </h1>
        <p className="mt-5 max-w-lg text-lg text-muted">
          SplitAm keeps the rotation, payments and payouts in one place the whole group can see. Add people by phone number, even if they’re not on the app, and let
          reminders do the chasing.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button as={Link} to="/register" size="lg">
            Start a group <ArrowRight className="size-4" aria-hidden />
          </Button>
          <Button as={Link} to="/login" size="lg" variant="secondary">
            I have an account
          </Button>
        </div>
        <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
          {TRUST.map((t) => (
            <li key={t} className="flex items-center gap-1.5">
              <Check className="size-4 text-paid" aria-hidden /> {t}
            </li>
          ))}
        </ul>
      </div>
      <PhonePreview />
    </section>
  )
}
