import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://nonapizza-lk8e.vercel.app';

const api = axios.create({
    baseURL: API_URL
});

export default api;
export { API_URL };
