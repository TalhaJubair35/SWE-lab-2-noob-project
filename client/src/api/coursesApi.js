import http from './http.js';

export const coursesApi = {
  list: async (filters = {}) => {
    const query = new URLSearchParams();
    if (filters.search?.trim()) query.set('search', filters.search.trim());
    if (filters.category?.trim()) query.set('category', filters.category.trim());
    const suffix = query.size ? `?${query.toString()}` : '';
    return http.get(`/courses${suffix}`);
  },
  getCourse: async (id) => http.get(`/courses/${id}`),
  mine: async () => http.get('/courses/mine'),
  create: async (payload) => http.post('/courses', payload),
  update: async (id, payload) => http.put(`/courses/${id}`, payload),
  remove: async (id) => http.del(`/courses/${id}`),
  addLesson: async (id, payload) => http.post(`/courses/${id}/lessons`, payload),
  updateLesson: async (id, lessonId, payload) => http.put(`/courses/${id}/lessons/${lessonId}`, payload),
  removeLesson: async (id, lessonId) => http.del(`/courses/${id}/lessons/${lessonId}`),
};

export default coursesApi;
