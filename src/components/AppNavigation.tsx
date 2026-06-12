import { NavLink } from 'react-router-dom'

const appLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/daily-overview', label: 'Daily overview' },
  { to: '/categories', label: 'Categories' },
  { to: '/profile', label: 'Profile' },
]

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/login', label: 'Login' },
  { to: '/signup', label: 'Sign up' },
]

export default function AppNavigation({ variant = 'app' }: { variant?: 'app' | 'public' }) {
  const links = variant === 'public' ? publicLinks : appLinks

  return (
    <nav className="sticky top-0 z-20 border-b border-slate-800/90 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 md:px-8">
        <NavLink to={variant === 'public' ? '/' : '/dashboard'} className="text-lg font-semibold tracking-[0.2em] text-emerald-300 uppercase">
          ProtiTaka
        </NavLink>

        <div className="flex flex-wrap items-center gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-emerald-400 text-slate-950'
                    : 'border border-slate-700 text-slate-100 hover:border-slate-500 hover:bg-slate-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
