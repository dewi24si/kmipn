import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { KATEGORI_LABEL, formatTanggal, tingkatRisiko, WARNA_HEX } from '../../utils/tiket'

export default function CekStatus() {
  const [mode, setMode] = useState('nomor')
  const [nilai, setNilai] = useState('')
  const [hasil, setHasil] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setHasil(null)
    if (!nilai.trim()) {
      setError('Masukkan nomor pelacakan atau nomor HP.')
      return
    }

    setLoading(true)
    const params =
      mode === 'nomor'
        ? { p_nomor_pelacakan: nilai.trim(), p_no_hp: null }
        : { p_nomor_pelacakan: null, p_no_hp: nilai.trim() }

    const { data, error: rpcError } = await supabase.rpc('cek_status_laporan', params)
    setLoading(false)

    if (rpcError) {
      setError('Terjadi kesalahan saat mencari laporan. Silakan coba lagi.')
      return
    }
    if (!data || data.length === 0) {
      setError('Laporan tidak ditemukan. Periksa kembali nomor pelacakan atau nomor HP Anda.')
      return
    }
    setHasil(data)
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-forest-800">Cek Status Laporan</h1>
        <p className="mt-1 text-sm text-slate-600">
          Masukkan nomor pelacakan atau nomor HP untuk melihat status terkini laporan Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setMode('nomor')}
            className={`rounded-md border px-3 py-1.5 ${mode === 'nomor' ? 'border-forest-600 bg-forest-600 text-white' : 'border-slate-300 text-slate-600'}`}
          >
            Nomor Pelacakan
          </button>
          <button
            type="button"
            onClick={() => setMode('hp')}
            className={`rounded-md border px-3 py-1.5 ${mode === 'hp' ? 'border-forest-600 bg-forest-600 text-white' : 'border-slate-300 text-slate-600'}`}
          >
            Nomor HP
          </button>
        </div>

        <input
          type="text"
          value={nilai}
          onChange={(e) => setNilai(e.target.value)}
          placeholder={mode === 'nomor' ? 'SGP-20260709-XXXX' : '0812xxxxxxx'}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500"
        />

        {error && <p className="text-sm text-status-darurat">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-forest-700 py-2 text-sm font-medium text-white hover:bg-forest-800 disabled:opacity-60"
        >
          {loading ? 'Mencari…' : 'Cek Status'}
        </button>
      </form>

      {hasil && (
        <div className="space-y-3">
          {hasil.map((h) => (
            <div key={h.nomor_pelacakan} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-forest-700">{h.nomor_pelacakan}</span>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: WARNA_HEX[tingkatRisiko(h)] }}
                >
                  {h.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {KATEGORI_LABEL[h.kategori] ?? h.kategori} &middot; {h.wilayah}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Dilaporkan {formatTanggal(h.dibuat_pada)} &middot; Diperbarui {formatTanggal(h.diperbarui_pada)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
