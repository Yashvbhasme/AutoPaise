const colorMap = {
  indigo: 'bg-indigo-50 text-indigo-600',
  purple: 'bg-purple-50 text-purple-600',
  emerald: 'bg-emerald-50 text-emerald-600'
}

export default function SummaryCard({ title, value, icon, color = 'indigo' }) {
  const classes = colorMap[color] ?? colorMap.indigo

  return (
    <div className="rounded-2xl bg-white/70 p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${classes}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
