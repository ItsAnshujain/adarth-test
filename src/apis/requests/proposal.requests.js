import urlcat from 'urlcat';
import http from '../http';

export const createProposal = data => http.post('/proposal', data);

export const fetchProposals = query => http.get(`/proposal?${query}`);

export const fetchProposalById = proposalId => http.get(`/proposal/${proposalId}`);

export const updateProposal = (proposalId, data) => http.patch(`/proposal/${proposalId}`, data);

export const deleteProposal = proposalId => http.delete(`/proposal/${proposalId}`);

export const shareProposal = (id, queries, data) =>
  http.post(`/proposal/${id}/share?${queries}`, data);

export const shareCustomProposal = (id, queries, data) =>
  http.post(`/proposal/${id}/customShare?${queries}`, data);

export const generateProposalPdf = (id, queries) => http.get(`/proposal/${id}/gen-pdf?${queries}`);

export const createProposalTerms = data => http.post(urlcat('/proposal-terms'), data);

export const updateProposalTerms = (id, data) => http.patch(urlcat(`/proposal-terms/${id}`), data);

export const deleteProposalTerms = id => http.delete(`/proposal-terms/${id}`);

export const fetchProposalTerms = payload => http.get(urlcat('/proposal-terms', payload));

export const fetchProposalTermById = id => http.get(urlcat('/proposal-terms/:id', { id }));

// For Proposal Versions

export const fetchProposalVersions = (payload, id) =>
  http.get(urlcat(`/proposal/${id}/versions`, payload));

export const deleteProposalVersion = versionId => http.delete(`/proposal/versions/${versionId}`);

export const restoreProposal = (proposalId, versionId) =>
  http.post(`/proposal/${proposalId}/restore/${versionId}`);

// For Public link

export const fetchProposalByVersionName = versionId => http.get(`/proposal/public/${versionId}`);

export const generatePublicProposalDoc = (id, queries, data) =>
  http.post(`/proposal/public/${id}/share?${queries}`, data);
