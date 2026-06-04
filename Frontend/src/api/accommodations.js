import { apiClient } from './client';

export async function fetchAccommodations() {
  const response = await apiClient.get('/api/accommodations');
  return response.data.data;
}

export async function fetchAccommodationById(id) {
  const response = await apiClient.get(`/api/accommodations/admin/${id}`);
  return response.data.data;
}

export async function createAccommodation(formData) {
  const response = await apiClient.post('/api/accommodations', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function updateAccommodation(id, formData) {
  const response = await apiClient.put(`/api/accommodations/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function deleteAccommodation(id) {
  const response = await apiClient.delete(`/api/accommodations/${id}`);
  return response.data;
}
