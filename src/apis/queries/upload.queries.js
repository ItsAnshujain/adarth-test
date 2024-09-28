import { showNotification } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { deleteUploadedFile, fileUpload } from '../requests/upload.requests';

export const useUploadFile = () =>
  useMutation(
    async data => {
      const res = await fileUpload(data);
      return res?.data;
    },
    {
      onSuccess: () => {
        showNotification({
          title: 'File uploaded successfully',
          autoClose: 3000,
          color: 'green',
        });
      },
      onError: err => {
        showNotification({
          title: 'Error',
          message: err?.message,
          autoClose: 3000,
          color: 'red',
        });
      },
    },
  );

export const useDeleteUploadedFile = () =>
  useMutation(
    async key => {
      const res = await deleteUploadedFile(key);
      return res?.data;
    },
    {
      onSuccess: () => {
        showNotification({
          title: 'File deleted successfully',
          autoClose: 3000,
          color: 'green',
        });
      },
      onError: err => {
        showNotification({
          title: 'Error',
          message: err?.message,
          autoClose: 3000,
          color: 'red',
        });
      },
    },
  );
