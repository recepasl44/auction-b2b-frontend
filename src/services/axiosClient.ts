import axios from 'axios';

const axiosClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://backendauction.recepaslan.com.tr',
    headers: { 'Content-Type': 'application/json' }
});

axiosClient.interceptors.request.use((config) => {
    if (!config.headers) {
        config.headers = {};
    }

    const isRefreshEndpoint = config.url?.includes('/auth/refresh');

    if (typeof window !== 'undefined') {
        const tokenKey = isRefreshEndpoint ? 'custom-refresh-token' : 'custom-auth-token';
        const token = localStorage.getItem(tokenKey);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});
let isRefreshing = false;
let failedQueue: Array<(token: string) => void> = [];

function processQueue(token: string) {
    failedQueue.forEach((cb) => cb(token));
    failedQueue = [];
}

axiosClient.interceptors.response.use(
    response => response,
   async error => {
        const originalRequest = error.config;
        if (error.response?.data?.message === 'Geçersiz veya süresi dolmuş token' && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    failedQueue.push((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(axiosClient(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;
            try {
                const resp = await axiosClient.post<{ token: string }>('/auth/refresh');
                const newToken = resp.data?.token;
                if (newToken) {
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('custom-auth-token', newToken);
                    }
                    processQueue(newToken);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axiosClient(originalRequest);
                }
            } catch (refreshError) {
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
