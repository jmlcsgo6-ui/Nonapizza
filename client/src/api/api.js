import axios from 'axios';

// Usamos a URL do servidor que você acabou de criar no Vercel
const API_URL = import.meta.env.VITE_API_URL || 'https://nonapizza-lk8e.vercel.app';

const api = axios.create({
    baseURL: API_URL
});

export default api;
export { API_URL };
