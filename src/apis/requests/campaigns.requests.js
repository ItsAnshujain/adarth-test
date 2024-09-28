import http from '../http';

export const campaign = (id, query) => http.get(`/campaigns/${id}?${query}`);
export const campaigns = query => http.get(`/campaigns?${query}`);
export const createCampaign = data => http.post('/campaigns', data);
export const updateCampaign = (id, data) => http.patch(`/campaigns/${id}`, data);
export const deleteCampaign = query => http.delete(`/campaigns?${query}`);
export const updateCampaignMedia = (id, placeId, data) =>
  http.patch(`/campaigns/${id}/updateMedia/${placeId}`, data);
export const updateCampaignStatus = (id, placeId, data) =>
  http.patch(`/campaigns/${id}/updateStatus/${placeId}`, data);

export const campaignStats = () => http.get('/campaigns/stats');
export const campaignReport = query => http.get(`/campaigns/report?${query}`);
