import { showNotification } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMaster,
  deleteMaster,
  fetchMasterById,
  fetchMasters,
  fetchMasterTypes,
  updateMaster,
} from '../requests/masters.requests';

export const useFetchMastersTypes = (enabled = true) =>
  useQuery(
    ['masters-types'],
    async () => {
      const res = await fetchMasterTypes();
      return res?.data;
    },
    {
      enabled,
    },
  );

export const useFetchMasters = (query, enabled = true) =>
  useQuery(
    ['masters', query],
    async () => {
      const res = await fetchMasters(query);
      return res?.data;
    },
    {
      enabled,
    },
  );

export const useMasters = () =>
  useMutation(async query => {
    const res = await fetchMasters(query);
    return res?.data;
  });

export const useCreateMaster = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async data => {
      const res = await createMaster(data);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['masters']);
        showNotification({
          title: 'Master added successfully',
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

export const useFetchMasterById = (masterId, enabled = true) =>
  useQuery(
    ['masters-by-id', masterId],
    async () => {
      const res = await fetchMasterById(masterId);
      return res?.data;
    },
    {
      enabled,
    },
  );

export const useUpdateMaster = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ masterId, data }) => {
      const res = await updateMaster(masterId, data);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['masters']);
        showNotification({
          title: 'Master edited successfully',
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

export const useDeleteMaster = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ masterId }) => {
      const res = await deleteMaster(masterId);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['masters']);
        showNotification({
          title: 'Master deleted successfully',
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
