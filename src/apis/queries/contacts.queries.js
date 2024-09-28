import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { onApiError } from '../../utils';
import fetchContacts, {
  addContact,
  deleteContact,
  fetchContactById,
  updateContact,
} from '../requests/contacts.requests';

const useContacts = (query, enabled = true) =>
  useQuery({
    queryKey: ['contacts', query],
    queryFn: async () => {
      const res = await fetchContacts(query);
      return res?.data;
    },
    enabled,
    onError: onApiError,
  });

export const useInfiniteContacts = ({ id, ...query }, enabled = true) =>
  useInfiniteQuery({
    queryKey: ['infinite-contacts', id],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetchContacts({ ...query, page: pageParam || 1 }, id);

      return res.data;
    },
    enabled,
    getNextPageParam: lastPage => (lastPage.hasNextPage ? +lastPage.pagingCounter + 1 : undefined),
  });

export const useContactById = (id, enabled = true) =>
  useQuery({
    queryKey: ['contact-by-id', id],
    queryFn: async () => {
      const res = await fetchContactById(id);
      return res?.data;
    },
    enabled,
    onError: onApiError,
  });

export const useAddContact = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async data => {
      const res = await addContact(data);
      return res;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['contacts']);
        queryClient.invalidateQueries(['infinite-contacts']);
      },
      onError: onApiError,
    },
  );
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, ...data }) => {
      const res = await updateContact(id, data);
      return res;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['contacts']);
        queryClient.invalidateQueries(['contact-by-id']);
      },
      onError: onApiError,
    },
  );
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async id => {
      const res = await deleteContact(id);
      return res;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['contacts']);
      },
      onError: onApiError,
    },
  );
};

export default useContacts;
