export const SRI_LANKA_CENTER = [7.8731, 80.7718];

export const SRI_LANKA_BOUNDS = [
  [5.8, 79.5],
  [10.0, 82.1],
];

export const SRI_LANKA_DEFAULT_ZOOM = 7;

export function isCoordinateInSriLanka(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const [[south, west], [north, east]] = SRI_LANKA_BOUNDS;

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= south &&
    lat <= north &&
    lng >= west &&
    lng <= east
  );
}

export function toLeafletPosition(value) {
  if (!value) return null;

  const latitude = Number(value.latitude ?? value.lat ?? value[0]);
  const longitude = Number(value.longitude ?? value.lng ?? value[1]);

  if (!isCoordinateInSriLanka(latitude, longitude)) return null;

  return [latitude, longitude];
}
