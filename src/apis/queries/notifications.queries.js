import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showNotification } from '@mantine/notifications';
import {
  fetchAllNotifications,
  deleteAllNotifications,
  deleteNotificationById,
  markAsReadNotificationById,
  markAllAsReadNotification,
} from '../requests/notifications.requests';

export const useFetchAllNotifications = (query, enabled = true) =>
  useQuery(
    ['notifications', query],
    async () => {
      const res = await fetchAllNotifications(query);
      return res?.data;
    },
    { enabled },
  );

export const useMarkAsReadNotificationById = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async id => {
      const res = await markAsReadNotificationById(id);
      return res;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications']);
        showNotification({
          title: 'Notification marked as read successfully',
          color: 'green',
        });
      },
      onError: err => {
        showNotification({
          title: 'Error',
          message: err?.message,
          color: 'red',
        });
      },
    },
  );
};

export const useMarkAllNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const res = await markAllAsReadNotification();
      return res;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications']);
        showNotification({
          title: 'Notifications marked as read successfully',
          color: 'green',
        });
      },
      onError: err => {
        showNotification({
          title: 'Error',
          message: err?.message,
          color: 'red',
        });
      },
    },
  );
};

export const useMarkNotificationById = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async id => {
      const res = await markAsReadNotificationById(id);
      return res;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications']);
        showNotification({
          title: 'Notification marked as read successfully',
          color: 'green',
        });
      },
      onError: err => {
        showNotification({
          title: 'Error',
          message: err?.message,
          color: 'red',
        });
      },
    },
  );
};

export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const res = await deleteAllNotifications();
      return res;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications']);
        showNotification({
          title: 'Notifications deleted successfully',
          color: 'green',
        });
      },
      onError: err => {
        showNotification({
          title: 'Error',
          message: err?.message,
          color: 'red',
        });
      },
    },
  );
};

export const useDeleteNotificationById = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async id => {
      const res = await deleteNotificationById(id);
      return res;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications']);
        showNotification({
          title: 'Notification deleted successfully',
          color: 'green',
        });
      },
      onError: err => {
        showNotification({
          title: 'Error',
          message: err?.message,
          color: 'red',
        });
      },
    },
  );
};
