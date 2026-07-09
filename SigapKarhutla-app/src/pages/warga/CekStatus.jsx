import StageNotice from '../../components/shared/StageNotice'

export default function CekStatus() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-forest-800">Cek Status Laporan</h1>
        <p className="mt-1 text-sm text-slate-600">
          Masukkan nomor pelacakan atau nomor HP untuk melihat status terkini laporan Anda.
        </p>
      </div>
      <StageNotice
        title="Pencarian status laporan"
        description="Akan diisi setelah tabel laporan_warga &amp; tiket tersedia (tahap berikutnya)."
      />
    </div>
  )
}
