import { apiClient } from './client';

export async function fetchItineraryDays(params = {}) {
  const response = await apiClient.get('/api/itinerary-days', { params });
  return response.data.data;
}

export async function fetchItineraryDayById(id) {
  const response = await apiClient.get(`/api/itinerary-days/${id}`);
  return response.data.data;
}

export async function createItineraryDay(formData) {
  const response = await apiClient.post('/api/itinerary-days', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function updateItineraryDay(id, formData) {
  const response = await apiClient.put(`/api/itinerary-days/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function deleteItineraryDay(id) {
  const response = await apiClient.delete(`/api/itinerary-days/${id}`);
  return response.data;
}
