import { useMutation } from '@tanstack/react-query';
import { uploadPhoto } from '../requests/fileUpload.requests';

// eslint-disable-next-line import/prefer-default-export
export const useUploadPhoto = () =>
  useMutation(async data => {
    const res = await uploadPhoto(data);
    return res;
  });
