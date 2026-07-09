import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { wilayahTerdekat } from '../../lib/wilayah'
import { KATEGORI_LABEL } from '../../utils/tiket'
import PetaPilihLokasi from '../../components/warga/PetaPilihLokasi'

const KATEGORI_OPTIONS = ['api', 'asap', 'aktivitas_ilegal']

export default function LaporKejadian() {
  const [kategori, setKategori] = useState('api')
  const [namaPelapor, setNamaPelapor] = useState('')
  const [noHp, setNoHp] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [foto, setFoto] = useState(null)
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)
  const [lokasiStatus, setLokasiStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [nomorPelacakan, setNomorPelacakan] = useState(null)

  const ambilLokasiOtomatis = () => {
    if (!navigator.geolocation) {
      setLokasiStatus('Geolocation tidak didukung browser ini. Silakan pilih titik di peta.')
      return
    }
    setLokasiStatus('Mengambil lokasi…')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
        setLokasiStatus('Lokasi berhasil diambil otomatis.')
      },
      () => {
        setLokasiStatus('Gagal mengambil lokasi otomatis. Silakan pilih titik di peta.')
      },
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (lat == null || lng == null) {
      setError('Lokasi kejadian belum ditentukan. Gunakan tombol lokasi otomatis atau pilih titik di peta.')
      return
    }
    if (!deskripsi.trim()) {
      setError('Deskripsi wajib diisi.')
      return
    }

    setSubmitting(true)
    try {
      let fotoUrl = null
      if (foto) {
        const ext = foto.name.split('.').pop()
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage.from('laporan-foto').upload(path, foto)
        if (uploadError) throw uploadError
        fotoUrl = supabase.storage.from('laporan-foto').getPublicUrl(path).data.publicUrl
      }

      const wilayah = wilayahTerdekat(lat, lng)
      const { data, error: rpcError } = await supabase.rpc('submit_laporan_warga', {
        p_kategori: kategori,
        p_lat: lat,
        p_lng: lng,
        p_wilayah: wilayah,
        p_deskripsi: deskripsi.trim(),
        p_nama_pelapor: namaPelapor.trim() || null,
        p_no_hp: noHp.trim() || null,
        p_foto_url: fotoUrl,
      })
      if (rpcError) throw rpcError

      setNomorPelacakan(data)
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat mengirim laporan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  if (nomorPelacakan) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-forest-200 bg-forest-50 p-8 text-center">
        <h1 className="text-xl font-semibold text-forest-800">Laporan Terkirim</h1>
        <p className="text-sm text-slate-600">
          Terima kasih atas laporan Anda. Simpan nomor pelacakan berikut untuk memeriksa status laporan:
        </p>
        <p className="rounded-lg bg-white py-4 text-2xl font-bold tracking-wide text-forest-700">
          {nomorPelacakan}
        </p>
        <a href="/warga/status" className="inline-block text-sm font-medium text-forest-700 hover:underline">
          Cek status laporan sekarang &rarr;
        </a>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-forest-800">Lapor Kejadian</h1>
        <p className="mt-1 text-sm text-slate-600">
          Laporkan titik api, asap, atau aktivitas ilegal yang Anda temukan di lapangan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Kategori Kejadian</label>
          <div className="grid grid-cols-3 gap-2">
            {KATEGORI_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setKategori(opt)}
                className={`rounded-md border px-3 py-2 text-sm transition ${
                  kategori === opt
                    ? 'border-forest-600 bg-forest-600 text-white'
                    : 'border-slate-300 text-slate-700 hover:border-forest-400'
                }`}
              >
                {KATEGORI_LABEL[opt]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nama Pelapor (opsional)</label>
          <input
            type="text"
            value={namaPelapor}
            onChange={(e) => setNamaPelapor(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">No. HP (opsional, untuk cek status)</label>
          <input
            type="tel"
            value={noHp}
            onChange={(e) => setNoHp(e.target.value)}
            placeholder="0812xxxxxxx"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Foto / Video (opsional)</label>
          <input
            type="file"
            accept="image/*,video/mp4"
            onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-forest-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-forest-700"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Deskripsi Singkat</label>
          <textarea
            required
            rows={3}
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">Lokasi Kejadian</label>
            <button
              type="button"
              onClick={ambilLokasiOtomatis}
              className="text-xs font-medium text-forest-700 hover:underline"
            >
              Gunakan lokasi saya
            </button>
          </div>
          <PetaPilihLokasi lat={lat} lng={lng} onPilih={(la, ln) => { setLat(la); setLng(ln); setLokasiStatus('Lokasi dipilih dari peta.') }} />
          <p className="mt-1 text-xs text-slate-500">
            {lokasiStatus || 'Klik tombol "Gunakan lokasi saya" atau klik langsung di peta untuk menandai lokasi.'}
          </p>
        </div>

        {error && <p className="text-sm text-status-darurat">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-ember-500 py-2.5 text-sm font-medium text-white transition hover:bg-ember-600 disabled:opacity-60"
        >
          {submitting ? 'Mengirim…' : 'Kirim Laporan'}
        </button>
      </form>
    </div>
  )
}
