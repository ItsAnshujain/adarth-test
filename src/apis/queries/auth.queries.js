import { showNotification } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { forgotPassword, login, resetPassword } from '../requests/auth.requests';
import { onApiError } from '../../utils';

export const useLogin = () =>
  useMutation({
    mutationFn: async data => {
      const res = await login(data);
      return res?.data;
    },
    onSuccess: () => {
      showNotification({
        message: 'You have successfully logged in',
        color: 'green',
      });
    },
    onError: onApiError,
  });

export const useForgotPassword = () =>
  useMutation({
    mutationFn: async data => {
      const res = await forgotPassword(data);
      return res?.data;
    },
    onSuccess: () => {
      showNotification({
        title: 'Request Submitted. Please check your email for further instructions',
      });
    },
    onError: onApiError,
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: async data => {
      const res = await resetPassword(data);
      return res?.data;
    },
    onSuccess: () => {
      showNotification({
        message: 'You have successfully changed your password',
        color: 'green',
      });
    },
    onError: onApiError,
  });
