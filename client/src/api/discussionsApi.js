import http from './http.js';

export const discussionsApi = {
  listByCourse: (courseId) => http.get(`/courses/${courseId}/discussions`),
  createThread: (courseId, payload) => http.post(`/courses/${courseId}/discussions`, payload),
  getThread: (discussionId) => http.get(`/discussions/${discussionId}`),
  replyToThread: (discussionId, payload) => http.post(`/discussions/${discussionId}/replies`, payload),
};

export default discussionsApi;
