import { apiClient } from './client';

export async function createInquiry(payload) {
  const response = await apiClient.post('/api/inquiries', payload);

  return response.data;
}
