import axios from 'axios';
import { getToken, deleteToken } from './storage';

const API_URL = 'https://preventvital-api-988713182018.asia-south1.run.app';

const client = axios.create({
    baseURL: API_URL,
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await deleteToken('userToken');
        }
        return Promise.reject(error);
    }
);

export default client;
