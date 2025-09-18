import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export default api;