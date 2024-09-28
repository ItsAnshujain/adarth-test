import { showNotification } from '@mantine/notifications';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addPeers,
  createUsers,
  deleteUsers,
  fetchUsers,
  fetchUsersById,
  updateUsers,
} from '../requests/users.requests';
import { serialize } from '../../utils';

export const useFetchUsers = (query, enabled = true, retry = true) =>
  useQuery(
    ['users', query],
    async () => {
      const res = await fetchUsers(query);
      return res?.data;
    },
    {
      enabled,
      retry,
    },
  );

export const useInfiniteUsers = (query, enabled = true) =>
  useInfiniteQuery({
    queryKey: ['infinite-users', query],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetchUsers(serialize({ ...query, page: pageParam || 1 }));

      return res.data;
    },
    enabled,
    getNextPageParam: lastPage => (lastPage.hasNextPage ? +lastPage.pagingCounter + 1 : undefined),
  });

export const useFetchUsersById = (usersById, enabled = true) =>
  useQuery(
    ['users-by-id', usersById],
    async () => {
      const res = await fetchUsersById(usersById);
      return res?.data;
    },
    {
      enabled,
    },
  );

export const useCreateUsers = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async data => {
      const res = await createUsers(data);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        showNotification({
          title: 'User created successfully',
          autoClose: 3000,
          color: 'green',
        });
      },
      onError: err => {
        showNotification({
          title: err?.message,
          autoClose: 3000,
          color: 'red',
        });
      },
    },
  );
};

export const useUpdateUsers = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ userId, data }) => {
      const res = await updateUsers(userId, data);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users-by-id');
      },
      onError: err => {
        showNotification({
          title: err?.message,
          autoClose: 3000,
          color: 'red',
        });
      },
    },
  );
};

export const useDeleteUsers = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ userId, data }) => {
      const res = await deleteUsers(userId, data);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
      },
      onError: () => {},
    },
  );
};

export const useInvitePeers = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async data => {
      const res = await addPeers(data);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        showNotification({
          title: 'Peer added successfully',
          autoClose: 3000,
          color: 'green',
        });
      },
      onError: err => {
        showNotification({
          title: err?.message,
          autoClose: 3000,
          color: 'red',
        });
      },
    },
  );
};
