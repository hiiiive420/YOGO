import { useEffect, useMemo, useState } from 'react';
import { CircleDot, MapPin, Navigation2, Route } from 'lucide-react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  isCoordinateInSriLanka,
  SRI_LANKA_BOUNDS,
  SRI_LANKA_CENTER,
  SRI_LANKA_DEFAULT_ZOOM,
} from '../../utils/sriLankaMap';

function createPinIcon(sequence, isActive) {
  return L.divIcon({
    className: `yogo-route-pin ${isActive ? 'yogo-route-pin-active' : ''}`,
    html: `<span>${sequence}</span>`,
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -36],
  });
}

function createJournalPinIcon(isActive) {
  return L.divIcon({
    className: `yogo-journal-pin ${isActive ? 'yogo-journal-pin-active' : ''}`,
    html: '<span></span>',
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -30],
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
    console.warn('Skipped stale Leaflet map story update.', error);
  }
}

function FlyToStory({ activeStop, coordinates }) {
  const map = useMap();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        if (!canUseMap(map)) return;

        map.invalidateSize();
      } catch (error) {
        warnSkippedMapUpdate(error);
      }
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [map]);

  useEffect(() => {
    if (!canUseMap(map)) return;

    const activeCoordinate = getCoordinate(activeStop);
    const validCoordinates = coordinates.filter(isCoordinate);

    try {
      if (activeCoordinate) {
        map.flyTo(activeCoordinate, 11, {
          animate: true,
          duration: 1.25,
        });
        return;
      }

      if (validCoordinates.length > 1) {
        map.flyToBounds(validCoordinates, {
          animate: true,
          duration: 1.4,
          padding: [42, 42],
        });
        return;
      }

      if (validCoordinates.length === 1) {
        map.flyTo(validCoordinates[0], 10, {
          animate: true,
          duration: 1.15,
        });
      }
    } catch (error) {
      warnSkippedMapUpdate(error);
    }
  }, [activeStop, coordinates, map]);

  return null;
}

