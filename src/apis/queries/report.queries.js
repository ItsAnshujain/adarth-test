import { showNotification } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { shareReport } from '../requests/report.requests';

// eslint-disable-next-line import/prefer-default-export
export const useShareReport = () =>
  useMutation(
    async data => {
      const res = await shareReport(data);
      return res?.data;
    },
    {
      onSuccess: () => {},
      onError: err => {
        showNotification({
          title: err?.message,
          color: 'red',
        });
      },
    },
  );
