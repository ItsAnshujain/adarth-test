import urlcat from 'urlcat';
import http from '../http';

export const createInventory = data => http.post('/inventory', data);

export const fetchInventory = query => http.get(`/inventory?${query}`);

export const fetchInventoryById = inventoryId => http.get(`/inventory/${inventoryId}`);

export const updateInventory = (inventoryId, data) => http.patch(`/inventory/${inventoryId}`, data);

export const updateInventories = (queries, data) => http.patch(`/inventory${queries}`, data);

export const deleteInventoryById = inventoryId => http.delete(`/inventory/${inventoryId}`);

export const deleteInventory = query => http.delete(`/inventory${query}`);

export const csvImport = data => http.post('/inventory/csv-import', data, { hasFiles: true });

export const fetchBookingsByInventoryId = (inventoryId, query) =>
  http.get(`/inventory/${inventoryId}/bookings?${query}`);

export const inventoryStats = filter => http.get(`/inventory/stats?${filter}`);

export const inventoryReport = query => http.get(`/inventory/report?${query}`);

export const fetchInventoryReportList = query => http.get(`/inventory/report-list?${query}`);

export const shareInventory = (queries, data) =>
  http.post(`/inventory/share-inventory?${queries}`, data);

export const fetchDistinctAdditionalTags = () =>
  http.get(urlcat('/inventory/distinct-additional-tags'));

export const fetchDistinctCities = () => http.get(urlcat('/inventory/distinct-cities'));
