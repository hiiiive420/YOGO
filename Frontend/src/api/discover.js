import { apiClient } from './client';

export async function fetchDiscoverPages({ includeUnpublished = true } = {}) {
  const response = await apiClient.get('/api/discover', {
    params: { includeUnpublished },
  });
  return response.data.data;
}

export async function fetchDiscoverById(id) {
  const response = await apiClient.get(`/api/discover/admin/${id}`);
  return response.data.data;
}

export async function createDiscoverPage(formData) {
  const response = await apiClient.post('/api/discover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function updateDiscoverPage(id, formData) {
  const response = await apiClient.put(`/api/discover/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function deleteDiscoverPage(id) {
  const response = await apiClient.delete(`/api/discover/${id}`);
  return response.data;
}
