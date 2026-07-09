import StageNotice from '../../components/shared/StageNotice'

export default function DaftarTiket() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-forest-800">Daftar Tiket Penanganan</h1>
      <StageNotice
        title="Tabel tiket dengan filter status &amp; instansi"
        description="Akan diisi setelah tabel tiket tersedia (tahap berikutnya)."
      />
    </div>
  )
}
