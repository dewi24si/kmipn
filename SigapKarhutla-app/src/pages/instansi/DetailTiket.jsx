import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import PetaTiket from '../../components/shared/PetaTiket'
import { KATEGORI_LABEL, STATUS_OPTIONS, WARNA_HEX, tingkatRisiko, isTerlambat, formatTanggal } from '../../utils/tiket'

const INSTANSI_OPTIONS = ['BPBD', 'KLHK', 'Dinas Kehutanan', 'BMKG']

export default function DetailTiket() {
  const { id } = useParams()
  const { profile } = useAuth()
  const [tiket, setTiket] = useState(null)
  const [laporan, setLaporan] = useState(null)
  const [riwayat, setRiwayat] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusBaru, setStatusBaru] = useState('')
  const [instansiBaru, setInstansiBaru] = useState('')
  const [catatan, setCatatan] = useState('')
  const [menyimpan, setMenyimpan] = useState(false)
  const [error, setError] = useState(null)

  async function ambilDetail(ticketId) {
    const [tiketRes, laporanRes, riwayatRes] = await Promise.all([
      supabase.from('tiket').select('*').eq('id', ticketId).single(),
      supabase.from('laporan_warga').select('*').eq('tiket_id', ticketId).maybeSingle(),
      supabase
        .from('riwayat_tindak_lanjut')
        .select('*, users:oleh_user(nama, instansi)')
        .eq('tiket_id', ticketId)
        .order('waktu', { ascending: false }),
    ])
    return { tiket: tiketRes.data, laporan: laporanRes.data, riwayat: riwayatRes.data ?? [] }
  }

  useEffect(() => {
    let cancelled = false

    ambilDetail(id).then((hasil) => {
      if (cancelled) return
      setTiket(hasil.tiket)
      setLaporan(hasil.laporan)
      setRiwayat(hasil.riwayat)
      setStatusBaru(hasil.tiket?.status ?? '')
      setInstansiBaru(hasil.tiket?.instansi_ditugaskan ?? '')
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [id])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError(null)
    setMenyimpan(true)

    const { error: updateError } = await supabase
      .from('tiket')
      .update({ status: statusBaru, instansi_ditugaskan: instansiBaru || null })
      .eq('id', id)

    if (updateError) {
      setError('Gagal memperbarui tiket. Silakan coba lagi.')
      setMenyimpan(false)
      return
    }

    if (catatan.trim()) {
      await supabase.from('riwayat_tindak_lanjut').insert({
        tiket_id: id,
        catatan: catatan.trim(),
        oleh_user: profile?.id,
      })
    }

    const hasil = await ambilDetail(id)
    setTiket(hasil.tiket)
    setLaporan(hasil.laporan)
    setRiwayat(hasil.riwayat)
    setStatusBaru(hasil.tiket?.status ?? '')
    setInstansiBaru(hasil.tiket?.instansi_ditugaskan ?? '')
    setCatatan('')
    setMenyimpan(false)
  }

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Memuat…</div>
  }

  if (!tiket) {
    return (
      <div className="space-y-4">
        <Link to="/instansi/tiket" className="text-sm text-forest-600 hover:underline">
          &larr; Kembali ke Daftar Tiket
        </Link>
        <p className="text-sm text-slate-500">Tiket tidak ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/instansi/tiket" className="text-sm text-forest-600 hover:underline">
          &larr; Kembali ke Daftar Tiket
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-forest-800">
            {KATEGORI_LABEL[tiket.kategori] ?? tiket.kategori} &middot; {tiket.wilayah}
          </h1>
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: WARNA_HEX[tingkatRisiko(tiket)] }}
          >
            Skor {tiket.skor_risiko}
          </span>
          {isTerlambat(tiket) && (
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-status-darurat">
              Terlambat
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <PetaTiket tiketList={[tiket]} height={320} />

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold text-forest-800">Informasi Tiket</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-slate-400">Sumber</dt>
                <dd className="capitalize text-slate-700">{tiket.sumber}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Lokasi</dt>
                <dd className="text-slate-700">
                  {tiket.lokasi_lat.toFixed(4)}, {tiket.lokasi_lng.toFixed(4)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Dibuat</dt>
                <dd className="text-slate-700">{formatTanggal(tiket.dibuat_pada)}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Tenggat SLA</dt>
                <dd className={isTerlambat(tiket) ? 'font-medium text-status-darurat' : 'text-slate-700'}>
                  {formatTanggal(tiket.sla_deadline)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Diperbarui</dt>
                <dd className="text-slate-700">{formatTanggal(tiket.diperbarui_pada)}</dd>
              </div>
            </dl>

            {laporan && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <h3 className="mb-1 text-sm font-semibold text-forest-800">Laporan Warga</h3>
                <p className="text-sm text-slate-700">{laporan.deskripsi}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {laporan.nama_pelapor ?? 'Anonim'} &middot; {laporan.no_hp ?? 'No. HP tidak dicantumkan'} &middot;{' '}
                  {laporan.nomor_pelacakan}
                </p>
                {laporan.foto_url && (
                  <a
                    href={laporan.foto_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs font-medium text-forest-700 hover:underline"
                  >
                    Lihat foto/video lampiran
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-forest-800">Riwayat Tindak Lanjut</h2>
            {riwayat.length === 0 && <p className="text-sm text-slate-400">Belum ada riwayat tindak lanjut.</p>}
            <ol className="space-y-3">
              {riwayat.map((r) => (
                <li key={r.id} className="border-l-2 border-forest-200 pl-3">
                  <p className="text-sm text-slate-700">{r.catatan}</p>
                  <p className="text-xs text-slate-400">
                    {r.users?.nama ?? 'Petugas'} ({r.users?.instansi ?? '-'}) &middot; {formatTanggal(r.waktu)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-forest-800">Update Status</h2>
          <form onSubmit={handleUpdate} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
              <select
                value={statusBaru}
                onChange={(e) => setStatusBaru(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Instansi Ditugaskan</label>
              <select
                value={instansiBaru}
                onChange={(e) => setInstansiBaru(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">-</option>
                {INSTANSI_OPTIONS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Catatan Tindak Lanjut (opsional)</label>
              <textarea
                rows={3}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="mis. Tim sudah tiba di lokasi…"
              />
            </div>

            {error && <p className="text-sm text-status-darurat">{error}</p>}

            <button
              type="submit"
              disabled={menyimpan}
              className="w-full rounded-md bg-forest-700 py-2 text-sm font-medium text-white hover:bg-forest-800 disabled:opacity-60"
            >
              {menyimpan ? 'Menyimpan…' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
