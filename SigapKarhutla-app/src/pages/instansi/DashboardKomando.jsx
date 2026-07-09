import StageNotice from '../../components/shared/StageNotice'
import { useAuth } from '../../hooks/useAuth'

export default function DashboardKomando() {
  const { profile } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-forest-800">Dashboard Komando</h1>
        <p className="mt-1 text-sm text-slate-600">
          {profile?.nama ? `Selamat datang, ${profile.nama}.` : 'Selamat datang.'} Ringkasan situasi karhutla wilayah Riau.
        </p>
      </div>
      <StageNotice
        title="Peta risiko, ringkasan tiket &amp; tren titik panas"
        description="Akan diisi setelah skema database &amp; data dummy tersedia (tahap berikutnya)."
      />
    </div>
  )
}
