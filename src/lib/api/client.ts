import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor — attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail || 'An unexpected error occurred';

    switch (status) {
      case 401:
        toast.error('Session expired. Please log in again.');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        break;
      case 403:
        toast.error('You do not have permission to perform this action.');
        break;
      case 422:
        toast.error('Invalid request data. Please check your inputs.');
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        if (status && status >= 400) {
          toast.error(detail);
        }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
