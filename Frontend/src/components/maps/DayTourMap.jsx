import { useEffect, useMemo, useState } from 'react';
import { CircleDot, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  isCoordinateInSriLanka,
  SRI_LANKA_BOUNDS,
  SRI_LANKA_CENTER,
  SRI_LANKA_DEFAULT_ZOOM,
} from '../../utils/sriLankaMap';

function createPlaceIcon(sequence, isActive, pinSize) {
  const isMicro = pinSize === 'micro';
  const isCompact = pinSize === 'compact';
  const iconSize = isMicro ? [24, 24] : isCompact ? [34, 34] : [44, 44];
  const iconAnchor = isMicro ? [12, 23] : isCompact ? [17, 32] : [22, 42];
  const popupAnchor = isMicro ? [0, -22] : isCompact ? [0, -28] : [0, -36];

  return L.divIcon({
    className: `yogo-theme-route-pin ${
      isActive ? 'yogo-theme-route-pin-active' : ''
    } ${isCompact || isMicro ? 'yogo-theme-route-pin-compact' : ''} ${
      isMicro ? 'yogo-theme-route-pin-micro' : ''
    }`,
    html: `<span>${sequence}</span>`,
    iconSize,
    iconAnchor,
    popupAnchor,
  });
}

function getCoordinate(place) {
  if (!place) return null;

  const latitude = Number(place.latitude);
  const longitude = Number(place.longitude);

  if (!isCoordinateInSriLanka(latitude, longitude)) return null;

  return [latitude, longitude];
}

function canUseMap(map) {
  const container = map?.getContainer?.();
  const mapPane = map?.getPane?.('mapPane');

  return Boolean(container?.isConnected && mapPane);
}

function warnSkippedMapUpdate(error) {
  if (import.meta.env.DEV) {
    console.warn('Skipped stale Day Tour map update.', error);
  }
}

