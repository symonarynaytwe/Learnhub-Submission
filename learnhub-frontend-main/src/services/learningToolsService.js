import api from './api';

export function getDiscussions(courseId) {
  return api.get(`/learning-tools/courses/${courseId}/discussions`);
}
export function postDiscussion(courseId, message) {
  return api.post(`/learning-tools/courses/${courseId}/discussions`, { message });
}
export function getNotes(courseId) {
  return api.get(`/learning-tools/courses/${courseId}/notes`);
}
export function createNote(courseId, data) {
  return api.post(`/learning-tools/courses/${courseId}/notes`, data);
}
export function updateNote(courseId, noteId, data) {
  return api.put(`/learning-tools/courses/${courseId}/notes/${noteId}`, data);
}
export function deleteNote(courseId, noteId) {
  return api.delete(`/learning-tools/courses/${courseId}/notes/${noteId}`);
}
export function getBookmarks() {
  return api.get('/learning-tools/bookmarks');
}
export function addBookmark(courseId) {
  return api.post(`/learning-tools/bookmarks/${courseId}`);
}
export function removeBookmark(courseId) {
  return api.delete(`/learning-tools/bookmarks/${courseId}`);
}
