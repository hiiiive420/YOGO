import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import CinematicSriLankaMap from './CinematicSriLankaMap.jsx';
import { fetchItineraryMapRoute } from '../../services/itineraryMapApi.js';

function normalizeStop(stop, index) {
  return {
    ...stop,
    badge: stop.dayNumbers ? `Day ${stop.dayNumbers.join(', ')}` : `Stop ${index + 1}`,
    subtitle: stop.dayNumbers
      ? `Day ${stop.dayNumbers.join(', ')}`
      : stop.travelTime,
  };
}

function getDayLocations(day) {
  return day.locations || day.selectedLocations || [];
}

function buildRouteDataFromDays(days = []) {
  const pinStops = [...days]
    .sort((a, b) => Number(a.dayNumber) - Number(b.dayNumber))
    .flatMap((day) =>
      getDayLocations(day)
        .map((location, locationIndex) => ({
          id: `${day._id || day.dayNumber}-${location._id || location.id}-${locationIndex}`,
          dayNumbers: [day.dayNumber],
          description: location.description,
          image: location.image,
          latitude: Number(location.latitude),
          longitude: Number(location.longitude),
          name: location.name,
          travelTime: day.travelTime,
        }))
        .filter(
          (stop) =>
            Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude),
        ),
    );

  return {
    days,
    pinStops,
    routeStops: pinStops,
  };
}

export default function ItineraryRouteMap({
  categorySlug,
  days = [],
  description,
  kicker,
  planSlug,
  title,
}) {
  const [routeData, setRouteData] = useState({
    days: [],
    pinStops: [],
    routeStops: [],
  });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    if (days.length > 0) {
      setRouteData(buildRouteDataFromDays(days));
      setStatus('success');
      setError('');
      return undefined;
    }

    setStatus('loading');
    setError('');

    fetchItineraryMapRoute(categorySlug, planSlug)
      .then((data) => {
        if (!isMounted) return;

        setRouteData(data);
        setStatus('success');
      })
      .catch((requestError) => {
        if (!isMounted) return;

        setError(requestError.message);
        setRouteData({ days: [], pinStops: [], routeStops: [] });
        setStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, [categorySlug, days, planSlug]);

  const pinStops = useMemo(
    () => routeData.pinStops.map((stop, index) => normalizeStop(stop, index)),
    [routeData.pinStops],
  );
  const routeStops = useMemo(
    () => routeData.routeStops.map((stop, index) => normalizeStop(stop, index)),
    [routeData.routeStops],
  );

  if (status === 'loading') {
    return (
      <div className="grid min-h-[42rem] place-items-center rounded-lg border border-white/10 bg-white/[0.05]">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-champagne" size={30} />
          <p className="mt-4 text-sm font-bold text-pearl/56">Loading route</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-lg border border-champagne/25 bg-champagne/10 p-6">
        <p className="text-sm leading-7 text-pearl/72">{error}</p>
      </div>
    );
  }

  return (
    <CinematicSriLankaMap
      description={description}
      emptyMessage="Route pins are not published for this itinerary yet."
      kicker={kicker}
      routeStops={routeStops}
      stops={pinStops}
      title={title}
    />
  );
}
