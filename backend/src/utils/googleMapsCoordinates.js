const http = require('http');
const https = require('https');

const COORDINATE_PAIR_PATTERN =
  /(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)/g;
const GOOGLE_DATA_PATTERN = /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/;
const MAX_REDIRECTS = 8;
const MAX_BODY_LENGTH = 120000;
const REQUEST_TIMEOUT_MS = 9000;

function normalizeGoogleMapsUrl(value) {
  const trimmed = String(value || '').trim();

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  if (/^(maps\.app\.goo\.gl|goo\.gl|maps\.google\.com|google\.com|www\.google\.com)\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

function decodeText(value) {
  try {
    return decodeURIComponent(String(value).replace(/\+/g, ' '));
  } catch {
    return String(value);
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

function isAllowedGoogleMapsUrl(value) {
  let parsedUrl;

  try {
    parsedUrl = new URL(normalizeGoogleMapsUrl(value));
  } catch {
    return false;
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  return (
    hostname === 'google.com' ||
    hostname === 'maps.google.com' ||
    hostname === 'www.google.com' ||
    hostname === 'maps.app.goo.gl' ||
    hostname === 'goo.gl' ||
    hostname.endsWith('.google.com') ||
    hostname.endsWith('.goo.gl')
  );
}

function extractCoordinatePair(text) {
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

function extractGoogleDataCoordinates(text) {
  if (!text) return null;

  const match = decodeText(text).match(GOOGLE_DATA_PATTERN);

  if (!match) return null;

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);

  if (!isValidCoordinate(latitude, longitude)) return null;

  return { latitude, longitude };
}

function extractEmbeddedBodyCoordinates(text) {
  if (!text) return null;

  const decoded = decodeText(text);
  const dataCoordinates = extractGoogleDataCoordinates(decoded);

  if (dataCoordinates) return dataCoordinates;

  const atMatch = decoded.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);

  if (atMatch) {
    const latitude = Number(atMatch[1]);
    const longitude = Number(atMatch[2]);

    if (isValidCoordinate(latitude, longitude)) {
      return { latitude, longitude };
    }
  }

  const queryMatch = decoded.match(
    /[?&](?:q|query|ll|center|sll)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  );

  if (!queryMatch) return null;

  const latitude = Number(queryMatch[1]);
  const longitude = Number(queryMatch[2]);

  if (!isValidCoordinate(latitude, longitude)) return null;

  return { latitude, longitude };
}

function extractGoogleMapsCoordinates(value) {
  if (!value) return null;

  const normalizedValue = normalizeGoogleMapsUrl(value);
  const dataCoordinates = extractGoogleDataCoordinates(normalizedValue);

  if (dataCoordinates) return dataCoordinates;

  let parsedUrl = null;

  try {
    parsedUrl = new URL(normalizedValue);
  } catch {
    return extractCoordinatePair(normalizedValue);
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
    const coordinates = extractCoordinatePair(candidate);

    if (coordinates) return coordinates;
  }

  return null;
}

function requestGoogleMapsUrl(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > MAX_REDIRECTS) {
      reject(new Error('Google Maps link used too many redirects'));
      return;
    }

    if (!isAllowedGoogleMapsUrl(url)) {
      reject(new Error('Only Google Maps links can be resolved'));
      return;
    }

    const parsedUrl = new URL(normalizeGoogleMapsUrl(url));
    const client = parsedUrl.protocol === 'http:' ? http : https;
    const request = client.request(
      parsedUrl,
      {
        headers: {
          Accept: 'text/html,application/xhtml+xml',
          'User-Agent': 'YOGO Location Admin/1.0',
        },
        method: 'GET',
        timeout: REQUEST_TIMEOUT_MS,
      },
      (response) => {
        const redirectLocation = response.headers.location;

        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          redirectLocation
        ) {
          const nextUrl = new URL(redirectLocation, parsedUrl).toString();
          response.resume();
          resolve(requestGoogleMapsUrl(nextUrl, redirectCount + 1));
          return;
        }

        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          if (body.length < MAX_BODY_LENGTH) {
            body += chunk.slice(0, MAX_BODY_LENGTH - body.length);
          }
        });
        response.on('end', () => {
          resolve({
            body,
            finalUrl: parsedUrl.toString(),
          });
        });
      },
    );

    request.on('timeout', () => {
      request.destroy(new Error('Timed out resolving Google Maps link'));
    });
    request.on('error', reject);
    request.end();
  });
}

async function resolveGoogleMapsCoordinates(url) {
  const directCoordinates = extractGoogleMapsCoordinates(url);

  if (directCoordinates) return directCoordinates;

  const resolved = await requestGoogleMapsUrl(url);

  return (
    extractGoogleMapsCoordinates(resolved.finalUrl) ||
    extractEmbeddedBodyCoordinates(resolved.body)
  );
}

module.exports = {
  extractGoogleMapsCoordinates,
  isAllowedGoogleMapsUrl,
  normalizeGoogleMapsUrl,
  resolveGoogleMapsCoordinates,
};
