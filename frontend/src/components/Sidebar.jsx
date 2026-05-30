import { Link, useLocation } from 'react-router-dom'
import { Activity, CreditCard, Settings, PlusCircle } from 'lucide-react'

const navItems = [
  { title: 'Dashboard', to: '/dashboard', icon: Activity },
  { title: 'Create Mandate', to: '/create-mandate', icon: PlusCircle },
  { title: 'Settings', to: '/settings', icon: Settings }
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-3 p-4 md:flex">
      <div className="rounded-2xl bg-white/70 p-4 shadow-soft">
        <h2 className="text-sm font-semibold text-slate-700">Quick actions</h2>
        <nav className="mt-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const active = location.pathname === item.to
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="rounded-2xl bg-white/70 p-4 shadow-soft">
        <h3 className="text-sm font-semibold text-slate-700">Billing snapshot</h3>
        <p className="mt-2 text-sm text-slate-500">
          Your next payout and upcoming mandates appear here.
        </p>
        <div className="mt-4 grid gap-2">
          <div className="rounded-xl bg-indigo-50 px-4 py-3 text-sm">
            <p className="font-semibold text-indigo-700">Next payout</p>
            <p className="text-slate-700">₹ 0.00</p>
          </div>
          <div className="rounded-xl bg-purple-50 px-4 py-3 text-sm">
            <p className="font-semibold text-purple-700">Active mandates</p>
            <p className="text-slate-700">0</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
