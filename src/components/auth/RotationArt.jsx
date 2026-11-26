import { useEffect, useState } from 'react'

const PEOPLE = ['Chinedu', 'Aisha', 'Tunde', 'Ngozi', 'Musa', 'Bola']

// Six members around the pot. The lime highlight moves to whoever collects next.
export default function RotationArt() {
  const [turn, setTurn] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setTurn((t) => (t + 1) % PEOPLE.length), 1800)
    return () => clearInterval(id)
  }, [])

  const size = 300
  const c = size / 2
  const r = 112

  return (
    <svg viewBox={`-24 -24 ${size + 48} ${size + 48}`} className="w-full max-w-[380px]" role="img" aria-label="Six members take turns collecting the pot">
      <circle cx={c} cy={c} r={r} fill="none" className="stroke-forest-muted/30" strokeWidth="2" strokeDasharray="4 8" />
      <circle cx={c} cy={c} r="46" className="fill-lime" />
      <text x={c} y={c - 4} textAnchor="middle" className="fill-on-lime text-[11px] font-semibold tracking-wider">
        POT
      </text>
      <text x={c} y={c + 16} textAnchor="middle" className="fill-on-lime text-[17px] font-bold">
        ₦300k
      </text>
      {PEOPLE.map((name, i) => {
        const a = (i / PEOPLE.length) * Math.PI * 2 - Math.PI / 2
        const x = c + Math.cos(a) * r
        const y = c + Math.sin(a) * r
        const active = i === turn
        return (
          <g key={name} style={{ transition: 'opacity 0.4s' }}>
            {active && <line x1={x} y1={y} x2={c} y2={c} className="stroke-lime" strokeWidth="2" strokeDasharray="3 5" />}
            <circle cx={x} cy={y} r={active ? 26 : 22} className={`${active ? 'fill-lime' : 'fill-white/10'} transition-all duration-500`} />
            <text x={x} y={y + 5} textAnchor="middle" className={`text-[14px] font-bold ${active ? 'fill-on-lime' : 'fill-white'}`}>
              {name.charAt(0)}
            </text>
            <text x={x} y={y + (y > c ? 44 : -34)} textAnchor="middle" className={`text-[11px] ${active ? 'fill-lime font-semibold' : 'fill-forest-muted'}`}>
              {name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
