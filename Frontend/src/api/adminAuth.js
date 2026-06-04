import { apiClient } from './client';

export async function loginAdmin(payload) {
  const response = await apiClient.post('/api/admin/auth/login', payload);
  return response.data;
}

export async function getCurrentAdmin() {
  const response = await apiClient.get('/api/admin/auth/me');
  return response.data.data;
}
