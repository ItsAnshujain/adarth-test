import { USER_TOKEN_ID_KEY } from '../utils/config';

const API_URL = import.meta.env.VITE_API_BASE_URL;
console.log('Environment Variables:', import.meta.env);

console.log("API URL: ", API_URL);
/**
 * Generate HTTP headers
 * @param {Object} headers
 */
const getHeader = (headers = {}, hasFiles = false) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const tokenId = localStorage.getItem(USER_TOKEN_ID_KEY);
  if (tokenId) {
    const { state } = JSON.parse(tokenId);
    defaultHeaders.Authorization = `Bearer ${state.token}`;
  }

  const newHeaders = {
    ...defaultHeaders,
    ...headers,
  };

  if (hasFiles) {
    delete newHeaders['Content-Type'];
  }

  return newHeaders;
};

/**
 * Generate HTTP body
 * @param {Object} body
 * @param {Boolean} hasFiles
 */
const getBody = (body, hasFiles = false) => {
  if (hasFiles) {
    return body;
  }

  return JSON.stringify(body);
};

/**
 * Handle HTTP error
 * @param {Number} httpStatusCode
 * @param {Object | Error} response
 */
const handleError = (httpStatusCode, response = {}) => {
  if (httpStatusCode === 403 || httpStatusCode === 406) {
    if (!response?.data?.errors?.cause) {
      localStorage.clear();
      window.location.href = '/login';
    }
    throw response;
  }

  if (httpStatusCode === 401) {
    if (response?.data?.errors?.cause === 'TERMS_CONDITION_NOT_ACCEPTED') {
      window.location.href = '/terms-conditions';
      throw response;
    } else if (window.location.pathname !== '/login') {
      localStorage.clear();
      window.location.href = '/login';
      throw response;
    }
  }

  if (httpStatusCode === 429) {
    throw new Error('Too Many Requests.');
  }

  if (httpStatusCode < 200 || httpStatusCode > 302) {
    throw response;
  }
};

/**
 * Generate Request URL
 * @param {String} url
 * @param {Object} options
 */
const generateURL = (url, options = {}) => {
  if (options.url) {
    return options.url;
  }

  let prefix = '';
  if (options.prefix) {
    prefix = options.prefix;
  }

  return API_URL + prefix + url;
};

/**
 * HTTP GET Request
 * @method GET
 * @param {String} url
 * @param {Object} options
 */
const httpGet = async (url, option = { headers: {} }) => {
  const result = await fetch(generateURL(url), {
    method: 'GET',
    headers: getHeader(option.headers),
  });

  const response = await result.json();
  handleError(result.status, response);
  return response;
};

/**
 * HTTP POST Request
 * @method POST
 * @param {String} url
 * @param {Object} options
 */
const httpPost = async (url, body = {}, option = { headers: {}, hasFiles: false }) => {
  const result = await fetch(generateURL(url, option), {
    method: 'POST',
    headers: getHeader(option.headers, option.hasFiles),
    body: getBody(body, option.hasFiles),
  });
  if (result.status === 204) {
    return result;
  }

  let response;
  if (result?.status !== 429) response = await result.json();

  handleError(result.status, response);
  return response;
};

/**
 * HTTP PUT Request
 * @method PUT
 * @param {String} url
 * @param {Object} options
 */
const httpPut = async (url, body = {}, option = { headers: {}, hasFiles: false }) => {
  const result = await fetch(generateURL(url), {
    method: 'PUT',
    headers: getHeader(option.headers, option.hasFiles),
    body: getBody(body, option.hasFiles),
  });

  const response = await result.json();
  handleError(result.status, response);
  return response;
};

/**
 * HTTP PATCH Request
 * @method PATCH
 * @param {String} url
 * @param {Object} options
 */
const httpPatch = async (url, body = {}, option = { headers: {}, hasFiles: false }) => {
  const result = await fetch(generateURL(url), {
    method: 'PATCH',
    headers: getHeader(option.headers, option.hasFiles),
    body: getBody(body, option.hasFiles),
  });

  const response = await result.json();
  handleError(result.status, response);
  return response;
};

/**
 * HTTP DELETE Request
 * @method DELETE
 * @param {String} url
 * @param {Object} options
 */
const httpDelete = async (url, body = {}, option = { headers: {}, hasFiles: false }) => {
  const result = await fetch(generateURL(url), {
    method: 'DELETE',
    headers: getHeader(option.headers, option.hasFiles),
    body: getBody(body, option.hasFiles),
  });

  const response = await result.json();
  handleError(result.status, response);
  return response;
};

const http = {
  get: httpGet,
  post: httpPost,
  put: httpPut,
  patch: httpPatch,
  delete: httpDelete,
};

export default http;
