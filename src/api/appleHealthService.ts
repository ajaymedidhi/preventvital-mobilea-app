import { Platform } from 'react-native';
import { NormalizedHealthData } from './types';

export const initializeAppleHealth = async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') return false;
    return false;
};

export const fetchAppleHealthData = async (): Promise<NormalizedHealthData | null> => {
    if (Platform.OS !== 'ios') return null;
    return null;
};
