import { showNotification } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  campaign,
  campaignReport,
  campaigns,
  campaignStats,
  createCampaign,
  deleteCampaign,
  updateCampaign,
  updateCampaignMedia,
  updateCampaignStatus,
} from '../requests/campaigns.requests';

export const useCampaigns = (query, enabled = true) =>
  useQuery(
    ['campaigns', query],
    async () => {
      const res = await campaigns(query);
      return res.data;
    },
    {
      enabled,
    },
  );

export const useCampaign = ({ id, query }, enabled = true) =>
  useQuery(
    ['campaign', id, query],
    async () => {
      const res = await campaign(id, query);
      return res.data;
    },
    {
      enabled: !!id && enabled,
    },
  );

export const useCreateCampaign = () =>
  useMutation(
    async data => {
      const res = await createCampaign(data);
      return res.data;
    },
    {
      onSuccess: () => {
        showNotification({
          title: 'Campaign Successfully Added',
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

export const useUpdateCampaign = () =>
  useMutation(
    async ({ id, data }) => {
      const res = await updateCampaign(id, data);
      return res.data;
    },
    {
      onSuccess: () => {
        showNotification({
          title: 'Campaign Successfully Updated',
          color: 'green',
        });
      },
      onError: err => {
        if (err?.statusCode === 403 || err?.statusCode === 406) {
          showNotification({
            title: 'You are not authorized to perform this action',
            color: 'red',
          });
        } else {
          showNotification({
            title: err?.message,
            color: 'red',
          });
        }
      },
    },
  );

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async query => {
      const res = await deleteCampaign(query);
      return res.data;
    },
    {
      onSuccess: () => {
        showNotification({
          title: 'Campaign Successfully Deleted',
          color: 'green',
        });
        queryClient.invalidateQueries(['campaigns']);
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

export const useUpdateCampaignMedia = () =>
  useMutation(
    async ({ id, placeId, data }) => {
      const res = await updateCampaignMedia(id, placeId, data);
      return res?.data;
    },
    {
      onSuccess: () => {
        showNotification({
          title: 'Campaign Successfully Updated',
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

export const useUpdateCampaignStatus = () =>
  useMutation(
    async ({ id, placeId, data }) => {
      const res = await updateCampaignStatus(id, placeId, data);
      return res?.data;
    },
    {
      onSuccess: () => {
        showNotification({
          title: 'Campaign status successfully updated',
          color: 'green',
        });
      },
      onError: err => {
        if (err?.statusCode === 403 || err?.statusCode === 406) {
          showNotification({
            title: 'You are not authorized to perform this action',
            color: 'red',
          });
        } else {
          showNotification({
            title: err?.message,
            color: 'red',
          });
        }
      },
    },
  );

export const useCampaignStats = (enabled = true) =>
  useQuery(
    ['campaign-stats'],
    async () => {
      const res = await campaignStats();
      return res?.data;
    },
    { enabled },
  );

export const useCampaignReport = (query, enabled = true) =>
  useQuery(
    ['campaign-report', query],
    async () => {
      const res = await campaignReport(query);
      return res?.data;
    },
    { enabled },
  );
