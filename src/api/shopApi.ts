import client from './client';

export const getProducts = async () => {
    const response = await client.get('/api/shop/products');
    return response.data;
};

export const createOrder = async (orderData: {
    items: { product: string; quantity: number }[];
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
}) => {
    // The backend route is /api/shop/create-order based on shopRoutes.js
    const response = await client.post('/api/shop/create-order', orderData);
    return response.data;
};

export const verifyPayment = async (verificationData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    items: any[];
    totalAmount: number;
    shippingAddress: any;
}) => {
    // The backend route is /api/shop/verify-payment based on shopRoutes.js
    const response = await client.post('/api/shop/verify-payment', verificationData);
    return response.data;
};

export const getMyOrders = async () => {
    const response = await client.get('/api/shop/orders/my');
    return response.data;
};
