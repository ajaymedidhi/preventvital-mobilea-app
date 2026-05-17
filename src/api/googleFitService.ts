import { Platform } from 'react-native';
import { NormalizedHealthData } from './types';

export const initializeGoogleFit = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;
    return false;
};

export const fetchHealthData = async (): Promise<NormalizedHealthData | null> => {
    if (Platform.OS !== 'android') return null;
    return null;
};
