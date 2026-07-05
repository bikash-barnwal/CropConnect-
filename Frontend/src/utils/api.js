import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_API_URL || 'https://cropconnect-un44.onrender.com';

const api = axios.create({
    baseURL: BASE_URL,
});

// Add JWT token to headers if present
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('cropconnect_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
