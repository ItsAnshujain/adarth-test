import http from '../http';

export const fetchFinance = () => http.get('/finance');

export const updateFinanceById = (id, data) => http.patch(`/finance/${id}`, data);

export const fetchFinanceByYear = year => http.get(`/finance/${year}`);

export const fetchFinanceByYearAndMonth = query => http.get(`/finance/${query}`);

export const deleteFinanceById = (id, type) => http.delete(`/finance/${id}/${type}`);

export const shareRecord = (id, data) => http.post(`/finance/${id}/share`, data);

export const fetchSingleRecordById = id => http.get(`/finance/one/${id}`);
