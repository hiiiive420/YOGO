import { useEffect, useMemo, useState } from 'react';
import { CircleDot, MapPin, Route } from 'lucide-react';
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

function createThemePinIcon(sequence, isActive, pinSize) {
  const isMicro = pinSize === 'micro';
  const isCompact = pinSize === 'compact';
  const iconSize = isMicro ? [28, 28] : isCompact ? [34, 34] : [46, 46];
  const iconAnchor = isMicro ? [14, 26] : isCompact ? [17, 32] : [23, 44];
  const popupAnchor = isMicro ? [0, -24] : isCompact ? [0, -28] : [0, -38];

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

function getCoordinate(stop) {
  if (!stop) return null;

  const latitude = Number(stop.latitude);
  const longitude = Number(stop.longitude);

  if (!isCoordinateInSriLanka(latitude, longitude)) return null;

  return [latitude, longitude];
}

function isCoordinate(coordinate) {
  return (
    Array.isArray(coordinate) &&
    coordinate.length === 2 &&
    coordinate.every((value) => Number.isFinite(Number(value)))
  );
}

function canUseMap(map) {
  const container = map?.getContainer?.();
  const mapPane = map?.getPane?.('mapPane');

  return Boolean(container?.isConnected && mapPane);
}

function warnSkippedMapUpdate(error) {
  if (import.meta.env.DEV) {
    console.warn('Skipped stale Leaflet map focus update.', error);
  }
}

function useIsMobileMap() {
  const [isMobileMap, setIsMobileMap] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 768px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleChange = () => setIsMobileMap(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isMobileMap;
}

function MapFocus({
  activeStop,
  coordinates,
  fitRouteToBounds,
  fitRouteToBoundsOnMobile,
  isMobileMap,
}) {
  const map = useMap();
  const coordinateKey = coordinates
    .map((coordinate) => coordinate?.join(','))
    .join('|');
  const shouldFitRoute =
    fitRouteToBounds || (fitRouteToBoundsOnMobile && isMobileMap);

  useEffect(() => {
    const timeoutIds = [80, 220, 480].map((delay) => window.setTimeout(() => {
      try {
        if (!canUseMap(map)) return;

        map.invalidateSize();
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

    const activeCoordinate = getCoordinate(activeStop);
    const validCoordinates = coordinates.filter(isCoordinate);

    try {
      if (activeCoordinate) {
        map.flyTo(activeCoordinate, isMobileMap ? 8 : 11, {
          animate: true,
          duration: 1,
        });
        return;
      }

      if (shouldFitRoute && validCoordinates.length > 1) {
        map.flyToBounds(validCoordinates, {
          animate: true,
          duration: 1.15,
          maxZoom: isMobileMap ? 8 : 10,
          padding: isMobileMap ? [28, 24] : [46, 46],
        });
        return;
      }

      if (shouldFitRoute && validCoordinates.length === 1) {
        map.flyTo(validCoordinates[0], isMobileMap ? 8 : 10, {
          animate: true,
          duration: 1,
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
  }, [
    activeStop,
    coordinateKey,
    coordinates,
    isMobileMap,
    map,
    shouldFitRoute,
  ]);

  return null;
}

export default function TravelThemeRouteMap({
  activeStop,
  containerClassName = '',
  daysStatus = 'idle',
  fitRouteToBounds = true,
  fitRouteToBoundsOnMobile = false,
  onStopSelect,
  pinSize = 'default',
  stops = [],
}) {
  const isMobileMap = useIsMobileMap();
  const routeStops = useMemo(
    () => stops.filter((stop) => getCoordinate(stop)),
    [stops],
  );
  const coordinates = useMemo(
    () => routeStops.map((stop) => getCoordinate(stop)),
    [routeStops],
  );
  const maxDay = useMemo(
    () => Math.max(0, ...routeStops.map((stop) => Number(stop.dayNumber) || 0)),
    [routeStops],
  );
  const effectivePinSize = isMobileMap ? 'micro' : pinSize;
  const markerTooltipOffset =
    effectivePinSize === 'micro'
      ? [0, -22]
      : effectivePinSize === 'compact'
        ? [0, -26]
        : [0, -34];
  const defaultContainerClassName =
    'relative h-[34rem] overflow-hidden rounded-lg border border-white/10 bg-black shadow-luxury sm:h-[38rem] xl:h-[calc(100vh-14rem)] xl:min-h-[42rem]';

  return (
    <div
      data-mobile-map
      className={`${containerClassName || defaultContainerClassName} min-w-0`}
    >
      <MapContainer
        center={SRI_LANKA_CENTER}
        className="h-full w-full max-w-full"
        maxBounds={SRI_LANKA_BOUNDS}
        maxBoundsViscosity={1}
        minZoom={isMobileMap ? 6 : SRI_LANKA_DEFAULT_ZOOM}
        boxZoom={!isMobileMap}
        doubleClickZoom={!isMobileMap}
        dragging={!isMobileMap}
        keyboard={!isMobileMap}
        scrollWheelZoom={!isMobileMap}
        style={{ maxWidth: '100%', width: '100%' }}
        touchZoom={isMobileMap ? 'center' : false}
        zoom={isMobileMap ? 6 : SRI_LANKA_DEFAULT_ZOOM}
        zoomControl={!isMobileMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFocus
          activeStop={activeStop}
          coordinates={coordinates}
          fitRouteToBounds={fitRouteToBounds}
          fitRouteToBoundsOnMobile={fitRouteToBoundsOnMobile}
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

        {routeStops.map((stop, index) => {
          const isActive = activeStop?.id === stop.id;

          return (
            <Marker
              key={stop.id}
              eventHandlers={{
                click: () => onStopSelect(stop),
              }}
              icon={createThemePinIcon(
                stop.dayNumber || index + 1,
                isActive,
                effectivePinSize,
              )}
              position={[stop.latitude, stop.longitude]}
            >
              <Tooltip
                className="yogo-theme-map-tooltip"
                direction="top"
                offset={markerTooltipOffset}
                opacity={1}
              >
                <div className="w-52 overflow-hidden rounded-md bg-obsidian text-pearl">
                  {stop.image && (
                    <img
                      src={stop.image}
                      alt={stop.name}
                      className="h-24 w-full object-cover"
                    />
                  )}
                  <div className="p-3">
                    <p className="text-[0.62rem] font-black uppercase tracking-[0.22em] text-champagne">
                      Day {stop.dayNumber}
                    </p>
                    <h4 className="mt-1 font-display text-xl font-semibold">
                      {stop.name}
                    </h4>
                    {stop.description && (
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-pearl/66">
                        {stop.description}
                      </p>
                    )}
                  </div>
                </div>
              </Tooltip>

              <Popup className="yogo-map-popup">
                <div className="w-72 overflow-hidden rounded-md bg-obsidian text-pearl">
                  {stop.image && (
                    <img
                      src={stop.image}
                      alt={stop.name}
                      className="h-36 w-full object-cover"
                    />
                  )}
                  <div className="p-4">
                    <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-champagne">
                      Day {stop.dayNumber}
                    </p>
                    <h4 className="mt-2 font-display text-2xl font-semibold">
                      {stop.name}
                    </h4>
                    {stop.description && (
                      <p className="mt-2 text-xs leading-5 text-pearl/66">
                        {stop.description}
                      </p>
                    )}
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-pearl/40">
                        {stop.dayTitle}
                      </p>
                      {stop.daySummary && (
                        <p className="mt-2 text-xs leading-5 text-pearl/64">
                          {stop.daySummary}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <motion.div
        key={`${routeStops.length}-${activeStop?.id || 'idle'}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="pointer-events-none absolute bottom-3 left-3 right-3 z-[500] flex max-w-full flex-wrap gap-1.5 sm:bottom-4 sm:left-4 sm:right-4 sm:gap-2"
      >
        <div className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-black/76 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-pearl backdrop-blur-md sm:gap-2 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.16em]">
          <Route size={15} className="text-champagne" />
          {daysStatus === 'loading' ? 'Loading route' : `${routeStops.length} stops`}
        </div>
        <div className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-black/76 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-pearl backdrop-blur-md sm:gap-2 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.16em]">
          <CircleDot size={15} className="text-champagne" />
          {maxDay > 0 ? `${maxDay} days` : 'No days'}
        </div>
        {activeStop && (
          <div className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-pearl px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.12em] text-obsidian sm:gap-2 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.16em]">
            <MapPin size={15} />
            Day {activeStop.dayNumber}
          </div>
        )}
      </motion.div>
    </div>
  );
}
