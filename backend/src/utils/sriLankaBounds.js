const SRI_LANKA_BOUNDS = {
  northEast: {
    latitude: 10.0,
    longitude: 82.1,
  },
  southWest: {
    latitude: 5.8,
    longitude: 79.5,
  },
};

function isCoordinateInSriLanka(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= SRI_LANKA_BOUNDS.southWest.latitude &&
    lat <= SRI_LANKA_BOUNDS.northEast.latitude &&
    lng >= SRI_LANKA_BOUNDS.southWest.longitude &&
    lng <= SRI_LANKA_BOUNDS.northEast.longitude
  );
}

function assertCoordinateInSriLanka(latitude, longitude, label = 'Coordinates') {
  if (!isCoordinateInSriLanka(latitude, longitude)) {
    const error = new Error(`${label} must be inside Sri Lanka`);
    error.statusCode = 400;
    throw error;
  }
}

module.exports = {
  SRI_LANKA_BOUNDS,
  assertCoordinateInSriLanka,
  isCoordinateInSriLanka,
};
