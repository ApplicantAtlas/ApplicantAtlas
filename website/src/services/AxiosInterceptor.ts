// axios.js
import axios from 'axios';
import { eventEmitter } from '../events/EventEmitter';
import { API_URL } from '../config/constants';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor for API calls
api.interceptors.request.use(
  config => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.data && error.response.data.error) {
      // Emit a custom event with the error message
      eventEmitter.emit('apiError', error.response.data.msg);
    } 
    if (error.response && error.response.status == 401) {
      window.location.href = '/logout'; // Redirect to logout if not already on login page 
    } 
    return Promise.reject(error);
  }
);

export default api;