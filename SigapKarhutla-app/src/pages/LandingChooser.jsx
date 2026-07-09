import { Link } from 'react-router-dom'

export default function LandingChooser() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-900 px-4">
      <div className="w-full max-w-2xl text-center text-white">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ember-500 text-xl font-bold">
          SK
        </span>
        <h1 className="text-3xl font-semibold">
          SIGAP <span className="text-ember-300">KARHUTLA</span>
        </h1>
        <p className="mt-2 text-forest-200">
          Sistem Informasi Gawat Darurat &amp; Antisipasi Kebakaran Hutan dan Lahan
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            to="/warga"
            className="rounded-xl border border-white/10 bg-white/5 p-6 text-left transition hover:bg-white/10"
          >
            <p className="text-sm uppercase tracking-wide text-forest-300">Untuk Warga</p>
            <h2 className="mt-1 text-lg font-semibold">Portal Warga</h2>
            <p className="mt-2 text-sm text-forest-200">
              Lapor kejadian karhutla &amp; pantau status wilayah &mdash; tanpa perlu login.
            </p>
          </Link>
          <Link
            to="/instansi/login"
            className="rounded-xl border border-white/10 bg-white/5 p-6 text-left transition hover:bg-white/10"
          >
            <p className="text-sm uppercase tracking-wide text-forest-300">Untuk Petugas</p>
            <h2 className="mt-1 text-lg font-semibold">Portal Instansi</h2>
            <p className="mt-2 text-sm text-forest-200">
              BPBD, KLHK, Dinas Kehutanan, BMKG/Staklim, dan Pemda &mdash; perlu login.
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
