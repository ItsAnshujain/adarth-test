import { showNotification } from '@mantine/notifications';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProposal,
  createProposalTerms,
  deleteProposal,
  fetchProposalById,
  fetchProposals,
  generateProposalPdf,
  shareProposal,
  updateProposal,
  fetchProposalTerms,
  fetchProposalTermById,
  deleteProposalVersion,
  fetchProposalVersions,
  restoreProposal,
  fetchProposalByVersionName,
  generatePublicProposalDoc,
  updateProposalTerms,
  deleteProposalTerms,
} from '../requests/proposal.requests';
import { onApiError } from '../../utils';

export const useCreateProposal = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async data => {
      const res = await createProposal(data);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['proposals']);
        showNotification({
          title: 'Proposal added successfully',
          color: 'green',
        });
      },
      onError: err => {
        showNotification({
          title: err?.message,
          color: 'red',
        });
      },
    },
  );
};

export const useFetchProposals = (query, enabled = true, retry = false) =>
  useQuery(
    ['proposals', query],
    async () => {
      const res = await fetchProposals(query);
      return res?.data;
    },
    {
      enabled,
      retry,
    },
  );

export const useFetchProposalById = (proposalId, enabled = true) =>
  useQuery(
    ['proposals-by-id', proposalId],
    async () => {
      const res = await fetchProposalById(proposalId);
      return res?.data;
    },
    {
      enabled,
    },
  );

export const useUpdateProposal = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ proposalId, data }) => {
      const res = await updateProposal(proposalId, data);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['proposals']);
        showNotification({
          title: 'Proposal updated successfully',
          color: 'green',
        });
      },
      onError: err => {
        showNotification({
          title: err?.message,
          color: 'red',
        });
      },
    },
  );
};

export const useDeleteProposal = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ proposalId }) => {
      const res = await deleteProposal(proposalId);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['proposals']);
        showNotification({
          title: 'Proposal deleted successfully',
          color: 'green',
        });
      },
      onError: err => {
        showNotification({
          title: err?.message,
          color: 'red',
        });
      },
    },
  );
};

export const useShareProposal = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, queries, data }) => {
      const res = await shareProposal(id, queries, data);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['proposals-by-id']);
      },
      onError: err => {
        showNotification({
          title: err?.message,
          color: 'red',
        });
      },
    },
  );
};

export const useGenerateProposalPdf = () =>
  useMutation(async ({ id, queries }) => {
    const res = await generateProposalPdf(id, queries);
    return res?.data;
  });

export const useCreateProposalTerms = () =>
  useMutation({
    mutationFn: async payload => {
      const res = await createProposalTerms(payload);
      return res;
    },
    onError: onApiError,
  });

export const useUpdateProposalTerms = () =>
  useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const res = await updateProposalTerms(id, payload);
      return res;
    },
    onError: onApiError,
  });

export const useDeleteProposalTerms = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async id => {
      const res = await deleteProposalTerms(id);
      return res;
    },
    onError: onApiError,
    onSuccess: () => queryClient.invalidateQueries(['proposal-terms']),
  });
};
export const useProposalTerms = (query, enabled = true) =>
  useQuery({
    queryKey: ['proposal-terms', query],
    queryFn: async () => {
      const res = await fetchProposalTerms(query);
      return res?.data;
    },
    enabled,
    onError: onApiError,
  });

export const useProposalTermsById = (proposalTermId, enabled = true) =>
  useQuery({
    queryKey: ['proposal-term-by-id', proposalTermId],
    queryFn: async () => {
      const res = await fetchProposalTermById(proposalTermId);
      return res?.data;
    },
    enabled,
    onError: onApiError,
  });

// For Proposal Version

export const useProposalVersions = ({ id, ...query }, enabled = true) =>
  useInfiniteQuery({
    queryKey: ['proposal-versions', id],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetchProposalVersions({ ...query, page: pageParam || 1 }, id);

      return res.data;
    },
    enabled,
    getNextPageParam: lastPage => (lastPage.hasNextPage ? +lastPage.pagingCounter + 1 : undefined),
  });

export const useDeleteProposalVersion = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async versionId => {
      const res = await deleteProposalVersion(versionId);
      return res?.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['proposal-versions']);
        showNotification({
          title: 'Proposal version deleted successfully',
          color: 'green',
        });
      },
      onError: err => {
        showNotification({
          title: err?.message,
          color: 'red',
        });
      },
    },
  );
};

export const useRestoreProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proposalId, versionId }) => {
      const res = await restoreProposal(proposalId, versionId);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['proposal-versions']);
      showNotification({
        title: 'Proposal version deleted successfully',
        color: 'green',
      });
    },
    onError: onApiError,
  });
};

// For public link

export const useProposalByVersionName = (versionId, enabled = true) =>
  useQuery(
    ['proposals-by-version', versionId],
    async () => {
      const res = await fetchProposalByVersionName(versionId);
      return res?.data;
    },
    {
      enabled,
    },
  );

export const useGeneratePublicProposal = () =>
  useMutation(async ({ proposalId, queries, payload }) => {
    const res = await generatePublicProposalDoc(proposalId, queries, payload);
    return res?.data;
  });
