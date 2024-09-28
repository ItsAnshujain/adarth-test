import { showNotification } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createInventory,
  csvImport,
  deleteInventory,
  deleteInventoryById,
  fetchBookingsByInventoryId,
  fetchDistinctAdditionalTags,
  fetchDistinctCities,
  fetchInventory,
  fetchInventoryById,
  fetchInventoryReportList,
  inventoryReport,
  inventoryStats,
  shareInventory,
  updateInventories,
  updateInventory,
} from '../requests/inventory.requests';
import { onApiError } from '../../utils';

export const useCreateInventory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async data => {
      const res = await createInventory(data);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inventory']);

        showNotification({
          title: 'Inventory Successfully Added',
          color: 'green',
        });
      },
      onError: err => {
        showNotification({
          title: err?.message,
          color: 'red',
        });
      },
    },
  );
};

export const useFetchInventory = (query, enabled = true) =>
  useQuery(
    ['inventory', query],
    async () => {
      const res = await fetchInventory(query);
      return res?.data;
    },
    { enabled },
  );

export const useUpdateInventory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ inventoryId, data }) => {
      const res = await updateInventory(inventoryId, data);
      return res;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inventory']);
        queryClient.invalidateQueries(['inventory-by-id']);
        showNotification({
          title: 'Inventory updated successfully',
          color: 'green',
        });
      },
      onError: err => {
        showNotification({
          title: err?.message,
          color: 'red',
        });
      },
    },
  );
};

export const useUpdateInventories = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ inventoryId, data }) => {
      const query = `?${inventoryId?.map(item => `id=${item}`).join('&')}`;

      const res = await updateInventories(query, data);
      return res;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inventory']);
        queryClient.invalidateQueries(['inventory-by-id']);
        showNotification({
          title: 'Inventory updated successfully',
          color: 'green',
        });
      },
      onError: err => {
        showNotification({
          title: err?.message,
          color: 'red',
        });
      },
    },
  );
};

export const useFetchInventoryById = (inventoryId, enabled = true) =>
  useQuery(
    ['inventory-by-id', inventoryId],
    async () => {
      const res = await fetchInventoryById(inventoryId);
      return res?.data;
    },
    { enabled },
  );

export const useDeleteInventoryById = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ inventoryId }) => {
      const res = await deleteInventoryById(inventoryId);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inventory']);
        showNotification({
          title: 'Inventory deleted successfully',
          color: 'green',
        });
      },
      onError: err => {
        showNotification({
          title: err?.message,
          color: 'red',
        });
      },
    },
  );
};

export const useDeleteInventory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async data => {
      const query =
        data?.length === 1 ? `/${data[0]}` : `?${data?.map(item => `id=${item}`).join('&')}`;
      // single id takes url param and multiple ids take query params
      const res = await deleteInventory(query);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inventory']);

        showNotification({
          title: 'Inventory deleted successfully',
          color: 'green',
        });
      },
      onError: err => {
        showNotification({
          title: err?.message,
          color: 'red',
        });
      },
    },
  );
};

export const useCsvImport = () =>
  useMutation(
    async data => {
      const res = await csvImport(data);
      return res.data;
    },
    {
      onSuccess: () => {
        showNotification({
          title: 'File Successfully Imported',
          color: 'green',
        });
      },
      onError: err => {
        showNotification({
          title: err?.message,
          color: 'red',
        });
      },
    },
  );

export const useFetchBookingsByInventoryId = ({ inventoryId, query }, enabled = true) =>
  useQuery(
    ['inventory-id-bookings', inventoryId, query],
    async () => {
      const res = await fetchBookingsByInventoryId(inventoryId, query);
      return res?.data;
    },
    { enabled },
  );

export const useInventoryStats = (filter, enabled = true) =>
  useQuery(
    ['inventory-stats', filter],
    async () => {
      const res = await inventoryStats(filter);
      return res?.data;
    },
    {
      enabled,
    },
  );

export const useInventoryReport = (query, enabled = true) =>
  useQuery(
    ['inventory-report', query],
    async () => {
      const res = await inventoryReport(query);
      return res?.data;
    },
    { enabled },
  );

export const useFetchInventoryReportList = (query, enabled = true) =>
  useQuery(
    ['inventory-report-list', query],
    async () => {
      const res = await fetchInventoryReportList(query);
      return res?.data;
    },
    { enabled },
  );

export const useShareInventory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ queries, data }) => {
      const res = await shareInventory(queries, data);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inventory']);
      },
      onError: err => {
        showNotification({
          title: err?.message,
          color: 'red',
        });
      },
    },
  );
};

export const useDistinctAdditionalTags = (enabled = true) =>
  useQuery({
    queryKey: ['distinct-tags'],
    queryFn: async () => {
      const res = await fetchDistinctAdditionalTags();
      return res?.data;
    },
    enabled,
    onError: onApiError,
  });

export const useDistinctCities = (enabled = true) =>
  useQuery({
    queryKey: ['distinct-cities'],
    queryFn: async () => {
      const res = await fetchDistinctCities();
      return res?.data;
    },
    enabled,
    onError: onApiError,
  });
