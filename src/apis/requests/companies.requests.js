import urlcat from 'urlcat';
import http from '../http';

const fetchCompanies = payload => http.get(urlcat('/companies', payload));

export const fetchCompanyById = id => http.get(`/companies/${id}`);

export const addCompany = payload => http.post('/companies', payload);

export const updateCompany = (id, payload) => http.patch(`/companies/${id}`, payload);

export const fetchStateAndStateCode = search => http.get(urlcat(`/states?search=${search}`));

export const deleteCompany = id => http.delete(`/companies/${id}`);

export default fetchCompanies;
