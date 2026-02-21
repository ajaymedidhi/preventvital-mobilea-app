import client from './client';

export const createSubscription = async (planId: string, interval: 'monthly' | 'annual'): Promise<any> => {
    try {
        const response = await client.post('/api/subscriptions/create', { planId, interval });
        return response.data.subscription;
    } catch (error: any) {
        console.error('Create Subscription error:', error.response?.data || error.message);
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
        console.error('Verify Subscription error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to verify subscription');
    }
};
