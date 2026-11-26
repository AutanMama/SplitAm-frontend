import { initials } from '../../lib/format'

const SIZES = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-14 text-lg', xl: 'size-20 text-2xl' }

const TONES = {
  neutral: 'bg-sunk text-ink',
  me: 'bg-forest text-on-forest',
  ghost: 'border border-dashed border-due/60 bg-due-soft text-due',
  paid: 'bg-paid text-white',
  turn: 'bg-lime text-on-lime',
}

export default function Avatar({ name, size = 'md', tone = 'neutral', className = '' }) {
  return (
    <span className={`inline-grid shrink-0 place-items-center rounded-full font-semibold ${SIZES[size]} ${TONES[tone]} ${className}`} aria-hidden>
      {initials(name)}
    </span>
  )
}

export function AvatarStack({ names, max = 4 }) {
  const shown = names.slice(0, max)
  const extra = names.length - shown.length
  return (
    <span className="flex -space-x-2" aria-label={`${names.length} members`}>
      {shown.map((n, i) => (
        <Avatar key={`${n}-${i}`} name={n} size="sm" className="ring-2 ring-surface" />
      ))}
      {extra > 0 && <span className="grid size-8 place-items-center rounded-full bg-sunk text-xs font-semibold text-muted ring-2 ring-surface">+{extra}</span>}
    </span>
  )
}
