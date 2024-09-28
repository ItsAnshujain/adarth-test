import { showNotification } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteFinanceById,
  fetchFinance,
  fetchFinanceByYear,
  fetchFinanceByYearAndMonth,
  fetchSingleRecordById,
  shareRecord,
  updateFinanceById,
} from '../requests/finance.requests';

export const useFetchFinance = (enabled = true) =>
  useQuery(
    ['finance'],
    async () => {
      const res = await fetchFinance();
      return res?.data;
    },
    { enabled },
  );

export const useUpdateFinanceById = () =>
  useMutation(
    async ({ id, data }) => {
      const res = await updateFinanceById(id, data);
      return res?.data;
    },
    {
      onError: err => {
        showNotification({
          title: 'Error',
          message: err?.message,
          color: 'red',
        });
      },
    },
  );

export const useFetchFinanceByYear = (year, enabled = true) =>
  useQuery(
    ['finance-by-year', year],
    async () => {
      const res = await fetchFinanceByYear(year);
      return res?.data;
    },
    { enabled },
  );

export const useFetchFinanceByYearAndMonth = (query, enabled = true) =>
  useQuery(
    ['finance-by-month', query],
    async () => {
      const res = await fetchFinanceByYearAndMonth(query);
      return res?.data;
    },
    { enabled },
  );

export const useDeleteFinanceById = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ financeId, type }) => {
      const res = await deleteFinanceById(financeId, type);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['finance-by-month']);
        showNotification({
          title: 'Finance deleted successfully',
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

export const useShareRecord = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, data }) => {
      const res = await shareRecord(id, data);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['finance-by-month']);
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

export const useFetchSingleRecordById = (id, enabled = true) =>
  useQuery(
    ['single-record-by-id', id],
    async () => {
      const res = await fetchSingleRecordById(id);
      return res?.data;
    },
    { enabled },
  );
