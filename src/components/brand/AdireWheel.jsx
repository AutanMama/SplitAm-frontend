import { useEffect, useId, useState } from 'react'
import { AdireTile } from './AdirePattern'

const MOTIFS = ['oniko', 'lattice', 'ladder']

function arcPath(cx, cy, r0, r1, a0, a1) {
  const p = (r, a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
  const [x0, y0] = p(r1, a0)
  const [x1, y1] = p(r1, a1)
  const [x2, y2] = p(r0, a1)
  const [x3, y3] = p(r0, a0)
  const large = a1 - a0 > Math.PI ? 1 : 0
  return `M${x0} ${y0} A${r1} ${r1} 0 ${large} 1 ${x1} ${y1} L${x2} ${y2} A${r0} ${r0} 0 ${large} 0 ${x3} ${y3} Z`
}

/*
 * The ajo as a piece of cloth: each member is a segment of adire around the pot,
 * and the kola-coloured segment is whoever collects this round.
 */
export default function AdireWheel({ members, pot = '₦300k', label = 'POT', className = '', onDark = false }) {
  const uid = useId().replace(/:/g, '')
  const [turn, setTurn] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setTurn((t) => (t + 1) % members.length), 2200)
    return () => clearInterval(id)
  }, [members.length])

  const size = 400
  const c = size / 2
  const r1 = 150
  const r0 = 70
  const gap = 0.025
  const n = members.length

  return (
    <svg viewBox={`-40 -40 ${size + 80} ${size + 80}`} className={className} role="img" aria-label={`${n} members take turns collecting the pot`}>
      <defs>
        {MOTIFS.map((m) => (
          <AdireTile key={m} motif={m} id={`w-${uid}-${m}`} size={26} />
        ))}
      </defs>

      {members.map((name, i) => {
        const a0 = (i / n) * Math.PI * 2 - Math.PI / 2 + gap
        const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2 - gap
        const mid = (a0 + a1) / 2
        const active = i === turn
        const motif = MOTIFS[i % MOTIFS.length]
        const lx = c + Math.cos(mid) * (r1 + 30)
        const ly = c + Math.sin(mid) * (r1 + 30)
        return (
          <g key={name}>
            <path d={arcPath(c, c, r0, r1, a0, a1)} className={`transition-colors duration-700 ${active ? 'fill-kola' : 'fill-indigo'}`} />
            <path
              d={arcPath(c, c, r0, r1, a0, a1)}
              fill={`url(#w-${uid}-${motif})`}
              className={`transition-colors duration-700 ${active ? 'text-indigo-deep/35' : 'text-indigo-muted/45'}`}
            />
            <text
              x={lx}
              y={ly + 5}
              textAnchor={Math.abs(Math.cos(mid)) < 0.2 ? 'middle' : Math.cos(mid) > 0 ? 'start' : 'end'}
              className={`text-[19px] transition-colors duration-700 ${
                active ? `font-semibold ${onDark ? 'fill-kola' : 'fill-kola-text'}` : onDark ? 'fill-indigo-muted' : 'fill-muted'
              }`}
            >
              {name}
            </text>
          </g>
        )
      })}

      <circle cx={c} cy={c} r={r0 - 10} className="fill-kola" />
      <circle cx={c} cy={c} r={r0 - 18} fill="none" className="stroke-indigo-deep/25" strokeWidth="1.5" strokeDasharray="3 5" />
      <text x={c} y={c - 8} textAnchor="middle" className="fill-on-kola text-[12px] font-semibold tracking-[0.2em]">
        {label}
      </text>
      <text x={c} y={c + 20} textAnchor="middle" className="fill-on-kola font-serif text-[28px]">
        {/* Gloock has no naira sign, so the symbol is set in the body face. */}
        {pot.startsWith('₦') && <tspan className="font-sans text-[24px] font-semibold">₦</tspan>}
        {pot.replace(/^₦/, '')}
      </text>
    </svg>
  )
}
