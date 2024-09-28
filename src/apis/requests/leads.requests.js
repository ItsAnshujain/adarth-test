import urlcat from 'urlcat';
import http from '../http';

const fetchLeads = query => http.get(`/lead?${query}`);

export const fetchLeadsStats = () => http.get(urlcat('/lead/stats'));

export const fetchLeadsStatsByUID = (id, query) => http.get(urlcat(`/lead/stats/${id}?${query}`));

export const fetchLeadById = id => http.get(`/lead/${id}`);

export const addLead = payload => http.post('/lead', payload);

export const updateLead = (id, payload) => http.patch(`/lead/${id}`, payload);

export const deleteLead = id => http.delete(`/lead/${id}`);

export const leadAgencyStats = filter => http.get(`/lead/agency/stats?${filter}`);

export default fetchLeads;
