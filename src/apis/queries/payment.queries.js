import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createPayment,
  deletePayment,
  fetchPayment,
  fetchPaymentById,
  updatePayment,
} from '../requests/payment.requests';
import { onApiError } from '../../utils';

export const usePayment = (query, enabled = true) =>
  useQuery({
    queryKey: ['payment', query],
    queryFn: async () => {
      const res = await fetchPayment(query);
      return res?.data;
    },
    enabled,
    onError: onApiError,
  });

export const usePaymentById = (paymentId, enabled = true) =>
  useQuery({
    queryKey: ['payment-by-id', paymentId],
    queryFn: async () => {
      const res = await fetchPaymentById(paymentId);
      return res?.data;
    },
    enabled,
    onError: onApiError,
  });

export const useCreatePayment = () =>
  useMutation({
    mutationFn: async payload => {
      const res = await createPayment(payload);
      return res;
    },
    onError: onApiError,
  });

export const useUpdatePayment = () =>
  useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await updatePayment(id, payload);
      return res;
    },
    onError: onApiError,
  });

export const useDeletePayment = () =>
  useMutation({
    mutationFn: async id => {
      const res = await deletePayment(id);
      return res;
    },
    onError: onApiError,
  });
