import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import PetaTiket from '../../components/shared/PetaTiket'
import { WILAYAH_RIAU } from '../../lib/wilayah'
import { formatDurasi, tingkatRisiko } from '../../utils/tiket'

const ISPU_DUMMY = {
  'Rokan Hilir': { label: 'Sedang', nilai: 62, warna: 'text-amber-600 bg-amber-50 border-amber-200' },
  Bengkalis: { label: 'Tidak Sehat', nilai: 118, warna: 'text-status-darurat bg-red-50 border-red-200' },
  Dumai: { label: 'Sedang', nilai: 71, warna: 'text-amber-600 bg-amber-50 border-amber-200' },
  Pekanbaru: { label: 'Baik', nilai: 38, warna: 'text-forest-700 bg-forest-50 border-forest-200' },
}

export default function Beranda() {
  const [tiketList, setTiketList] = useState([])
  const [hotspotList, setHotspotList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [tiketRes, hotspotRes] = await Promise.all([
        supabase.from('tiket').select('*').order('dibuat_pada', { ascending: false }),
        supabase.from('hotspot_dummy').select('*').gte('tanggal', new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)),
      ])
      if (cancelled) return
      setTiketList(tiketRes.data ?? [])
      setHotspotList(hotspotRes.data ?? [])
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const jumlahDarurat = tiketList.filter((t) => tingkatRisiko(t) === 'darurat').length
  const jumlahAktif = tiketList.filter((t) => t.status !== 'Selesai').length

  const selesai = tiketList.filter((t) => t.status === 'Selesai')
  const rataRataRespons =
    selesai.length > 0
      ? selesai.reduce((sum, t) => sum + (new Date(t.diperbarui_pada) - new Date(t.dibuat_pada)), 0) / selesai.length
      : null

  const laporanBulanIni = tiketList.filter((t) => {
    const d = new Date(t.dibuat_pada)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-forest-800 px-6 py-8 text-white">
        <h1 className="text-2xl font-semibold">Dashboard Transparansi Publik</h1>
        <p className="mt-1 text-forest-100">
          Pantau status wilayah rawan karhutla di Provinsi Riau secara real-time.
        </p>
      </section>

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
          <p className="text-sm text-slate-500">Laporan warga bulan ini</p>
          <p className="mt-1 text-2xl font-semibold text-forest-800">{loading ? '…' : laporanBulanIni}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-2 text-lg font-semibold text-forest-800">Peta Status Wilayah</h2>
          <PetaTiket tiketList={tiketList} hotspotList={hotspotList} />
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-status-aman" /> Aman
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-status-waspada" /> Waspada
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-status-darurat" /> Darurat
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-ember-300" /> Titik panas satelit
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-forest-800">Indeks Kualitas Udara (ISPU)</h2>
            <div className="space-y-2">
              {WILAYAH_RIAU.map((w) => {
                const info = ISPU_DUMMY[w.nama]
                return (
                  <div
                    key={w.nama}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${info.warna}`}
                  >
                    <span className="font-medium">{w.nama}</span>
                    <span>
                      {info.label} &middot; {info.nilai}
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-slate-400">*Data simulasi untuk keperluan demo.</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-forest-800">Rata-rata Waktu Respons</h2>
            <p className="mt-1 text-2xl font-semibold text-forest-700">
              {loading ? '…' : rataRataRespons != null ? formatDurasi(rataRataRespons) : '-'}
            </p>
            <p className="mt-1 text-xs text-slate-400">Dihitung dari tiket yang sudah selesai ditangani.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
