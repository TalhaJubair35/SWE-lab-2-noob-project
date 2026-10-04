import http from './http.js';

export const learningApi = {
  enroll: async (courseId) => http.post(`/courses/${courseId}/enroll`),
  enrollment: async (courseId) => http.get(`/courses/${courseId}/enrollment`),
  myCourses: async () => http.get('/my-courses'),
  lessons: async (courseId) => http.get(`/courses/${courseId}/lessons`),
  lesson: async (lessonId) => http.get(`/lessons/${lessonId}`),
  complete: async (lessonId) => http.post(`/lessons/${lessonId}/complete`),
};

export default learningApi;
