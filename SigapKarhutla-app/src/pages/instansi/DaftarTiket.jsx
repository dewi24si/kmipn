import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { KATEGORI_LABEL, STATUS_OPTIONS, WARNA_HEX, tingkatRisiko, isTerlambat, formatTanggal } from '../../utils/tiket'

export default function DaftarTiket() {
  const [tiketList, setTiketList] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('semua')
  const [filterInstansi, setFilterInstansi] = useState('semua')

  useEffect(() => {
    let cancelled = false
    supabase
      .from('tiket')
      .select('*')
      .order('dibuat_pada', { ascending: false })
      .then(({ data }) => {
        if (!cancelled) {
          setTiketList(data ?? [])
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const daftarInstansi = useMemo(
    () => Array.from(new Set(tiketList.map((t) => t.instansi_ditugaskan).filter(Boolean))).sort(),
    [tiketList],
  )

  const tampil = tiketList.filter((t) => {
    if (filterStatus !== 'semua' && t.status !== filterStatus) return false
    if (filterInstansi !== 'semua' && t.instansi_ditugaskan !== filterInstansi) return false
    return true
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-forest-800">Daftar Tiket Penanganan</h1>

      <div className="flex flex-wrap gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="semua">Semua Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={filterInstansi}
          onChange={(e) => setFilterInstansi(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="semua">Semua Instansi</option>
          {daftarInstansi.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Wilayah</th>
              <th className="px-4 py-3">Sumber</th>
              <th className="px-4 py-3">Risiko</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Instansi</th>
              <th className="px-4 py-3">Dibuat</th>
              <th className="px-4 py-3">SLA</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                  Memuat…
                </td>
              </tr>
            )}
            {!loading && tampil.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                  Tidak ada tiket yang cocok dengan filter.
                </td>
              </tr>
            )}
            {tampil.map((t) => (
              <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-forest-50">
                <td className="px-4 py-3">
                  <Link to={`/instansi/tiket/${t.id}`} className="font-medium text-forest-700 hover:underline">
                    {KATEGORI_LABEL[t.kategori] ?? t.kategori}
                  </Link>
                </td>
                <td className="px-4 py-3">{t.wilayah}</td>
                <td className="px-4 py-3 capitalize">{t.sumber}</td>
                <td className="px-4 py-3">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: WARNA_HEX[tingkatRisiko(t)] }}
                  >
                    {t.skor_risiko}
                  </span>
                </td>
                <td className="px-4 py-3">{t.status}</td>
                <td className="px-4 py-3">{t.instansi_ditugaskan ?? '-'}</td>
                <td className="px-4 py-3 text-slate-500">{formatTanggal(t.dibuat_pada)}</td>
                <td className="px-4 py-3">
                  {isTerlambat(t) ? (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-status-darurat">
                      Terlambat
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
