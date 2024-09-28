import http from '../http';

export const changePassword = data => http.patch('/settings/change-password', data);

export const updateNotification = data => http.patch('/settings/notification', data);

export const deleteAccount = (userId, data) => http.patch(`/users/${userId}/delete`, data);

export const removeSettings = (userId, data) =>
  http.patch(`/users/${userId}/remove-doc`, { remove: data });
