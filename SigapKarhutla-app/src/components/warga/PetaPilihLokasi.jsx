import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from 'react-leaflet'
import { RIAU_MAP_CENTER, RIAU_MAP_ZOOM } from '../../lib/wilayah'

function KlikUntukPilih({ onPilih }) {
  useMapEvents({
    click(e) {
      onPilih(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function RecenterOnChange({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    if (lat != null && lng != null) {
      map.setView([lat, lng], Math.max(map.getZoom(), 12))
    }
  }, [lat, lng, map])
  return null
}

export default function PetaPilihLokasi({ lat, lng, onPilih, height = 280 }) {
  const center = lat != null && lng != null ? [lat, lng] : RIAU_MAP_CENTER

  return (
    <div style={{ height }} className="overflow-hidden rounded-xl border border-slate-200">
      <MapContainer center={center} zoom={lat != null ? 12 : RIAU_MAP_ZOOM} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <KlikUntukPilih onPilih={onPilih} />
        <RecenterOnChange lat={lat} lng={lng} />
        {lat != null && lng != null && (
          <CircleMarker
            center={[lat, lng]}
            radius={10}
            pathOptions={{ color: '#ea380a', fillColor: '#ff7133', fillOpacity: 0.9, weight: 2 }}
          />
        )}
      </MapContainer>
    </div>
  )
}
