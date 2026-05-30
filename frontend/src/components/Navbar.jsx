import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import logo from '../assets/logo.png'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0A0A0F]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-white">
          <img src={logo} alt="AutoPaise logo" className="h-8 w-auto" />
        </Link>

        <nav className="hidden items-center gap-4 text-sm font-medium text-white/60 md:flex">
          <Link className="hover:text-white" to="/">Home</Link>
          <Link className="hover:text-white" to="/dashboard">Dashboard</Link>
          <Link className="hover:text-white" to="/create-mandate">Create Mandate</Link>
          <Link className="hover:text-white" to="/settings">Settings</Link>
        </nav>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link
                to="/login"
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <span className="hidden rounded-full bg-indigo-500/20 px-3 py-2 text-sm font-medium text-indigo-300 md:inline-flex">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
