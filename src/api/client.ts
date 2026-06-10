import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, deleteToken, setToken } from './storage';

// Local backend URL (using local IP 192.168.31.86 and port 5001 to work on both simulators/emulators and physical devices)
// Production URL: https://preventvital-api-988713182018.asia-south1.run.app
export const API_URL = __DEV__
    ? 'http://192.168.31.86:5001'
    : 'https://preventvital-api-988713182018.asia-south1.run.app';

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 500;

// Module augmentation so we can attach retry state to the config object
declare module 'axios' {
    interface InternalAxiosRequestConfig {
        _retryCount?: number;
        _isRetry?: boolean;
    }
}

const client = axios.create({
    baseURL: API_URL,
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Called by the app to wire up the offline banner
let _networkStatusCallback: ((online: boolean) => void) | null = null;

export function setNetworkStatusCallback(cb: ((online: boolean) => void) | null) {
    _networkStatusCallback = cb;
}

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const isNetworkError = (error: AxiosError): boolean =>
    !error.response && Boolean(error.request);

const isRetryableError = (error: AxiosError, attempt: number): boolean => {
    if (attempt >= MAX_RETRIES) return false;
    // Retry on network errors (offline, DNS failure, etc.) and 5xx server errors
    if (isNetworkError(error)) return true;
    const status = error.response?.status ?? 0;
    return status >= 500 && status !== 501; // Don't retry "Not Implemented"
};

client.interceptors.request.use(
    async (config) => {
        const token = await getToken('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

client.interceptors.response.use(
    (response) => {
        // Any successful response means we're online
        _networkStatusCallback?.(true);
        return response;
    },
    async (error: AxiosError) => {
        const config = error.config as InternalAxiosRequestConfig | undefined;

        // Propagate online/offline state
        if (isNetworkError(error)) {
            _networkStatusCallback?.(false);
        } else {
            _networkStatusCallback?.(true);
        }

        // Auto-refresh JWT on 401 (expired access token)
        if (error.response?.status === 401 && config && !config._isRetry) {
            config._isRetry = true;
            try {
                const refresh = await getToken('refreshToken');
                if (refresh) {
                    // Make direct POST to avoid interceptor recursion loop
                    const refreshResponse = await axios.post(`${API_URL}/api/auth/refresh-token`, {
                        refreshToken: refresh
                    });
                    
                    if (refreshResponse.data && refreshResponse.data.token) {
                        const newAccessToken = refreshResponse.data.token;
                        const newRefreshToken = refreshResponse.data.refreshToken || refresh;
                        
                        await setToken('userToken', newAccessToken);
                        await setToken('refreshToken', newRefreshToken);
                        
                        config.headers.Authorization = `Bearer ${newAccessToken}`;
                        return client(config);
                    }
                }
            } catch (refreshErr) {
                // If refresh call itself fails, clean up and propagate error
                await deleteToken('userToken');
                await deleteToken('refreshToken');
                return Promise.reject(refreshErr);
            }
            
            // If no refresh token exists, delete legacy credentials and reject
            await deleteToken('userToken');
            await deleteToken('refreshToken');
            return Promise.reject(error);
        }

        // Don't retry if no config (e.g. request was cancelled)
        if (!config) return Promise.reject(error);

        const attempt = config._retryCount ?? 0;
        if (isRetryableError(error, attempt)) {
            config._retryCount = attempt + 1;
            const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt); // 500ms, 1s, 2s
            await sleep(delay);
            return client(config);
        }

        return Promise.reject(error);
    }
);

export default client;

/**
 * Returns a human-readable message for any API/network error.
 * Use this in catch blocks instead of generic "Something went wrong".
 */
export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        if (!error.response) {
            if (error.code === 'ECONNABORTED') return 'Request timed out. Please check your connection and try again.';
            return 'No internet connection. Please check your network.';
        }
        const status = error.response.status;
        const serverMsg: string | undefined =
            (error.response.data as any)?.message ||
            (error.response.data as any)?.error;

        if (status === 400) return serverMsg || 'Invalid request. Please check your input.';
        if (status === 401) return 'Session expired. Please sign in again.';
        if (status === 403) return 'You do not have permission to do that.';
        if (status === 404) return serverMsg || 'Resource not found.';
        if (status === 409) return serverMsg || 'A conflict occurred. Please try again.';
        if (status === 422) return serverMsg || 'Invalid data submitted.';
        if (status === 429) return 'Too many requests. Please wait a moment and try again.';
        if (status >= 500) return 'Server error. Our team has been notified. Please try again shortly.';
        return serverMsg || 'An unexpected error occurred.';
    }
    if (error instanceof Error) return error.message;
    return 'An unexpected error occurred.';
}
