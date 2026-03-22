/*
Student Name : QIAN Ziyue
Student ID   : 1155233243
Student Name : ZHU Chunxuan
Student ID   : 1155233366
Student Name : XIONG Meini
Student ID   : 1155233445
Student Name : WANG Ziji
Student ID   : 1155233196
Student Name : WANG Yiran
Student ID   : 1155233101
*/
// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',  
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: automatically add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Unified Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized: Automatically log out
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data?.message || 'Server error');
  }
);

export default api;