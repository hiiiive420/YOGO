import { apiClient } from './client';

export async function fetchBlogs() {
  const response = await apiClient.get('/api/blogs');
  return response.data.data;
}

export async function fetchBlogById(id) {
  const response = await apiClient.get(`/api/blogs/${id}`);
  return response.data.data;
}

export async function fetchBlogBySlug(slug) {
  const response = await apiClient.get(`/api/blogs/slug/${slug}`);
  return response.data.data;
}

export async function createBlog(formData) {
  const response = await apiClient.post('/api/blogs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function updateBlog(id, formData) {
  const response = await apiClient.put(`/api/blogs/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function deleteBlog(id) {
  const response = await apiClient.delete(`/api/blogs/${id}`);
  return response.data;
}
