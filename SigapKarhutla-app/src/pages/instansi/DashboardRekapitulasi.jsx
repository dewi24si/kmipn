import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { formatDurasi } from '../../utils/tiket'

const BULAN_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export default function DashboardRekapitulasi() {
  const { profile, loading: authLoading } = useAuth()
  const [tiketList, setTiketList] = useState([])
  const [laporanList, setLaporanList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      supabase.from('tiket').select('*'),
      supabase.from('laporan_warga').select('id, dibuat_pada'),
    ]).then(([tiketRes, laporanRes]) => {
      if (cancelled) return
      setTiketList(tiketRes.data ?? [])
      setLaporanList(laporanRes.data ?? [])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (authLoading) {
    return <div className="p-6 text-sm text-slate-500">Memuat…</div>
  }

  if (profile && profile.role !== 'pemda') {
    return <Navigate to="/instansi" replace />
  }

  const selesai = tiketList.filter((t) => t.status === 'Selesai')
  const rataRataRespons =
    selesai.length > 0
      ? selesai.reduce((sum, t) => sum + (new Date(t.diperbarui_pada) - new Date(t.dibuat_pada)), 0) / selesai.length
      : null

  const perInstansi = {}
  tiketList.forEach((t) => {
    const key = t.instansi_ditugaskan ?? 'Belum ditugaskan'
    perInstansi[key] = (perInstansi[key] ?? 0) + 1
  })
  const dataInstansi = Object.entries(perInstansi).map(([instansi, jumlah]) => ({ instansi, jumlah }))

  const now = new Date()
  const dataBulanan = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const jumlah = laporanList.filter((l) => {
      const ld = new Date(l.dibuat_pada)
      return ld.getFullYear() === d.getFullYear() && ld.getMonth() === d.getMonth()
    }).length
    return { bulan: `${BULAN_ID[d.getMonth()]} ${d.getFullYear()}`, jumlah }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-forest-800">Dashboard Rekapitulasi</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Rata-rata waktu tanggap</p>
          <p className="mt-1 text-xl font-semibold text-forest-800">
            {loading ? '…' : rataRataRespons != null ? formatDurasi(rataRataRespons) : '-'}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Total tiket</p>
          <p className="mt-1 text-xl font-semibold text-forest-800">{loading ? '…' : tiketList.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Total laporan warga</p>
          <p className="mt-1 text-xl font-semibold text-forest-800">{loading ? '…' : laporanList.length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-forest-800">Jumlah Tiket per Instansi</h2>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataInstansi}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e4e7" />
              <XAxis dataKey="instansi" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="jumlah" name="Tiket" fill="#2e633c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-forest-800">Laporan Warga per Bulan</h2>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataBulanan}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e4e7" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="jumlah" name="Laporan" fill="#f9500f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
