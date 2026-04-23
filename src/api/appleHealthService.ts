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
            AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
            AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
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
                if (err) resolve(0); else resolve(results.value || 0);
            });
        });

        const heartRatePromise = new Promise<number | undefined>((resolve) => {
            AppleHealthKit.getHeartRateSamples(options, (err: Object, results: Array<HealthValue>) => {
                if (err || results.length === 0) resolve(undefined);
                else {
                    const values = results.map(r => r.value);
                    const avg = values.reduce((a, b) => a + b, 0) / values.length;
                    resolve(Math.round(avg));
                }
            });
        });

        const caloriesPromise = new Promise<number | undefined>((resolve) => {
            AppleHealthKit.getActiveEnergyBurned(options, (err: string, results: Array<HealthValue>) => {
                if (err || !results || results.length === 0) resolve(undefined);
                else {
                    const sum = results.reduce((acc, curr) => acc + curr.value, 0);
                    resolve(Math.round(sum));
                }
            });
        });
        
        const distancePromise = new Promise<number | undefined>((resolve) => {
            AppleHealthKit.getDistanceWalkingRunning(options, (err: string, results: HealthValue) => {
                if (err || !results) resolve(undefined);
                else {
                    resolve(Math.round(results.value || 0));
                }
            });
        });

        const sleepPromise = new Promise<number | undefined>((resolve) => {
            AppleHealthKit.getSleepSamples(options, (err: Object, results: Array<HealthValue>) => {
                if (err || !results || results.length === 0) resolve(undefined);
                else {
                    let totalMinutes = 0;
                    results.forEach(sample => {
                        const start = new Date(sample.startDate).getTime();
                        const end = new Date(sample.endDate).getTime();
                        totalMinutes += Math.floor((end - start) / (1000 * 60));
                    });
                    resolve(totalMinutes);
                }
            });
        });

        const [steps, heartRate, calories, distance, sleepMinutes] = await Promise.all([
            stepsPromise, heartRatePromise, caloriesPromise, distancePromise, sleepPromise
        ]);

        const normalized: NormalizedHealthData = {
            date: new Date().toISOString(),
            metrics: {
                steps,
                heartRate,
                calories,
                distance,
                sleepMinutes
            }
        };

        return normalized;

    } catch (e) {
        console.error('Error in Apple Health fetch:', e);
        return null;
    }
};
