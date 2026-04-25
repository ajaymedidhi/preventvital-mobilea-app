import { Platform } from 'react-native';
import { NormalizedHealthData } from './types';

export const initializeAppleHealth = async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') return false;
    console.log('Apple Health integration is currently disabled for build stability.');
    return false;
};

export const fetchAppleHealthData = async (): Promise<NormalizedHealthData | null> => {
    if (Platform.OS !== 'ios') return null;
    console.log('Apple Health data fetching is currently disabled.');
    return null;
};

