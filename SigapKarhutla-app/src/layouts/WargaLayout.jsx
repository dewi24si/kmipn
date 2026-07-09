import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'

const navItems = [
  { to: '/warga', label: 'Beranda', end: true },
  { to: '/warga/lapor', label: 'Lapor Kejadian' },
  { to: '/warga/status', label: 'Cek Status' },
]

export default function WargaLayout() {
  const [menuTerbuka, setMenuTerbuka] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-forest-800/10 bg-forest-800 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/warga" className="flex items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ember-500 text-sm font-bold">
              SK
            </span>
            <span>
              SIGAP <span className="text-ember-300">KARHUTLA</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 transition-colors ${
                    isActive ? 'bg-forest-700 text-white' : 'text-forest-100 hover:bg-forest-700/60'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/instansi/login"
              className="ml-2 rounded-md border border-forest-100/30 px-3 py-2 text-forest-100 hover:bg-forest-700/60"
            >
              Portal Instansi
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMenuTerbuka((v) => !v)}
            className="rounded-md border border-forest-100/30 p-2 text-forest-100 md:hidden"
            aria-label="Buka menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              {menuTerbuka ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuTerbuka && (
          <nav className="flex flex-col gap-1 border-t border-white/10 px-4 py-3 text-sm md:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuTerbuka(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 transition-colors ${
                    isActive ? 'bg-forest-700 text-white' : 'text-forest-100 hover:bg-forest-700/60'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/instansi/login"
              onClick={() => setMenuTerbuka(false)}
              className="rounded-md border border-forest-100/30 px-3 py-2 text-forest-100 hover:bg-forest-700/60"
            >
              Portal Instansi
            </Link>
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        SIGAP KARHUTLA &mdash; Prototipe Demo KMIPN VIII 2026 &middot; Data yang ditampilkan bersifat simulasi
      </footer>
    </div>
  )
}
