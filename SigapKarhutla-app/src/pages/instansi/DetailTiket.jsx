import { useParams, Link } from 'react-router-dom'
import StageNotice from '../../components/shared/StageNotice'

export default function DetailTiket() {
  const { id } = useParams()

  return (
    <div className="space-y-6">
      <div>
        <Link to="/instansi/tiket" className="text-sm text-forest-600 hover:underline">
          &larr; Kembali ke Daftar Tiket
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-forest-800">Detail Tiket #{id}</h1>
      </div>
      <StageNotice
        title="Lokasi, skor risiko, SLA &amp; riwayat tindak lanjut"
        description="Akan diisi setelah tabel tiket &amp; riwayat_tindak_lanjut tersedia (tahap berikutnya)."
      />
    </div>
  )
}
