import axios from 'axios';
import { Platform } from 'react-native';
import { fetchHealthData as fetchGoogleFit } from './googleFitService';
import { fetchAppleHealthData } from './appleHealthService';
import { NormalizedHealthData } from './types';

import client from './client';

export const syncVitals = async (): Promise<boolean> => {
    try {
        let data: NormalizedHealthData | null = null;

        if (Platform.OS === 'android') {
            data = await fetchGoogleFit();
        } else if (Platform.OS === 'ios') {
            data = await fetchAppleHealthData();
        }

        if (!data) {
            console.log('No health data fetching or platform not supported.');
            return false;
        }

        // De-duplication check (Time-based MVP)
        // Check if we already synced data with this timestamp recently
        // In a real app, use AsyncStorage to persist last sync timestamp.

        console.log('Sending Vitals to Backend:', data);

        // Retry logic 
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                // Real backend call
                await client.post('/api/vitals', data);
                console.log('Vitals synced successfully!');
                return true;
            } catch (err: any) {
                attempts++;
                console.warn(`Sync attempt ${attempts} failed:`, err.message);
                if (attempts >= maxAttempts) {
                    console.error('Final sync failure:', err.response?.data);
                    throw err;
                }
                await new Promise(r => setTimeout(r, 1000 * attempts)); // Exponential backoff-ish
            }
        }

        return false;

    } catch (error) {
        console.error('Vitals Sync failed:', error);
        return false;
    }
};

export const getVitals = async (): Promise<NormalizedHealthData | null> => {
    try {
        console.log('Fetching Vitals from Backend...');
        const response = await client.get('/api/vitals/latest');

        if (response.data && response.data.status === 'success') {
            return response.data.data.vitals;
        }

        return null;
    } catch (error) {
        console.error('Failed to fetch vitals from backend:', error);
        return null; // Return null instead of mock data if the backend call fails or is empty
    }
};
