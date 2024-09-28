import http from '../http';

export const fetchOperationalCostData  = () => http.get('/operationalCost');

export const fetchOperationalCost = inventoryId => http.get(`/operationalCost/${inventoryId}`);

export const addOperationalCost = data => http.post('/operationalCost', data);

export const updateOperationalCost = (id, data) => http.patch(`/operationalCost/${id}`, data);

export const deleteOperationalCost = id => http.delete(`/operationalCost/${id}`);
