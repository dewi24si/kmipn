import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const baseNav = [
  { to: '/instansi', label: 'Dashboard Komando', end: true },
  { to: '/instansi/tiket', label: 'Daftar Tiket', badge: 'darurat' },
]

const pemdaNav = [{ to: '/instansi/rekap', label: 'Rekapitulasi' }]

export default function InstansiLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuTerbuka, setMenuTerbuka] = useState(false)
  const [jumlahDarurat, setJumlahDarurat] = useState(0)
  const navItems = profile?.role === 'pemda' ? [...baseNav, ...pemdaNav] : baseNav

  useEffect(() => {
    supabase
      .from('tiket')
      .select('id', { count: 'exact', head: true })
      .eq('darurat', true)
      .neq('status', 'Selesai')
      .then(({ count }) => setJumlahDarurat(count ?? 0))
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/instansi/login')
  }

  const renderNavItems = (onNavigate) =>
    navItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
            isActive ? 'bg-forest-700 text-white' : 'text-forest-200 hover:bg-forest-800'
          }`
        }
      >
        <span>{item.label}</span>
        {item.badge === 'darurat' && jumlahDarurat > 0 && (
          <span className="rounded-full bg-ember-500 px-2 py-0.5 text-xs font-semibold text-white">
            {jumlahDarurat}
          </span>
        )}
      </NavLink>
    ))

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 flex-col bg-forest-900 text-white md:flex">
        <div className="flex items-center gap-2 px-5 py-5 text-lg font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ember-500 text-sm font-bold">
            SK
          </span>
          SIGAP KARHUTLA
        </div>
        <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">{renderNavItems()}</nav>
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
        <header className="border-b border-slate-200 bg-forest-900 text-white md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-semibold">SIGAP KARHUTLA</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMenuTerbuka((v) => !v)}
                className="rounded-md border border-white/20 p-2"
                aria-label="Buka menu"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          {menuTerbuka && (
            <nav className="flex flex-col gap-1 border-t border-white/10 px-4 py-3">
              {renderNavItems(() => setMenuTerbuka(false))}
              <button
                onClick={handleSignOut}
                className="mt-2 rounded-md border border-white/20 py-1.5 text-sm text-white"
              >
                Keluar
              </button>
            </nav>
          )}
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
