const TONES = {
  neutral: 'bg-sunk text-muted',
  paid: 'bg-paid-soft text-paid',
  due: 'bg-due-soft text-due',
  danger: 'bg-danger-soft text-danger',
  indigo: 'bg-indigo text-on-indigo',
  kola: 'bg-kola text-on-kola',
}

export default function Badge({ tone = 'neutral', icon: Icon, className = '', children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${TONES[tone]} ${className}`}>
      {Icon && <Icon className="size-3.5" aria-hidden />}
      {children}
    </span>
  )
}
