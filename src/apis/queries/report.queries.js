import { showNotification } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { downloadExcel, shareReport } from '../requests/report.requests';

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

  export const useDownloadExcel = () =>
    useMutation(
      async () => {
        const res = await downloadExcel();
        return res; 
      },
      {
        onSuccess: (data) => {
          console.log('Download data:', data);
          if (data && data.s3Url) {
            const link = document.createElement('a');
            link.href = data.s3Url;
            link.setAttribute('download', 'revenue-report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
          } else {
            showNotification({
              title: 'Failed to retrieve the download link',
              color: 'red',
            });
          }
        },
        onError: (err) => {
          console.error('Error fetching download link:', err);
          showNotification({
            title: err?.message || 'An error occurred',
            color: 'red',
          });
        },
      }
    );
  
