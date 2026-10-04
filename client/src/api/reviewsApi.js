import http from './http.js';

export const reviewsApi = {
  getCourseReviews: (courseId) => http.get(`/courses/${courseId}/reviews`),
  submitReview: (courseId, payload) => http.post(`/courses/${courseId}/reviews`, payload),
  deleteReview: (courseId) => http.del(`/courses/${courseId}/reviews`),
};

export default reviewsApi;
