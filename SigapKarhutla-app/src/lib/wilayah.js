export const WILAYAH_RIAU = [
  { nama: 'Rokan Hilir', lat: 2.1, lng: 100.85 },
  { nama: 'Bengkalis', lat: 1.45, lng: 102.1 },
  { nama: 'Dumai', lat: 1.65, lng: 101.45 },
  { nama: 'Pekanbaru', lat: 0.53, lng: 101.45 },
]

export const RIAU_MAP_CENTER = [1.3, 101.4]
export const RIAU_MAP_ZOOM = 8

export function wilayahTerdekat(lat, lng) {
  let terdekat = WILAYAH_RIAU[0]
  let jarakMin = Infinity
  for (const w of WILAYAH_RIAU) {
    const jarak = (w.lat - lat) ** 2 + (w.lng - lng) ** 2
    if (jarak < jarakMin) {
      jarakMin = jarak
      terdekat = w
    }
  }
  return terdekat.nama
}
