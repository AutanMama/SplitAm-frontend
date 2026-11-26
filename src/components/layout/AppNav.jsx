import { Link, NavLink, useLocation } from 'react-router-dom'
import { LogOut, Plus, UsersRound } from 'lucide-react'
import Logo from '../ui/Logo'
import Avatar from '../ui/Avatar'
import { getUser } from '../../lib/session'
import { signOut } from '../../services/auth'

const TABS = [
  { to: '/', label: 'Groups', icon: UsersRound, end: true },
  { to: '/create-group', label: 'New group', icon: Plus },
]

function DesktopBar({ user }) {
  return (
    <header className="sticky top-0 z-[200] hidden border-b border-line bg-bg/85 backdrop-blur-md md:block">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6">
        <Logo />
        <nav className="flex items-center gap-1" aria-label="Main">
          {TABS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-surface text-ink shadow-card' : 'text-muted hover:text-ink'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/profile" className="flex items-center gap-2 rounded-full py-1 pr-3 pl-1 hover:bg-sunk">
            <Avatar name={user?.name} size="sm" tone="me" />
            <span className="text-sm font-semibold">{user?.name?.split(' ')[0]}</span>
          </Link>
          <button type="button" onClick={signOut} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger" aria-label="Sign out">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </header>
  )
}

function MobileTabs({ user }) {
  const { pathname } = useLocation()
  const item = (active) => `flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold ${active ? 'text-forest' : 'text-muted'}`
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[200] flex border-t border-line bg-surface/95 px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
      aria-label="Main"
    >
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => item(isActive)}>
          {({ isActive }) => (
            <>
              <span className={`grid h-7 w-12 place-items-center rounded-full transition ${isActive ? 'bg-forest/10' : ''}`}>
                <Icon className="size-5" strokeWidth={isActive ? 2.4 : 2} aria-hidden />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
      <Link to="/profile" className={item(pathname === '/profile')}>
        <Avatar name={user?.name} size="sm" tone={pathname === '/profile' ? 'me' : 'neutral'} className="size-7 text-[11px]" />
        You
      </Link>
    </nav>
  )
}

function MobileTop() {
  return (
    <header className="sticky top-0 z-[150] flex h-14 items-center border-b border-line bg-bg/90 px-4 backdrop-blur-md md:hidden">
      <Logo />
    </header>
  )
}

export default function AppNav() {
  const user = getUser()
  return (
    <>
      <DesktopBar user={user} />
      <MobileTop />
      <MobileTabs user={user} />
    </>
  )
}
