import axios from 'axios';
import { BACKEND_URL } from './config';

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // Send cookies with requests
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
