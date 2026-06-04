import { useEffect, useMemo } from 'react';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  isCoordinateInSriLanka,
  SRI_LANKA_BOUNDS,
  SRI_LANKA_CENTER,
  SRI_LANKA_DEFAULT_ZOOM,
} from '../../../utils/sriLankaMap';

const adminPinIcon = L.divIcon({
  className: 'yogo-admin-location-pin',
  html: '<span></span>',
  iconSize: [34, 46],
  iconAnchor: [17, 43],
  popupAnchor: [0, -40],
});

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      if (!isCoordinateInSriLanka(event.latlng.lat, event.latlng.lng)) return;

      onSelect(event.latlng);
    },
  });

  return null;
}

function MapPositionSync({ position }) {
  const map = useMap();

  useEffect(() => {
    window.setTimeout(() => map.invalidateSize(), 120);
  }, [map]);

  useEffect(() => {
    if (!position) {
      map.fitBounds(SRI_LANKA_BOUNDS, {
        animate: true,
        duration: 0.45,
        padding: [18, 18],
      });
      return;
    }

    map.setView(position, Math.max(map.getZoom(), 10), {
      animate: true,
      duration: 0.45,
    });
  }, [map, position]);

  return null;
}

export default function LocationMapPicker({
  onPositionChange,
  position,
}) {
  const mapCenter = useMemo(() => position || SRI_LANKA_CENTER, [position]);

  function handleMarkerDragEnd(event) {
    const nextPosition = event.target.getLatLng();

    if (!isCoordinateInSriLanka(nextPosition.lat, nextPosition.lng)) return;

    onPositionChange(nextPosition);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-black/10 bg-obsidian">
      <div className="relative h-[26rem] min-h-[22rem]">
        <MapContainer
          center={mapCenter}
          className="h-full w-full"
          maxBounds={SRI_LANKA_BOUNDS}
          maxBoundsViscosity={1}
          minZoom={SRI_LANKA_DEFAULT_ZOOM}
          scrollWheelZoom
          zoom={position ? 10 : SRI_LANKA_DEFAULT_ZOOM}
          zoomControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onSelect={onPositionChange} />
          <MapPositionSync position={position} />

          {position && (
            <Marker
              draggable
              eventHandlers={{ dragend: handleMarkerDragEnd }}
              icon={adminPinIcon}
              position={position}
            />
          )}
        </MapContainer>

        <div className="pointer-events-none absolute left-4 top-4 z-[500] flex flex-wrap gap-2">
          <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-black/72 px-4 text-xs font-black uppercase tracking-[0.16em] text-pearl shadow-lg backdrop-blur-md">
            <MapPin size={15} className="text-champagne" />
            {position ? 'Pin selected' : 'Click map to place pin'}
          </span>
        </div>

        <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-[500] rounded-lg bg-black/72 px-4 py-3 text-xs font-bold leading-5 text-pearl shadow-lg backdrop-blur-md sm:left-auto sm:max-w-xs">
          Search a place, click the map, or drag the pin to refine the exact
          location.
        </div>
      </div>
    </div>
  );
}
