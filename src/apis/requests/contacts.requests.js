import urlcat from 'urlcat';
import http from '../http';

const fetchContacts = payload => http.get(urlcat('/contact', payload));

export const fetchContactById = id => http.get(urlcat(`/contact/${id}`));

export const addContact = payload => http.post('/contact', payload);

export const updateContact = (id, payload) => http.patch(`/contact/${id}`, payload);

export const deleteContact = id => http.delete(`/contact/${id}`);

export default fetchContacts;
