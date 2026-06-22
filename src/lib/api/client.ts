import axios from 'axios';
import toast from 'react-hot-toast';

declare module 'axios' {
  interface AxiosRequestConfig {
    silent?: boolean;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 480000,
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
    const rawDetail = error.response?.data?.detail;
    const detail: string =
      typeof rawDetail === 'string'
        ? rawDetail
        : rawDetail && typeof rawDetail === 'object' && typeof rawDetail.message === 'string'
          ? rawDetail.message
          : 'An unexpected error occurred';

    const isSilent = error.config?.silent === true;

    if (!isSilent) {
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
    }

    return Promise.reject(error);
  }
);

/**
 * Extract a human-readable error message from an API error.
 * Works with axios errors, Error objects, and unknown thrown values.
 */
export function getApiErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    const data = response?.data as Record<string, unknown> | undefined;

    if (typeof data?.detail === 'string') return data.detail;
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.error === 'string') return data.error;
    if (data?.detail && typeof data.detail === 'object' && typeof (data.detail as Record<string, unknown>).message === 'string') {
      return (data.detail as Record<string, unknown>).message as string;
    }
  }

  if (error instanceof Error) return error.message;

  return 'Terjadi kesalahan tidak diketahui.';
}

export default apiClient;
