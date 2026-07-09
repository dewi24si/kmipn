import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import PetaTiket from '../../components/shared/PetaTiket'
import { KATEGORI_LABEL, WARNA_HEX, tingkatRisiko, isTerlambat, formatTanggal } from '../../utils/tiket'

function tanggalKe7Hari() {
  const hasil = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    hasil.push(d.toISOString().slice(0, 10))
  }
  return hasil
}

export default function DashboardKomando() {
  const { profile } = useAuth()
  const [tiketList, setTiketList] = useState([])
  const [hotspotList, setHotspotList] = useState([])
  const [laporanTerbaru, setLaporanTerbaru] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const tujuhHariLalu = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
      const [tiketRes, hotspotRes, laporanRes] = await Promise.all([
        supabase.from('tiket').select('*').order('dibuat_pada', { ascending: false }),
        supabase.from('hotspot_dummy').select('*').gte('tanggal', tujuhHariLalu),
        supabase
          .from('laporan_warga')
          .select('*, tiket:tiket_id(id, kategori, wilayah, status, skor_risiko, darurat)')
          .order('dibuat_pada', { ascending: false })
          .limit(6),
      ])
      if (cancelled) return
      setTiketList(tiketRes.data ?? [])
      setHotspotList(hotspotRes.data ?? [])
      setLaporanTerbaru(laporanRes.data ?? [])
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const jumlahAktif = tiketList.filter((t) => t.status !== 'Selesai').length
  const jumlahDarurat = tiketList.filter((t) => tingkatRisiko(t) === 'darurat').length
  const jumlahTerlambat = tiketList.filter(isTerlambat).length

  const tren = tanggalKe7Hari().map((tgl) => ({
    tanggal: new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    jumlah: hotspotList.filter((h) => h.tanggal === tgl).length,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-forest-800">Dashboard Komando</h1>
        <p className="mt-1 text-sm text-slate-600">
          {profile?.nama ? `Selamat datang, ${profile.nama}.` : 'Selamat datang.'} Ringkasan situasi karhutla wilayah Riau.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Tiket aktif</p>
          <p className="mt-1 text-2xl font-semibold text-forest-800">{loading ? '…' : jumlahAktif}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Status darurat</p>
          <p className="mt-1 text-2xl font-semibold text-status-darurat">{loading ? '…' : jumlahDarurat}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Terlambat (lewat SLA)</p>
          <p className="mt-1 text-2xl font-semibold text-status-waspada">{loading ? '…' : jumlahTerlambat}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-2 text-lg font-semibold text-forest-800">Peta Risiko Wilayah</h2>
          <PetaTiket tiketList={tiketList} hotspotList={hotspotList} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-forest-800">Laporan Warga Terbaru</h2>
          <div className="space-y-3">
            {laporanTerbaru.length === 0 && !loading && (
              <p className="text-sm text-slate-400">Belum ada laporan.</p>
            )}
            {laporanTerbaru.map((l) => (
              <Link
                key={l.id}
                to={`/instansi/tiket/${l.tiket_id}`}
                className="block rounded-lg border border-slate-100 p-2.5 text-sm hover:border-forest-300 hover:bg-forest-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-forest-800">
                    {KATEGORI_LABEL[l.tiket?.kategori] ?? l.tiket?.kategori}
                  </span>
                  {l.tiket && (
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: WARNA_HEX[tingkatRisiko(l.tiket)] }}
                    >
                      {l.tiket.status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {l.tiket?.wilayah} &middot; {formatTanggal(l.dibuat_pada)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-forest-800">Tren Titik Panas 7 Hari Terakhir</h2>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tren}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e4e7" />
              <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="jumlah" name="Titik panas" stroke="#2e633c" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
