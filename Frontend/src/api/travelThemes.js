import { apiClient } from './client';

export async function fetchTravelThemes() {
  const response = await apiClient.get('/api/travel-themes');
  return response.data.data;
}
