import http from '../http';

// eslint-disable-next-line import/prefer-default-export
export const shareReport = data => http.post('/report', data);
