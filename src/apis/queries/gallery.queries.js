import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteImage,
  deleteMultipleImages,
  fetchGalleryImages,
  uploadImages,
} from '../requests/gallery.requests';

// eslint-disable-next-line import/prefer-default-export
export const useUploadImages = () =>
  useMutation(async files => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const res = await uploadImages(formData);
    return res;
  });

export const useFetchGalleryImages = (query, enabled = true, retry = false) =>
  useQuery(
    ['galleryImages', query],
    async () => {
      const res = await fetchGalleryImages(query);
      return res?.data;
    },
    {
      enabled,
      retry,
    },
  );

export const useDeleteImage = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async id => {
      const res = await deleteImage(id);
      return res;
    },
    {
      onSuccess: () => queryClient.invalidateQueries(['galleryImages']),
    },
  );
};

export const useDeleteImages = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ids => {
      const res = await deleteMultipleImages(ids);
      return res;
    },
    {
      onSuccess: () => queryClient.invalidateQueries(['galleryImages']),
    },
  );
};
