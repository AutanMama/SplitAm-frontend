import { Link } from 'react-router-dom'

// Eight members around the pot; the kola dot is whoever collects this round.
export function LogoMark({ className = 'size-8' }) {
  const dots = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2
    return [16 + Math.cos(a) * 8.6, 16 + Math.sin(a) * 8.6]
  })
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="7" className="fill-indigo" />
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 0 ? 2.6 : 1.9} className={i === 0 ? 'fill-kola' : 'fill-white'} />
      ))}
      <circle cx="16" cy="16" r="3.4" className="fill-kola" />
    </svg>
  )
}

export default function Logo({ to = '/', onDark = false }) {
  return (
    <Link to={to} className="flex items-center gap-2.5" aria-label="SplitAm home">
      <LogoMark />
      <span className={`serif text-[22px] ${onDark ? 'text-on-indigo' : 'text-ink'}`}>SplitAm</span>
    </Link>
  )
}
