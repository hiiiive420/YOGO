const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

async function getJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const payload = await response.json();

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Unable to load itinerary route');
  }

  return payload.data;
}

function normalizeStop(location, day) {
  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    id: location._id,
    name: location.name,
    slug: location.slug,
    image: location.image,
    description: location.description,
    latitude,
    longitude,
    dayNumber: day.dayNumber,
    dayTitle: day.title,
    travelTime: day.travelTime,
  };
}

function buildRouteStops(days) {
  return [...days]
    .sort((a, b) => a.dayNumber - b.dayNumber)
    .flatMap((day) =>
      (day.selectedLocations || [])
        .map((location) => normalizeStop(location, day))
        .filter(Boolean),
    );
}

function buildPinStops(routeStops) {
  const pins = new Map();

  routeStops.forEach((stop) => {
    const existing = pins.get(stop.id);

    if (!existing) {
      pins.set(stop.id, {
        ...stop,
        dayNumbers: [stop.dayNumber],
        visits: [stop],
      });
      return;
    }

    existing.dayNumbers = [...new Set([...existing.dayNumbers, stop.dayNumber])];
    existing.visits.push(stop);
  });

  return [...pins.values()];
}

export async function fetchItineraryMapRoute(categorySlug, planSlug) {
  const categories = await getJson('/api/itinerary-categories');
  const category = categories.find((item) => item.slug === categorySlug);

  if (!category) {
    return {
      category: null,
      plan: null,
      days: [],
      routeStops: [],
      pinStops: [],
    };
  }

  const plans = await getJson(`/api/itinerary-plans?categoryId=${category._id}`);
  const plan = plans.find((item) => item.slug === planSlug);

  if (!plan) {
    return {
      category,
      plan: null,
      days: [],
      routeStops: [],
      pinStops: [],
    };
  }

  const days = await getJson(`/api/itinerary-days?itineraryPlanId=${plan._id}`);
  const routeStops = buildRouteStops(days);

  return {
    category,
    plan,
    days,
    routeStops,
    pinStops: buildPinStops(routeStops),
  };
}
