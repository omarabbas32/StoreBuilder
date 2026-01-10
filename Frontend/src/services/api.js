import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false, // Set to true if using httpOnly cookies
});

// Request interceptor - attach JWT token
apiClient.interceptors.request.use(
    (config) => {
        // Get token from auth store (will be implemented)
        const token = localStorage.getItem('auth_token'); // Temporary - will use Zustand

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle standardized structure
apiClient.interceptors.response.use(
    (response) => {
        // If it's a standardized backend response
        if (response.data && response.data.success !== undefined) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            };
        }
        // Fallback for non-standardized/external APIs
        return {
            success: true,
            data: response.data
        };
    },
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.response?.data?.error || 'An unexpected error occurred';

        // Log error for developers
        console.error(`API Error [${status}]:`, message);

        if (status === 401) {
            localStorage.removeItem('auth_token');
            // We could trigger a global event or store action here to redirect to login
        }

        // Return standardized error object instead of throwing
        // to simplify service implementation
        return {
            success: false,
            error: message,
            status: status
        };
    }
);

export default apiClient;
