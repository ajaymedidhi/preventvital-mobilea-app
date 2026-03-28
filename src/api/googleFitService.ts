import GoogleFit, { Scopes } from 'react-native-google-fit';
import { Platform } from 'react-native';
import { NormalizedHealthData } from './types';

const options = {
    scopes: [
        Scopes.FITNESS_ACTIVITY_READ,
        Scopes.FITNESS_BODY_READ,
        Scopes.FITNESS_SLEEP_READ,
        Scopes.FITNESS_HEART_RATE_READ,
    ],
};

export const initializeGoogleFit = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;

    console.log('GoogleFit Object:', GoogleFit);
    if (!GoogleFit) {
        console.error('GoogleFit module is null. Native module not linked?');
        return false;
    }

    try {
        // authorized checks if the app is authorized.
        const authResult = await GoogleFit.authorize(options);
        if (authResult.success) {
            console.log('Google Fit authorized');
            return true;
        } else {
            console.log('Google Fit authorization failed', authResult.message);
            return false;
        }
    } catch (e) {
        console.error('Error initializing Google Fit:', e);
        return false;
    }
};



export const fetchHealthData = async (): Promise<NormalizedHealthData | null> => {
    if (Platform.OS !== 'android') return null;
    if (!GoogleFit) {
        console.error('GoogleFit module is null during fetch.');
        return null;
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const opt = {
        startDate: yesterday.toISOString(),
        endDate: today.toISOString(),
    };

    try {
        const stepsRes = await GoogleFit.getDailyStepCountSamples(opt);
        const heartRateRes = await GoogleFit.getHeartRateSamples(opt);
        const sleepRes = await GoogleFit.getSleepSamples(opt, false); // false for no callback, or just use it if needed

        // Normalize Steps
        let steps = 0;
        if (stepsRes && stepsRes.length > 0) {
            // Google Fit can return multiple sources (phone, watch). 
            // Usually we take the one with the 'com.google.android.gms' data source or merge them.
            // For simplicity, we sum steps from the first merged stream if available, or just the first one.
            // A more robust way is often to look for the "com.google.android.gms:merge_step_deltas" source.

            const mergedSource = stepsRes.find(s => s.source === 'com.google.android.gms:estimated_steps' || s.source === 'com.google.android.gms:merge_step_deltas');
            const targetSource = mergedSource || stepsRes[0];

            // stepsRes is an array of objects which contains 'steps' array.
            // We need to sum up the values in that array for the day.
            if (targetSource && targetSource.steps) {
                targetSource.steps.forEach(step => {
                    steps += step.value;
                });
            }
        }

        // Normalize Heart Rate
        let hrStats = null;
        if (heartRateRes && heartRateRes.length > 0) {
            const values = heartRateRes.map(h => h.value);
            const sum = values.reduce((a, b) => a + b, 0);
            const avg = sum / values.length;
            const min = Math.min(...values);
            const max = Math.max(...values);
            hrStats = { avg, min, max };
        }

        // Normalize Sleep
        let sleepMinutes = 0;
        if (sleepRes && sleepRes.length > 0) {
            // sleepRes contains start/end times.
            sleepRes.forEach(session => {
                const start = new Date(session.startDate).getTime();
                const end = new Date(session.endDate).getTime();
                const diffMs = end - start;
                sleepMinutes += Math.floor(diffMs / (1000 * 60));
            });
        }

        const normalized: NormalizedHealthData = {
            s: steps,
            hr: hrStats,
            slp: sleepMinutes > 0 ? { totalMinutes: sleepMinutes } : null,
            ts: new Date().toISOString()
        };

        console.log('Fetched & Normalized Health Data (Android):', normalized);
        return normalized;

    } catch (error) {
        console.error('Error fetching health data', error);
        return null;
    }
};
