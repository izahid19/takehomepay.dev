import axios from 'axios';
import { BACKEND_URL } from './config';

import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // Send cookies with requests
});

// Add interceptor to include token
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add interceptor for error handling if needed
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized or other global errors here
    return Promise.reject(error);
  }
);

export default api;
