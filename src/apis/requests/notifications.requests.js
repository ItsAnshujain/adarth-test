import http from '../http';

export const fetchAllNotifications = query => http.get(`/notification?${query}`);

export const markAsReadNotificationById = id => http.patch(`/notification/${id}/mark-as-read`);

export const markAllAsReadNotification = () => http.patch('/notification/mark-all-as-read');

export const deleteAllNotifications = () => http.delete('/notification/clear');

export const deleteNotificationById = id => http.delete(`/notification/${id}`);