export default function CinematicSriLankaMap({
  connectStops = true,
  description = 'Pins and routes are generated from connected locations.',
  emptyMessage = 'Connected locations will appear here once they are selected in admin.',
  kicker = 'Interactive map',
  routeStops,
  showMapMeta = true,
  showSequence = true,
  stops = [],
  title = 'Sri Lanka route story.',
  variant = 'cinematic',
}) {
  const pinStops = useMemo(
    () => stops.filter((stop) => getCoordinate(stop)),
    [stops],
  );
  const orderedRouteStops = useMemo(() => {
    const source = routeStops?.length ? routeStops : pinStops;
    return source.filter((stop) => getCoordinate(stop));
  }, [pinStops, routeStops]);
  const coordinates = useMemo(
    () => orderedRouteStops.map((stop) => getCoordinate(stop)),
    [orderedRouteStops],
  );
  const [activeStop, setActiveStop] = useState(pinStops[0] || null);
  const isJournal = variant === 'journal';

  useEffect(() => {
    setActiveStop(pinStops[0] || null);
  }, [pinStops]);

  const hasPins = pinStops.length > 0;

  return (
    <div
      className={`relative overflow-hidden rounded-[1.35rem] border ${
        isJournal
          ? 'border-[#283A2C]/12 bg-[#F1EFEC] shadow-[0_20px_55px_rgba(40,58,44,0.10)]'
          : 'border-white/10 bg-soft-noise shadow-luxury'
      }`}
    >
      <div className="grid min-h-[42rem] lg:grid-cols-[0.72fr_1fr]">
        <div
          className={`relative z-10 border-b p-5 sm:p-7 lg:border-b-0 lg:border-r ${
            isJournal
              ? 'border-[#283A2C]/12 bg-[#DADDC5]/48 text-[#283A2C]'
              : 'border-white/10 bg-black/42 backdrop-blur-md'
          }`}
        >
          <div
            className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${
              isJournal
                ? 'bg-[#283A2C] text-[#F1EFEC]'
                : 'bg-pearl text-obsidian'
            }`}
          >
            <Route size={25} />
          </div>
          <p
            className={`mt-6 text-xs font-extrabold uppercase tracking-[0.34em] ${
              isJournal ? 'text-[#283A2C]/58' : 'text-champagne'
            }`}
          >
            {kicker}
          </p>
          <h3 className="mt-4 font-display text-4xl font-semibold leading-tight">
            {title}
          </h3>
          <p
            className={`mt-4 text-sm leading-7 ${
              isJournal ? 'text-[#283A2C]/68' : 'text-pearl/62'
            }`}
          >
            {description}
          </p>

          {!hasPins && (
            <div
              className={`mt-8 rounded-lg border p-4 ${
                isJournal
                  ? 'border-[#283A2C]/12 bg-white/55'
                  : 'border-white/10 bg-white/[0.04]'
              }`}
            >
              <p
                className={`text-sm leading-7 ${
                  isJournal ? 'text-[#283A2C]/66' : 'text-pearl/66'
                }`}
              >
                {emptyMessage}
              </p>
            </div>
          )}

          {hasPins && (
            <div className="mt-8 grid gap-3">
              {pinStops.map((stop, index) => (
                <button
                  key={stop.id}
                  type="button"
                  onClick={() => setActiveStop(stop)}
                  className={`group rounded-lg border p-4 text-left transition ${
                    activeStop?.id === stop.id
                      ? isJournal
                        ? 'border-[#283A2C] bg-[#283A2C] text-[#F1EFEC] shadow-[0_12px_30px_rgba(40,58,44,0.18)]'
                        : 'border-champagne bg-champagne text-obsidian'
                      : isJournal
                        ? 'border-[#283A2C]/12 bg-white/65 text-[#283A2C] hover:border-[#283A2C]/35'
                        : 'border-white/10 bg-white/[0.04] text-pearl hover:border-champagne/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                        activeStop?.id === stop.id
                          ? isJournal
                            ? 'bg-[#DADDC5] text-[#283A2C]'
                            : 'bg-obsidian text-champagne'
                          : isJournal
                            ? 'bg-[#DADDC5] text-[#283A2C]'
                            : 'bg-pearl text-obsidian'
                      }`}
                    >
                      {showSequence ? index + 1 : <MapPin size={16} />}
                    </span>
                    <span>
                      <span className="block font-display text-2xl font-semibold leading-tight">
                        {stop.name}
                      </span>
                      {stop.subtitle && (
                        <span className="mt-1 block text-[0.65rem] font-extrabold uppercase tracking-[0.2em] opacity-65">
                          {stop.subtitle}
                        </span>
                      )}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative min-h-[28rem] lg:min-h-[42rem]">
          <MapContainer
            center={SRI_LANKA_CENTER}
            maxBounds={SRI_LANKA_BOUNDS}
            maxBoundsViscosity={1}
            minZoom={SRI_LANKA_DEFAULT_ZOOM}
            zoom={SRI_LANKA_DEFAULT_ZOOM}
            scrollWheelZoom={false}
            className="h-full min-h-[28rem] w-full lg:min-h-[42rem]"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FlyToStory activeStop={activeStop} coordinates={coordinates} />

            {connectStops && coordinates.length > 1 && (
              <>
                <Polyline
                  positions={coordinates}
                  pathOptions={{
                    color: '#050505',
                    opacity: 0.34,
                    weight: 8,
                  }}
                />
                <Polyline
                  positions={coordinates}
                  className="yogo-route-line"
                  pathOptions={{
                    color: '#d7bd8b',
                    opacity: 0.95,
                    weight: 4,
                    dashArray: '10 14',
                    lineCap: 'round',
                  }}
                />
              </>
            )}

            {pinStops.map((stop, index) => (
              <Marker
                key={stop.id}
                icon={
                  showSequence
                    ? createPinIcon(index + 1, activeStop?.id === stop.id)
                    : createJournalPinIcon(activeStop?.id === stop.id)
                }
                position={[stop.latitude, stop.longitude]}
                eventHandlers={{
                  click: () => setActiveStop(stop),
                }}
              >
                <Popup
                  className={
                    isJournal ? 'yogo-map-popup-journal' : 'yogo-map-popup'
                  }
                >
                  <div
                    className={`w-56 overflow-hidden rounded-md ${
                      isJournal
                        ? 'bg-[#F1EFEC] text-[#283A2C]'
                        : 'bg-obsidian text-pearl'
                    }`}
                  >
                    {stop.image && (
                      <img
                        src={stop.image}
                        alt={stop.name}
                        className="h-28 w-full object-cover"
                      />
                    )}
                    <div className="p-4">
                      {stop.badge && (
                        <p
                          className={`text-[0.62rem] font-extrabold uppercase tracking-[0.22em] ${
                            isJournal ? 'text-[#283A2C]/52' : 'text-champagne'
                          }`}
                        >
                          {stop.badge}
                        </p>
                      )}
                      <h4 className="mt-2 font-display text-2xl font-semibold">
                        {stop.name}
                      </h4>
                      {stop.description && (
                        <p
                          className={`mt-2 line-clamp-3 text-xs leading-5 ${
                            isJournal ? 'text-[#283A2C]/66' : 'text-pearl/66'
                          }`}
                        >
                          {stop.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {showMapMeta && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.45 }}
              className="pointer-events-none absolute right-3 top-3 z-[500] flex max-w-[calc(100%_-_4.5rem)] flex-col items-end gap-1.5 md:bottom-4 md:left-4 md:right-4 md:top-auto md:max-w-full md:flex-row md:flex-wrap md:items-stretch md:gap-3"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-black/72 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-pearl backdrop-blur-md">
                <MapPin size={15} className="text-champagne" />
                {pinStops.length} pins
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-black/72 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-pearl backdrop-blur-md">
                <CircleDot size={15} className="text-champagne" />
                {coordinates.length} stops
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-black/72 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-pearl backdrop-blur-md">
                <Navigation2 size={15} className="text-champagne" />
                Fly focus
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
