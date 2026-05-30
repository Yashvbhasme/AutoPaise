const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const stripTrailingSlash = (value) => value.replace(/\/+$/, '');

export const API_BASE_URL = rawApiBaseUrl
  ? stripTrailingSlash(rawApiBaseUrl)
  : 'http://localhost:4000';

export const buildBackendUrl = (path = '') => {
  if (!path) {
    return API_BASE_URL;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};
