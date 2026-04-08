import axios from 'axios';

// Se existir uma variável de ambiente VITE_API_URL, usa ela. 
// Caso contrário, usa o localhost (para quando você estiver testando no seu PC).
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: API_URL
});

export default api;
export { API_URL };
