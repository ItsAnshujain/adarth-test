import { showNotification } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  bookingRevenue,
  bookingReportByRevenueGraph,
  bookingReportByRevenueStats,
  bookingRevenueByIndustry,
  bookingRevenueByLocation,
  bookings,
  bookingStats,
  bookingStatsByIncharge,
  createBooking,
  deleteBookings,
  generateInvoiceReceipt,
  generatePurchaseReceipt,
  generateReleaseReceipt,
  updateBooking,
  updateBookingStatus,
  generateManualPurchaseReceipt,
  generateManualReleaseReceipt,
  generateManualInvoiceReceipt,
  fetchBookingStatsById,
  fetchbookingById,
  fetchUserSalesByUserId,
  fetchCalendarEvents,
  exportBookings,
  exportBooking,
} from '../requests/booking.requests';
import { onApiError } from '../../utils';

export const useBookings = (filter, enabled = true) =>
  useQuery(
    ['bookings', filter],
    async () => {
      const res = await bookings(filter);
      return res?.data;
    },
    {
      enabled: !!enabled,
    },
  );

export const useBookingById = (id, enabled = true) =>
  useQuery(
    ['booking-by-id', id],
    async () => {
      const res = await fetchbookingById(id);
      return res.data[0] || {};
    },
    {
      enabled,
    },
  );

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, data }) => {
      const res = await updateBooking(id, data);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bookings']);
        showNotification({
          title: 'Booking updated successfully',
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

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, query }) => {
      const res = await updateBookingStatus(id, query);
      return res;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bookings']);
        queryClient.invalidateQueries(['booking-by-id']);
        queryClient.invalidateQueries(['booking-stats']);
        queryClient.invalidateQueries(['booking-stats-by-incharge']);

        showNotification({
          title: 'Booking updated successfully',
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

export const useCreateBookings = () =>
  useMutation(
    async data => {
      const res = await createBooking(data);
      return res;
    },
    {
      onSuccess: () => {
        showNotification({
          title: 'Booking created successfully',
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

export const useBookingStats = (filter, enabled = true) =>
  useQuery(
    ['booking-stats', filter],
    async () => {
      const res = await bookingStats(filter);
      return res?.data;
    },
    {
      enabled,
    },
  );

export const useBookingStatByIncharge = (filter, enabled = true) =>
  useQuery(
    ['booking-stats-by-incharge', filter],
    async () => {
      const res = await bookingStatsByIncharge(filter);
      return res?.data;
    },
    {
      enabled,
    },
  );

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async id => {
      const res = await deleteBookings(id);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bookings']);
        showNotification({
          title: 'Booking deleted successfully',
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

export const useGenerateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, data }) => {
      const res = await generateInvoiceReceipt(id, data);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bookings']);
        showNotification({
          title: 'Invoice receipt downloaded successfully',
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

export const useGeneratePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, data }) => {
      const res = await generatePurchaseReceipt(id, data);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bookings']);
        showNotification({
          title: 'Purchase order receipt downloaded successfully',
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

export const useGenerateReleaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, data }) => {
      const res = await generateReleaseReceipt(id, data);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bookings']);
        showNotification({
          title: 'Release order receipt downloaded successfully',
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

export const useFetchBookingRevenue = (query, enabled = true) =>
  useQuery(
    ['booking-revenue', query],
    async () => {
      const res = await bookingRevenue(query);
      return res?.data;
    },
    { enabled },
  );

export const useBookingReportByRevenueStats = (enabled = true) =>
  useQuery(
    ['booking-by-revenue-stats'],
    async () => {
      const res = await bookingReportByRevenueStats();
      return res?.data;
    },
    { enabled },
  );

export const useBookingReportByRevenueGraph = (query, enabled = true) =>
  useQuery(
    ['booking-by-reveue-graph', query],
    async () => {
      const res = await bookingReportByRevenueGraph(query);
      return res?.data;
    },
    { enabled },
  );

export const useBookingRevenueByIndustry = (query, enabled = true) =>
  useQuery(
    ['booking-revenue-by-industry', query],
    async () => {
      const res = await bookingRevenueByIndustry(query);
      return res?.data;
    },
    { enabled },
  );

export const useBookingRevenueByLocation = (query, enabled = true) =>
  useQuery(
    ['booking-revenue-by-location', query],
    async () => {
      const res = await bookingRevenueByLocation(query);
      return res?.data;
    },
    { enabled },
  );

export const useGenerateManualPurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async data => {
      const res = await generateManualPurchaseReceipt(data);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['finance-by-month']);
        showNotification({
          title: 'Purchase order created successfully',
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

export const useGenerateManualReleaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async data => {
      const res = await generateManualReleaseReceipt(data);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['finance-by-month']);
        showNotification({
          title: 'Release order created successfully',
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

export const useGenerateManualInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async data => {
      const res = await generateManualInvoiceReceipt(data);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bookings']);
        showNotification({
          title: 'Invoice created successfully',
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

export const useBookingStatsById = (bookingId, enabled = true) =>
  useQuery({
    queryKey: ['booking-stats-by-id', bookingId],
    queryFn: async () => {
      const res = await fetchBookingStatsById(bookingId);
      return res?.data;
    },
    enabled,
    onError: onApiError,
  });

export const useUserSalesByUserId = (payload, enabled = true) =>
  useQuery({
    queryKey: ['user-sales-by-user-id', payload],
    queryFn: async () => {
      const res = await fetchUserSalesByUserId(payload);
      return res?.data;
    },
    enabled,
    onError: onApiError,
  });

export const useCalendarEvents = (payload, enabled = true) =>
  useQuery({
    queryKey: ['calendar-events', payload],
    queryFn: async () => {
      const res = await fetchCalendarEvents(payload);
      return res?.data;
    },
    enabled,
    onError: onApiError,
  });

export const useExportBookings = () =>
  useMutation(
    async ({ type, query }) => {
      const res = await exportBookings(type, query);
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

export const useExportBooking = () =>
  useMutation(
    async ({ bookingId }) => {
      const res = await exportBooking(bookingId);
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
