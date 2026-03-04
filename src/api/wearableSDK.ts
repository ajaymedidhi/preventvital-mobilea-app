import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from './client';

const { CVitalHealthKitBridge } = NativeModules;
const healthKitEmitter = CVitalHealthKitBridge ? new NativeEventEmitter(CVitalHealthKitBridge) : null;

// Normalizer
export const normalizeVital = (rawData: any, source: string) => {
    return {
        timestamp: rawData.timestamp || new Date().toISOString(),
        source,
        deviceModel: rawData.deviceModel || 'unknown',
        heartRate: rawData.heartRate || null,
        systolic: rawData.systolic || null,
        diastolic: rawData.diastolic || null,
        spo2: rawData.spo2 || null,
        temperature: rawData.temperature || null,
        respiratoryRate: rawData.respiratoryRate || null,
        steps: rawData.steps || null,
        bloodGlucose: rawData.bloodGlucose || null,
    };
};

export class WearableSDK {
    // 1. HealthKit (iOS Only)
    static async requestHealthKitPermissions() {
        if (Platform.OS !== 'ios' || !CVitalHealthKitBridge) {
            throw new Error('HealthKit is only available on iOS');
        }
        return await CVitalHealthKitBridge.requestPermissions();
    }

    static subscribeToHealthKit(onData: (vital: any) => void) {
        if (!healthKitEmitter) return null;
        return healthKitEmitter.addListener('onVitalData', (data) => {
            const normalized = normalizeVital(data, 'Apple HealthKit');
            onData(normalized);
            this.syncWithBackend([normalized]);
        });
    }

    // 2. Cloud Integrations (Fitbit)
    static async connectFitbit(code: string) {
        try {
            // Exchanges code for token on backend which then fetches data
            const response = await client.post('/api/wearables/oauth/fitbit/token', { code });
            return response.data;
        } catch (error) {
            console.error('Fitbit linking failed', error);
            throw error;
        }
    }

    // 3. Backend Sync
    static async syncWithBackend(vitals: any[]) {
        try {
            const response = await client.post('/api/wearables/ingest', { vitals });
            return response.data;
        } catch (error) {
            // Offline caching logic
            console.warn('Sync failed, caching offline', error);
            const cached = await AsyncStorage.getItem('@cvital_offline');
            const parsed = cached ? JSON.parse(cached) : [];
            await AsyncStorage.setItem('@cvital_offline', JSON.stringify([...parsed, ...vitals]));
        }
    }

    static async syncOfflineData() {
        const cached = await AsyncStorage.getItem('@cvital_offline');
        if (!cached) return;
        const vitals = JSON.parse(cached);
        if (vitals.length > 0) {
            try {
                await client.post('/api/wearables/ingest', { vitals });
                await AsyncStorage.removeItem('@cvital_offline');
            } catch (error) {
                console.error('Failed to sync offline data', error);
            }
        }
    }
}
