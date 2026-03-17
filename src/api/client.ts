import axios from 'axios';
import { getToken } from './storage';
import { Platform } from 'react-native';

// const API_URL = 'https://prevent-vital-backend.onrender.com';
const LOCAL_IP = '192.168.31.86';
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5001' : `http://${LOCAL_IP}:5001`;
// For physical devices on Android, you might still need the local IP, but 10.0.2.2 is standard for emulators.

const client = axios.create({
    baseURL: API_URL,
    timeout: 15000,
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
    (error) => {
        return Promise.reject(error);
    }
);

export default client;
