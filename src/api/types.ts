export interface NormalizedHealthData {
    s: number; // steps
    hr: {
        avg: number;
        min: number;
        max: number;
    } | null;
    slp: {
        totalMinutes: number;
    } | null;
    ts: string; // timestamp ISO
}
