const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

async function getJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const payload = await response.json();

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Unable to load discover content');
  }

  return payload.data;
}

export function fetchDiscoverPages() {
  return getJson('/api/discover');
}

export function fetchDiscoverPage(slug) {
  return getJson(`/api/discover/${slug}`);
}
