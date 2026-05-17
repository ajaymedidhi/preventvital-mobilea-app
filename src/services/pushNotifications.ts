/**
 * Push Notifications Service
 * Package: expo-notifications (already installed)
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import client from '../api/client';

let N: any = null;
try { N = require('expo-notifications'); } catch { /* package not installed */ }

if (N) {
    N.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
}

export async function registerForPushNotifications(): Promise<string | null> {
    if (!N) return null;

    if (Platform.OS === 'android') {
        await N.setNotificationChannelAsync('default', {
            name: 'PreventVital',
            importance: N.AndroidImportance?.HIGH ?? 4,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#51A6CB',
        });
    }

    const { status: existing } = await N.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
        const { status } = await N.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) return null;

    try {
        const tokenData = await N.getExpoPushTokenAsync({ projectId });
        const token: string = tokenData.data;

        await client.post('/api/users/push-token', { token, platform: Platform.OS });
        return token;
    } catch {
        return null;
    }
}

export async function scheduleDailyVitalsReminder(): Promise<void> {
    if (!N) return;
    await N.cancelAllScheduledNotificationsAsync();
    await N.scheduleNotificationAsync({
        content: {
            title: 'Time to log your vitals',
            body: 'Keep your health streak alive — tap to log your readings.',
            data: { screen: 'ManualVitalsEntry' },
        },
        trigger: { type: 'daily', hour: 9, minute: 0 },
    });
}

export function useNotificationListener(onReceive: (n: any) => void): any {
    return N?.addNotificationReceivedListener(onReceive) ?? null;
}

export function useNotificationResponseListener(onResponse: (r: any) => void): any {
    return N?.addNotificationResponseReceivedListener(onResponse) ?? null;
}
