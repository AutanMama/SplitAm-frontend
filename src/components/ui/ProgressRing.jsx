// Circular progress, e.g. "round 3 of 10".
export default function ProgressRing({ value, max, size = 88, stroke = 8, children, trackClass = 'stroke-white/15', barClass = 'stroke-lime' }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = max ? Math.min(1, value / max) : 0
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={trackClass} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className={`${barClass} transition-[stroke-dashoffset] duration-700 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}
