import { useId } from 'react'

/*
 * Adire motifs drawn as SVG pattern tiles. Adire is the indigo resist-dyed cloth
 * of the Yoruba; these are simplified versions of three classic motifs:
 *   oniko  – concentric tie-dye circles
 *   lattice – the diamond grid of eleko (starch-resist) cloth
 *   ladder  – stitched lines, as in alabere
 * Colour comes from `currentColor`, so set it with a text-* class.
 */
export function AdireTile({ motif, id, size = 40 }) {
  const s = size
  const h = s / 2
  const tiles = {
    oniko: (
      <>
        <circle cx={h} cy={h} r={s * 0.38} fill="none" stroke="currentColor" strokeWidth={s * 0.06} />
        <circle cx={h} cy={h} r={s * 0.22} fill="none" stroke="currentColor" strokeWidth={s * 0.05} />
        <circle cx={h} cy={h} r={s * 0.07} fill="currentColor" />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={i % 2 ? s : 0} cy={i < 2 ? 0 : s} r={s * 0.06} fill="currentColor" />
        ))}
      </>
    ),
    lattice: (
      <>
        <path d={`M${h} 0 L${s} ${h} L${h} ${s} L0 ${h} Z`} fill="none" stroke="currentColor" strokeWidth={s * 0.05} />
        <path d={`M${h} ${s * 0.25} L${s * 0.75} ${h} L${h} ${s * 0.75} L${s * 0.25} ${h} Z`} fill="currentColor" opacity="0.55" />
        <circle cx={h} cy={h} r={s * 0.05} fill="currentColor" />
        <circle cx="0" cy="0" r={s * 0.05} fill="currentColor" />
        <circle cx={s} cy={s} r={s * 0.05} fill="currentColor" />
      </>
    ),
    ladder: (
      <>
        <line x1="0" y1={s * 0.2} x2={s} y2={s * 0.2} stroke="currentColor" strokeWidth={s * 0.05} />
        <line x1="0" y1={s * 0.8} x2={s} y2={s * 0.8} stroke="currentColor" strokeWidth={s * 0.05} />
        {[0.15, 0.4, 0.65, 0.9].map((x) => (
          <line key={x} x1={s * x} y1={s * 0.3} x2={s * x} y2={s * 0.7} stroke="currentColor" strokeWidth={s * 0.045} strokeLinecap="round" />
        ))}
      </>
    ),
  }
  return (
    <pattern id={id} width={s} height={s} patternUnits="userSpaceOnUse">
      {tiles[motif]}
    </pattern>
  )
}

// Fills its box with a repeating motif. Use absolutely positioned inside a relative parent.
export default function AdirePattern({ motif = 'oniko', size = 40, className = '' }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={`pointer-events-none ${className}`} aria-hidden>
      <defs>
        <AdireTile motif={motif} id={`adire-${id}`} size={size} />
      </defs>
      <rect width="100%" height="100%" fill={`url(#adire-${id})`} />
    </svg>
  )
}

// A thin band of cloth, used between sections.
export function AdireStrip({ className = '' }) {
  return (
    <div className={`relative h-7 overflow-hidden bg-indigo text-indigo-muted/40 ${className}`} aria-hidden>
      <AdirePattern motif="ladder" size={28} className="absolute inset-0 size-full" />
    </div>
  )
}
