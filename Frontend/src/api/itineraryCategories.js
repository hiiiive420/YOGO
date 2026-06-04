import { apiClient } from './client';

export async function fetchItineraryCategories() {
  const response = await apiClient.get('/api/itinerary-categories');
  return response.data.data;
}

export async function fetchItineraryCategoryById(id) {
  const response = await apiClient.get(`/api/itinerary-categories/${id}`);
  return response.data.data;
}

export async function createItineraryCategory(formData) {
  const response = await apiClient.post('/api/itinerary-categories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function updateItineraryCategory(id, formData) {
  const response = await apiClient.put(
    `/api/itinerary-categories/${id}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return response.data.data;
}

export async function deleteItineraryCategory(id) {
  const response = await apiClient.delete(`/api/itinerary-categories/${id}`);
  return response.data;
}
