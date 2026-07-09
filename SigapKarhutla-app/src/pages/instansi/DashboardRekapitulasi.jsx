import { Navigate } from 'react-router-dom'
import StageNotice from '../../components/shared/StageNotice'
import { useAuth } from '../../hooks/useAuth'

export default function DashboardRekapitulasi() {
  const { profile, loading } = useAuth()

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Memuat…</div>
  }

  if (profile && profile.role !== 'pemda') {
    return <Navigate to="/instansi" replace />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-forest-800">Dashboard Rekapitulasi</h1>
      <StageNotice
        title="Statistik agregat waktu tanggap &amp; laporan per instansi"
        description="Khusus role Pemda. Akan diisi setelah data tiket &amp; laporan tersedia (tahap berikutnya)."
      />
    </div>
  )
}
