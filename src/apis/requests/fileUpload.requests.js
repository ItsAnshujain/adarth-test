import http from '../http';

// eslint-disable-next-line import/prefer-default-export
export const uploadPhoto = data =>
  http.post('/file-upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
      hasFiles: true,
    },
  });
