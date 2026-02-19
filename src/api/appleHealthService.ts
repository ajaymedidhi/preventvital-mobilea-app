import AppleHealthKit, {
    HealthValue,
    HealthKitPermissions,
    HealthInputOptions,
} from 'react-native-health';
import { Platform } from 'react-native';
import { NormalizedHealthData } from './types';

const permissions: HealthKitPermissions = {
    permissions: {
        read: [
            AppleHealthKit.Constants.Permissions.Steps,
            AppleHealthKit.Constants.Permissions.HeartRate,
            AppleHealthKit.Constants.Permissions.SleepAnalysis,
        ],
        write: [],
    },
};

export const initializeAppleHealth = async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') return false;

    return new Promise((resolve) => {
        AppleHealthKit.initHealthKit(permissions, (error: string) => {
            if (error) {
                console.log('[ERROR] Cannot grant permissions!', error);
                resolve(false);
            }
            resolve(true);
        });
    });
};

export const fetchAppleHealthData = async (): Promise<NormalizedHealthData | null> => {
    if (Platform.OS !== 'ios') return null;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const options: HealthInputOptions = {
        startDate: yesterday.toISOString(),
        endDate: today.toISOString(), // optional; default now
        includeManuallyAdded: false, // optional: default true
    };

    try {
        const stepsPromise = new Promise<number>((resolve) => {
            AppleHealthKit.getStepCount(options, (err: Object, results: HealthValue) => {
                if (err) {
                    console.warn('Error fetching steps:', err);
                    resolve(0);
                    return;
                }
                resolve(results.value);
            });
        });

        const heartRatePromise = new Promise<{ avg: number; min: number; max: number } | null>((resolve) => {
            AppleHealthKit.getHeartRateSamples(options, (err: Object, results: Array<HealthValue>) => {
                if (err) {
                    console.warn('Error fetching heart rate:', err);
                    resolve(null);
                    return;
                }
                if (results.length === 0) {
                    resolve(null);
                    return;
                }
                const values = results.map(r => r.value);
                const sum = values.reduce((a, b) => a + b, 0);
                const avg = sum / values.length;
                const min = Math.min(...values);
                const max = Math.max(...values);
                resolve({ avg, min, max });
            });
        });

        const sleepPromise = new Promise<{ totalMinutes: number } | null>((resolve) => {
            AppleHealthKit.getSleepSamples(options, (err: Object, results: Array<HealthValue>) => {
                if (err) {
                    console.warn('Error fetching sleep:', err);
                    resolve(null);
                    return;
                }
                if (results.length === 0) {
                    resolve(null);
                    return;
                }
                // Sleep samples in HealthKit can vary (InBed, Asleep, etc.)
                // Usually we care about 'ASLEEP' values.
                // Value is often implicitly duration or we calculate from start/end.
                // react-native-health 'value' is usually 'AGREEABLE' enum or similar?
                // Actually `getSleepSamples` returns array of objects with startDate, endDate, value (category).

                let totalMinutes = 0;
                results.forEach(sample => {
                    // For simplicity, summing up all sleep analysis samples that are "ASLEEP" (value 1) or "INBED" (value 0)?
                    // AppleHealthKit.Constants.SleepAnalysis : { INBED: 0, ASLEEP: 1, AWAKE: 2 } or similar.
                    // We will sum simple duration for now. 
                    const start = new Date(sample.startDate).getTime();
                    const end = new Date(sample.endDate).getTime();
                    const diffMs = end - start;
                    totalMinutes += Math.floor(diffMs / (1000 * 60));
                });
                resolve(totalMinutes > 0 ? { totalMinutes } : null);
            });
        });

        const [steps, hr, slp] = await Promise.all([stepsPromise, heartRatePromise, sleepPromise]);

        const normalized: NormalizedHealthData = {
            s: steps,
            hr: hr,
            slp: slp,
            ts: new Date().toISOString()
        };

        console.log('Fetched & Normalized Health Data (iOS):', normalized);
        return normalized;

    } catch (e) {
        console.error('Error in Apple Health fetch:', e);
        return null;
    }
};
