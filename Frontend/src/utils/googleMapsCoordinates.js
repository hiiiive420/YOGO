const COORDINATE_PAIR_PATTERN =
  /(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)/g;

const GOOGLE_MAPS_HOSTS = new Set([
  'google.com',
  'maps.google.com',
  'www.google.com',
  'maps.app.goo.gl',
  'goo.gl',
]);

function normalizeUrl(value) {
  const trimmed = value.trim();

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  if (/^(maps\.app\.goo\.gl|goo\.gl|maps\.google\.com|google\.com|www\.google\.com)\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

function decodeText(value) {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

function isValidCoordinate(latitude, longitude) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function findCoordinatePair(text) {
  if (!text) return null;

  const decoded = decodeText(text);
  COORDINATE_PAIR_PATTERN.lastIndex = 0;

  let match = COORDINATE_PAIR_PATTERN.exec(decoded);

  while (match) {
    const latitude = Number(match[1]);
    const longitude = Number(match[2]);

    if (isValidCoordinate(latitude, longitude)) {
      return { latitude, longitude };
    }

    match = COORDINATE_PAIR_PATTERN.exec(decoded);
  }

  return null;
}

function findGoogleDataCoordinates(text) {
  const decoded = decodeText(text);
  const match = decoded.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);

  if (!match) return null;

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);

  if (!isValidCoordinate(latitude, longitude)) return null;

  return { latitude, longitude };
}

export function extractGoogleMapsCoordinates(value) {
  if (!value || typeof value !== 'string') return null;

  const normalizedValue = normalizeUrl(value);
  const directDataCoordinates = findGoogleDataCoordinates(normalizedValue);

  if (directDataCoordinates) return directDataCoordinates;

  let parsedUrl = null;

  try {
    parsedUrl = new URL(normalizedValue);
  } catch {
    return findCoordinatePair(normalizedValue);
  }

  const searchValues = ['q', 'query', 'll', 'center', 'sll', 'daddr', 'destination']
    .map((key) => parsedUrl.searchParams.get(key))
    .filter(Boolean);

  const candidates = [
    ...searchValues,
    parsedUrl.pathname,
    parsedUrl.hash,
    parsedUrl.href,
  ];

  for (const candidate of candidates) {
    const coordinates = findCoordinatePair(candidate);

    if (coordinates) return coordinates;
  }

  return null;
}

export function formatCoordinate(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return '';

  return number.toFixed(6).replace(/\.?0+$/, '');
}

export function normalizeGoogleMapsUrl(value) {
  return normalizeUrl(value);
}

export function isGoogleMapsUrl(value) {
  if (!value || typeof value !== 'string') return false;

  try {
    const hostname = new URL(normalizeUrl(value)).hostname.toLowerCase();

    return (
      GOOGLE_MAPS_HOSTS.has(hostname) ||
      hostname.endsWith('.google.com') ||
      hostname.endsWith('.goo.gl')
    );
  } catch {
    return false;
  }
}
