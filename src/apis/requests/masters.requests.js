import http from '../http';

export const fetchMasterTypes = () => http.get('/masters/types');

export const createMaster = data => http.post('/masters', data);

export const fetchMasters = query => http.get(`/masters?${query}`);

export const fetchMasterById = masterId => http.get(`/masters/${masterId}`);

export const updateMaster = (masterId, data) => http.patch(`/masters/${masterId}`, data);

export const deleteMaster = masterId => http.delete(`/masters/${masterId}`);
