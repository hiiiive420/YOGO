import { apiClient } from './client';

export async function fetchLocations() {
  const response = await apiClient.get('/api/locations');
  return response.data.data;
}

export async function fetchTopLocations() {
  const response = await apiClient.get('/api/locations/top');
  return response.data.data;
}

export async function fetchLocationById(id) {
  const response = await apiClient.get(`/api/locations/${id}`);
  return response.data.data;
}

export async function createLocation(formData) {
  const response = await apiClient.post('/api/locations', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function resolveGoogleMapsUrl(url) {
  const response = await apiClient.post('/api/locations/resolve-map-url', {
    url,
  });
  return response.data.data;
}

export async function updateLocation(id, formData) {
  const response = await apiClient.put(`/api/locations/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function deleteLocation(id) {
  const response = await apiClient.delete(`/api/locations/${id}`);
  return response.data;
}