function useIsMobileMap() {
  const [isMobileMap, setIsMobileMap] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 640px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(max-width: 640px)');
    const handleChange = () => setIsMobileMap(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isMobileMap;
}

function MapFocus({ activePlace, coordinates, fitRouteToBounds, isMobileMap }) {
  const map = useMap();
  const coordinateKey = coordinates
    .map((coordinate) => coordinate?.join(','))
    .join('|');

  useEffect(() => {
    const timeoutIds = [80, 220, 480].map((delay) => window.setTimeout(() => {
      try {
        if (canUseMap(map)) map.invalidateSize();
      } catch (error) {
        warnSkippedMapUpdate(error);
      }
    }, delay));

    return () => timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
  }, [coordinateKey, isMobileMap, map]);

  useEffect(() => {
    const container = map?.getContainer?.();
    if (!container || typeof ResizeObserver === 'undefined') return undefined;

    const resizeObserver = new ResizeObserver(() => {
      try {
        if (!canUseMap(map)) return;
        map.invalidateSize({ pan: false });
      } catch (error) {
        warnSkippedMapUpdate(error);
      }
    });

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [map]);

  useEffect(() => {
    if (!canUseMap(map)) return;

    const activeCoordinate = getCoordinate(activePlace);

    try {
      if (!fitRouteToBounds) {
        map.fitBounds(SRI_LANKA_BOUNDS, {
          animate: true,
          duration: 1,
          padding: isMobileMap ? [6, 6] : [18, 18],
        });
        return;
      }

      if (activeCoordinate) {
        map.flyTo(activeCoordinate, isMobileMap ? 12 : 14, {
          animate: true,
          duration: 0.85,
        });
        return;
      }

      if (coordinates.length > 1) {
        map.flyToBounds(coordinates, {
          animate: true,
          duration: 1,
          maxZoom: isMobileMap ? 12 : 13,
          padding: isMobileMap ? [26, 22] : [44, 44],
        });
        return;
      }

      if (coordinates.length === 1) {
        map.flyTo(coordinates[0], isMobileMap ? 11 : 13, {
          animate: true,
          duration: 0.85,
        });
        return;
      }

      map.fitBounds(SRI_LANKA_BOUNDS, {
        animate: true,
        duration: 1,
        padding: isMobileMap ? [6, 6] : [18, 18],
      });
    } catch (error) {
      warnSkippedMapUpdate(error);
    }
  }, [activePlace, coordinateKey, coordinates, fitRouteToBounds, isMobileMap, map]);

  return null;
}

export default function DayTourMap({
  activePlace,
  containerClassName = '',
  fitRouteToBounds = false,
  onPlaceSelect,
  places = [],
  scrollWheelZoom = false,
}) {
  const isMobileMap = useIsMobileMap();
  const pinPlaces = useMemo(
    () => places.filter((place) => getCoordinate(place)),
    [places],
  );
  const coordinates = useMemo(
    () => pinPlaces.map((place) => getCoordinate(place)),
    [pinPlaces],
  );
  const effectivePinSize = isMobileMap ? 'micro' : 'compact';
  const tooltipOffset = isMobileMap ? [0, -20] : [0, -28];
  const defaultContainerClassName =
    'relative h-[260px] w-full max-w-full overflow-hidden rounded-xl border border-[#283A2C]/10 bg-[#283A2C] shadow-[0_28px_90px_rgba(40,58,44,0.20)] sm:h-[28rem] md:h-[30rem] xl:h-[33rem]';

  return (
    <div className={`${containerClassName || defaultContainerClassName} min-w-0`}>
      <MapContainer
        center={SRI_LANKA_CENTER}
        className="h-full w-full max-w-full"
        maxBounds={SRI_LANKA_BOUNDS}
        maxBoundsViscosity={1}
        minZoom={isMobileMap ? 6 : SRI_LANKA_DEFAULT_ZOOM}
        scrollWheelZoom={scrollWheelZoom}
        style={{ maxWidth: '100%', width: '100%' }}
        zoom={isMobileMap ? 6 : SRI_LANKA_DEFAULT_ZOOM}
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFocus
          activePlace={activePlace}
          coordinates={coordinates}
          fitRouteToBounds={fitRouteToBounds}
          isMobileMap={isMobileMap}
        />

        {coordinates.length > 1 && (
          <>
            <Polyline
              positions={coordinates}
              pathOptions={{
                color: '#050505',
                opacity: 0.42,
                weight: 9,
              }}
            />
            <Polyline
              positions={coordinates}
              className="yogo-route-line"
              pathOptions={{
                color: '#d7bd8b',
                dashArray: '12 16',
                lineCap: 'round',
                opacity: 0.96,
                weight: 4,
              }}
            />
          </>
        )}

        {pinPlaces.map((place, index) => {
          const isActive = activePlace?._id === place._id;

          return (
            <Marker
              key={place._id || `${place.name}-${index}`}
              eventHandlers={{
                click: () => onPlaceSelect(place),
                mouseover: () => onPlaceSelect(place),
              }}
              icon={createPlaceIcon(index + 1, isActive, effectivePinSize)}
              position={[Number(place.latitude), Number(place.longitude)]}
            >
              <Tooltip
                className="yogo-theme-map-tooltip"
                direction="top"
                offset={tooltipOffset}
                opacity={1}
              >
                <div className="w-56 overflow-hidden rounded-md bg-obsidian text-pearl">
                  {place.image && (
                    <img
                      src={place.image}
                      alt={place.name}
                      className="h-24 w-full object-cover"
                    />
                  )}
                  <div className="p-3">
                    <p className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-champagne">
                      Place {index + 1}
                    </p>
                    <h4 className="mt-1 font-display text-xl font-semibold">
                      {place.name}
                    </h4>
                    {place.description && (
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-pearl/66">
                        {place.description}
                      </p>
                    )}
                  </div>
                </div>
              </Tooltip>

              <Popup className="yogo-map-popup">
                <div className="w-72 overflow-hidden rounded-md bg-obsidian text-pearl">
                  {place.image && (
                    <img
                      src={place.image}
                      alt={place.name}
                      className="h-36 w-full object-cover"
                    />
                  )}
                  <div className="p-4">
                    <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-champagne">
                      Day Tour Stop
                    </p>
                    <h4 className="mt-2 font-display text-2xl font-semibold">
                      {place.name}
                    </h4>
                    {place.description && (
                      <p className="mt-2 text-xs leading-5 text-pearl/66">
                        {place.description}
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <motion.div
        key={`${pinPlaces.length}-${activePlace?._id || 'idle'}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="pointer-events-none absolute right-3 top-3 z-[500] flex max-w-[calc(100%_-_4.5rem)] flex-col items-end gap-1.5 md:bottom-4 md:left-4 md:right-4 md:top-auto md:max-w-full md:flex-row md:flex-wrap md:items-stretch md:gap-2"
      >
        <div className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-black/76 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-pearl backdrop-blur-md sm:gap-2 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.16em]">
          <MapPin size={15} className="text-champagne" />
          {pinPlaces.length} places
        </div>
        {activePlace && (
          <div className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-pearl px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.12em] text-obsidian sm:gap-2 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.16em]">
            <CircleDot size={15} />
            <span className="max-w-[11rem] truncate sm:max-w-none">
              {activePlace.name}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
