import { Link } from 'react-router-dom'
import { Clock, CheckCircle2, XCircle } from 'lucide-react'
import { RiskBadge } from './RiskAndReminder'

export default function MandateCard({ mandate, userToken }) {
  const status = mandate?.status ?? 'inactive'
  const statusStyles = {
    active: 'bg-emerald-50 text-emerald-700',
    pending: 'bg-indigo-50 text-indigo-700',
    inactive: 'bg-slate-100 text-slate-600'
  }

  return (
    <Link
      to={`/mandate/${mandate?.id ?? ''}`}
      className="group rounded-2xl bg-white/70 p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">
            {mandate?.customerName ?? 'Unnamed Customer'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{mandate?.upiId ?? 'UPI ID not set'}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] ?? statusStyles.inactive}`}>
            {status === 'active' ? <CheckCircle2 className="h-3 w-3" /> : status === 'pending' ? <Clock className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            {status}
          </span>
          {userToken && mandate?.id && (
            <RiskBadge mandateId={mandate.id} userToken={userToken} size="sm" />
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-500">
        <div>
          <p className="font-medium text-slate-700">Amount</p>
          <p>₹ {mandate?.amount ?? '0.00'}</p>
        </div>
        <div>
          <p className="font-medium text-slate-700">Frequency</p>
          <p>{mandate?.frequency ?? 'Monthly'}</p>
        </div>
      </div>
    </Link>
  )
}
