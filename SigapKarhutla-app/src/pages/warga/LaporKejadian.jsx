import StageNotice from '../../components/shared/StageNotice'

export default function LaporKejadian() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-forest-800">Lapor Kejadian</h1>
        <p className="mt-1 text-sm text-slate-600">
          Laporkan titik api, asap, atau aktivitas ilegal yang Anda temukan di lapangan.
        </p>
      </div>
      <StageNotice
        title="Form lapor kejadian"
        description="Form (kategori, foto/video, lokasi via GPS, deskripsi) akan diisi setelah skema database dibuat (tahap berikutnya)."
      />
    </div>
  )
}
