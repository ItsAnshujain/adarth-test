import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { onApiError } from '../../utils';
import fetchCompanies, {
  addCompany,
  deleteCompany,
  fetchCompanyById,
  fetchStateAndStateCode,
  updateCompany,
} from '../requests/companies.requests';

export const useCompanyById = (id, enabled = true) =>
  useQuery({
    queryKey: ['company-by-id', id],
    queryFn: async () => {
      const res = await fetchCompanyById(id);
      return res?.data;
    },
    enabled,
    onError: onApiError,
  });

const useCompanies = (query, enabled = true) =>
  useQuery({
    queryKey: ['companies', query],
    queryFn: async () => {
      const res = await fetchCompanies(query);
      return res?.data;
    },
    enabled,
    onError: onApiError,
  });

export const useInfiniteCompanies = ({ ...query }, enabled = true) =>
  useInfiniteQuery({
    queryKey: ['infinite-companies', query],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetchCompanies({ ...query, page: pageParam || 1 });

      return res.data;
    },
    enabled,
    getNextPageParam: lastPage => (lastPage.hasNextPage ? +lastPage.pagingCounter + 1 : undefined),
  });

export const useAddCompany = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async data => {
      const res = await addCompany(data);
      return res;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['companies']);
        queryClient.invalidateQueries(['infinite-companies']);
      },
      onError: onApiError,
    },
  );
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, ...data }) => {
      const res = await updateCompany(id, data);
      return res;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['companies']);
        queryClient.invalidateQueries(['company-by-id']);
      },
      onError: onApiError,
    },
  );
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async id => {
      const res = await deleteCompany(id);
      return res;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['companies']);
      },
      onError: onApiError,
    },
  );
};

export const useStateAndStateCode = (search, enabled = true) =>
  useQuery({
    queryKey: ['state-and-state-code', search],
    queryFn: async () => {
      const res = await fetchStateAndStateCode(search);
      return res?.data;
    },
    enabled,
    onError: onApiError,
  });

export default useCompanies;
