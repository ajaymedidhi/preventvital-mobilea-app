import client from './client';

export const createSubscription = async (planId: string, interval: 'monthly' | 'annual'): Promise<any> => {
    try {
        const response = await client.post('/api/subscriptions/create', { planId, interval });
        return response.data.subscription;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to create subscription');
    }
};

export const verifySubscription = async (paymentData: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
    planId: string;
}): Promise<any> => {
    try {
        const response = await client.post('/api/subscriptions/verify', paymentData);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to verify subscription');
    }
};

export const fetchMySubscription = async (): Promise<any> => {
    try {
        const response = await client.get('/api/users/my-subscription');
        return response.data.data;
    } catch {
        return null;
    }
};
