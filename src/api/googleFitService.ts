import { Platform } from 'react-native';
import { NormalizedHealthData } from './types';

export const initializeGoogleFit = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;
    console.log('Google Fit integration is currently disabled for build stability.');
    return false;
};

export const fetchHealthData = async (): Promise<NormalizedHealthData | null> => {
    if (Platform.OS !== 'android') return null;
    console.log('Health data fetching is currently disabled.');
    return null;
};

