import axios from 'axios';
import { getToken } from './storage';
import { Platform } from 'react-native';

// Production URL (Set this to your GCP Cloud Run URL once deployed)
const PROD_URL = 'https://preventvital-api-988713182018.asia-south1.run.app'; // Fallback to Render for now
// const LOCAL_IP = '192.168.31.86';

// export const API_URL = __DEV__
//     ? (Platform.OS === 'android' ? 'http://10.0.2.2:5001' : `http://${LOCAL_IP}:5001`)
//     : PROD_URL;

const client = axios.create({
    baseURL: PROD_URL,
    timeout: 60000,
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
