import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const baseNav = [
  { to: '/instansi', label: 'Dashboard Komando', end: true },
  { to: '/instansi/tiket', label: 'Daftar Tiket' },
]

const pemdaNav = [{ to: '/instansi/rekap', label: 'Rekapitulasi' }]

export default function InstansiLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const navItems = profile?.role === 'pemda' ? [...baseNav, ...pemdaNav] : baseNav

  const handleSignOut = async () => {
    await signOut()
    navigate('/instansi/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 flex-col bg-forest-900 text-white md:flex">
        <div className="flex items-center gap-2 px-5 py-5 text-lg font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ember-500 text-sm font-bold">
            SK
          </span>
          SIGAP KARHUTLA
        </div>
        <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-forest-700 text-white' : 'text-forest-200 hover:bg-forest-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 px-5 py-4 text-xs text-forest-200">
          {profile ? (
            <>
              <p className="font-medium text-white">{profile.nama}</p>
              <p className="uppercase tracking-wide">{profile.instansi ?? profile.role}</p>
            </>
          ) : (
            <p>Memuat profil…</p>
          )}
          <button
            onClick={handleSignOut}
            className="mt-3 w-full rounded-md border border-white/20 py-1.5 text-white hover:bg-forest-800"
          >
            Keluar
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <span className="font-semibold text-forest-800">SIGAP KARHUTLA</span>
          <button onClick={handleSignOut} className="text-sm text-forest-600">
            Keluar
          </button>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
