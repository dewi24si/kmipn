export const KATEGORI_LABEL = {
  api: 'Api',
  asap: 'Asap',
  aktivitas_ilegal: 'Aktivitas Ilegal',
  hotspot_satelit: 'Hotspot Satelit',
}

export const STATUS_OPTIONS = ['Baru', 'Diverifikasi', 'Ditindaklanjuti', 'Selesai']

export const WARNA_HEX = {
  aman: '#2e633c',
  waspada: '#d69e0a',
  darurat: '#dc2626',
}

export function tingkatRisiko(tiket) {
  if (tiket.status === 'Selesai') return 'aman'
  if (tiket.darurat) return 'darurat'
  return 'waspada'
}

export function isTerlambat(tiket) {
  return tiket.status === 'Baru' && new Date(tiket.sla_deadline).getTime() < Date.now()
}

export function formatTanggal(iso) {
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDurasi(ms) {
  const menit = Math.round(ms / 60000)
  if (menit < 60) return `${menit} menit`
  const jam = Math.floor(menit / 60)
  const sisaMenit = menit % 60
  if (jam < 24) return `${jam} jam ${sisaMenit} menit`
  const hari = Math.floor(jam / 24)
  return `${hari} hari ${jam % 24} jam`
}
