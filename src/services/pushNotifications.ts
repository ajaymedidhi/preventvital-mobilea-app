/**
 * Push Notifications Service
 * Requires: npx expo install expo-notifications
 * Until installed, all functions are no-ops.
 */

import { Platform } from 'react-native';
import client from '../api/client';

// Dynamic require so TS doesn't need the package installed to compile
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const { status: existing } = await N.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
        const { status } = await N.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    const tokenData = await N.getExpoPushTokenAsync();
    const token: string = tokenData.data;

    try {
        await client.post('/api/users/push-token', { token, platform: Platform.OS });
    } catch (e) {
        console.warn('Failed to register push token', e);
    }

    if (Platform.OS === 'android') {
        await N.setNotificationChannelAsync('default', {
            name: 'PreventVital',
            importance: N.AndroidImportance?.HIGH,
            vibrationPattern: [0, 250, 250, 250],
        });
    }

    return token;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useNotificationListener(onReceive: (n: any) => void): any {
    return N?.addNotificationReceivedListener(onReceive) ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useNotificationResponseListener(onResponse: (r: any) => void): any {
    return N?.addNotificationResponseReceivedListener(onResponse) ?? null;
}
