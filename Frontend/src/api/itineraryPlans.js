import { apiClient } from './client';

export async function fetchItineraryPlans(params = {}) {
  const response = await apiClient.get('/api/itineraries', { params });
  return response.data.data;
}

export async function fetchItineraryPlanById(id) {
  const response = await apiClient.get(`/api/itineraries/${id}`);
  return response.data.data;
}

export async function fetchPublicItineraries(params = {}) {
  const response = await apiClient.get('/api/itineraries', { params });
  return response.data.data;
}

export async function fetchPublicItineraryBySlug(slug) {
  const response = await apiClient.get(`/api/itineraries/${slug}`, {
    params: { status: 'published' },
  });
  return response.data.data;
}

export async function createItineraryPlan(formData) {
  const response = await apiClient.post('/api/itineraries', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function updateItineraryPlan(id, formData) {
  const response = await apiClient.put(`/api/itineraries/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function deleteItineraryPlan(id) {
  const response = await apiClient.delete(`/api/itineraries/${id}`);
  return response.data;
}
