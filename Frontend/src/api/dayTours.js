import { apiClient } from './client';

export async function fetchDayTours(params = {}) {
  const response = await apiClient.get('/api/day-tours', { params });
  return response.data.data;
}

export async function fetchDayToursByLocation(locationId, params = {}) {
  const response = await apiClient.get(`/api/day-tours/by-location/${locationId}`, {
    params,
  });
  return response.data.data;
}

export async function fetchDayTourById(id) {
  const response = await apiClient.get(`/api/day-tours/${id}`);
  return response.data.data;
}

export async function fetchPublicDayTourBySlug(slug) {
  const response = await apiClient.get(`/api/day-tours/${slug}`, {
    params: { status: 'published' },
  });
  return response.data.data;
}

export async function createDayTour(formData) {
  const response = await apiClient.post('/api/day-tours', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function updateDayTour(id, formData) {
  const response = await apiClient.put(`/api/day-tours/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function deleteDayTour(id) {
  const response = await apiClient.delete(`/api/day-tours/${id}`);
  return response.data;
}
