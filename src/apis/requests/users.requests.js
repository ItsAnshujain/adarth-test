import http from '../http';

export const fetchUsers = query => http.get(`/users?${query}`);

export const fetchUsersById = usersById => http.get(`/users/${usersById}`);

export const createUsers = data => http.post('/users', data);

export const updateUsers = (userId, data) => http.patch(`/users/${userId}`, data);

export const deleteUsers = (userId, data) => http.delete(`/users/${userId}`, data);

export const addPeers = query => http.patch(`/users?${query}`);
