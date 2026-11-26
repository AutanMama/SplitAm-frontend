import { Link } from 'react-router-dom'

export function LogoMark({ className = 'size-8' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" className="fill-forest" />
      <circle cx="16" cy="16" r="8.5" fill="none" className="stroke-lime" strokeWidth="2.6" strokeDasharray="11 2.4" />
      <circle cx="16" cy="7.5" r="2.6" className="fill-lime" />
    </svg>
  )
}

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="flex items-center gap-2" aria-label="SplitAm home">
      <LogoMark />
      <span className="text-xl font-bold tracking-tight">
        Split<span className="text-paid">Am</span>
      </span>
    </Link>
  )
}
