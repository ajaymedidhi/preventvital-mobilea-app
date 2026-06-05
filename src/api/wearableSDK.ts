import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { getEncryptedItem, setEncryptedItem, deleteEncryptedItem } from './storage';
import client from './client';

const { CVitalHealthKitBridge } = NativeModules;
const healthKitEmitter = CVitalHealthKitBridge ? new NativeEventEmitter(CVitalHealthKitBridge) : null;

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

    static async getGoogleFitAuthUrl() {
        const response = await client.get('/api/wearables/oauth/googlefit/login');
        return response.data.url;
    }

    static async syncGoogleFit() {
        const response = await client.post('/api/wearables/sync/googlefit');
        return response.data;
    }

    static async syncWithBackend(vitals: any[]) {
        try {
            const response = await client.post('/api/wearables/ingest', { vitals });
            return response.data;
        } catch {
            const cached = await getEncryptedItem('@cvital_offline');
            const parsed = cached ? JSON.parse(cached) : [];
            await setEncryptedItem('@cvital_offline', JSON.stringify([...parsed, ...vitals]));
        }
    }

    static async syncOfflineData() {
        const cached = await getEncryptedItem('@cvital_offline');
        if (!cached) return;
        const vitals = JSON.parse(cached);
        if (vitals.length > 0) {
            try {
                await client.post('/api/wearables/ingest', { vitals });
                await deleteEncryptedItem('@cvital_offline');
            } catch {
                // Will retry on next sync
            }
        }
    }
}
