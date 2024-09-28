import urlcat from 'urlcat';
import http from '../http';

export const fetchPayment = payload => http.get(urlcat('/payment', payload));

export const fetchPaymentById = id => http.get(urlcat('/payment/:id', { id }));

export const createPayment = payload => http.post(urlcat('/payment'), payload);

export const updatePayment = (id, payload) => http.patch(urlcat('/payment/:id', { id }), payload);

export const deletePayment = id => http.delete(urlcat('/payment/:id', { id }));
