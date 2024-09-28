import http from '../http';

export const fileUpload = data =>
  http.post('/file-upload', data, {
    hasFiles: true,
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteUploadedFile = keyId => http.delete(`/file-upload/${keyId}`);
