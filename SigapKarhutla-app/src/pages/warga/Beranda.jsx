import StageNotice from '../../components/shared/StageNotice'

export default function Beranda() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-forest-800 px-6 py-8 text-white">
        <h1 className="text-2xl font-semibold">Dashboard Transparansi Publik</h1>
        <p className="mt-1 text-forest-100">
          Pantau status wilayah rawan karhutla di Provinsi Riau secara real-time.
        </p>
      </section>
      <StageNotice
        title="Peta wilayah &amp; indikator kualitas udara"
        description="Akan diisi setelah skema database &amp; data dummy hotspot dibuat (tahap berikutnya)."
      />
    </div>
  )
}
