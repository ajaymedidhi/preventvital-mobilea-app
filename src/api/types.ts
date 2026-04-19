export interface NormalizedHealthData {
    date: string; // ISO String
    metrics: {
        steps?: number;
        heartRate?: number;
        calories?: number;
        distance?: number;
        spo2?: number;
        sleepMinutes?: number;
    }
}
