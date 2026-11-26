// Tab-style switch. `options` is [{ id, label, count? }].
export default function Segmented({ options, value, onChange, label }) {
  return (
    <div className="flex rounded-xl bg-sunk p-1" role="tablist" aria-label={label}>
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition ${
              active ? 'bg-surface text-ink shadow-card' : 'text-muted hover:text-ink'
            }`}
          >
            {o.label}
            {o.count > 0 && <span className={`rounded-full px-1.5 text-xs ${active ? 'bg-due-soft text-due' : 'bg-line text-muted'}`}>{o.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
