import { Platform } from 'react-native';

import { fetchAppleHealthData } from './appleHealthService';
import { NormalizedHealthData } from './types';

import client from './client';

export const syncVitals = async (): Promise<boolean> => {
    try {
        let data: NormalizedHealthData | null = null;

        if (Platform.OS === 'android') {
            return true;
        } else if (Platform.OS === 'ios') {
            data = await fetchAppleHealthData();
        }

        if (!data) {
            return false;
        }

        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                await client.post('/api/wearable/sync/applehealth', data);
                return true;
            } catch (err: unknown) {
                attempts++;
                if (attempts >= maxAttempts) return false;
                await new Promise(r => setTimeout(r, 1000 * attempts));
            }
        }

        return false;
    } catch {
        return false;
    }
};

export const getVitals = async (): Promise<NormalizedHealthData | null> => {
    try {
        const response = await client.get('/api/vitals/latest');
        if (response.data && response.data.status === 'success') {
            return response.data.data.vitals;
        }
        return null;
    } catch {
        return null;
    }
};

export const getAssessmentHistory = async (): Promise<unknown[]> => {
    try {
        const response = await client.get('/api/vitals/assessments');
        if (response.data && response.data.status === 'success') {
            return response.data.data.assessments || [];
        }
        return [];
    } catch {
        return [];
    }
};
