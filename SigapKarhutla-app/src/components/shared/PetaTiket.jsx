import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { RIAU_MAP_CENTER, RIAU_MAP_ZOOM } from '../../lib/wilayah'
import { KATEGORI_LABEL, WARNA_HEX, tingkatRisiko, formatTanggal } from '../../utils/tiket'

export default function PetaTiket({ tiketList = [], hotspotList = [], height = 420 }) {
  return (
    <div style={{ height }} className="overflow-hidden rounded-xl border border-slate-200">
      <MapContainer center={RIAU_MAP_CENTER} zoom={RIAU_MAP_ZOOM} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {hotspotList.map((h) => (
          <CircleMarker
            key={`hotspot-${h.id}`}
            center={[h.lokasi_lat, h.lokasi_lng]}
            radius={4}
            pathOptions={{ color: '#ea380a', fillColor: '#ff9c65', fillOpacity: 0.6, weight: 1 }}
          >
            <Popup>
              <strong>Titik Panas Satelit</strong>
              <br />
              {h.wilayah} &middot; {h.tanggal}
              <br />
              Confidence: {h.confidence ?? '-'}%
            </Popup>
          </CircleMarker>
        ))}

        {tiketList.map((t) => {
          const warna = WARNA_HEX[tingkatRisiko(t)]
          return (
            <CircleMarker
              key={t.id}
              center={[t.lokasi_lat, t.lokasi_lng]}
              radius={9}
              pathOptions={{ color: warna, fillColor: warna, fillOpacity: 0.85, weight: 2 }}
            >
              <Popup>
                <strong>{KATEGORI_LABEL[t.kategori] ?? t.kategori}</strong> &middot; {t.wilayah}
                <br />
                Status: {t.status}
                <br />
                Skor risiko: {t.skor_risiko}
                <br />
                {formatTanggal(t.dibuat_pada)}
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
