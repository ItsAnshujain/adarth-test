import http from '../http';

// change the url acc to api docs
export const login = data => http.post('/auth/signin', data);

export const forgotPassword = data => http.post('/auth/forget-password', data);

export const resetPassword = data => http.post('/auth/reset-password', data);
