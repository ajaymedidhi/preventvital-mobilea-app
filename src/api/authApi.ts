import client from './client';

export const login = async (email: string, password: string): Promise<string> => {
    try {
        const response = await client.post('/api/auth/login', { email, password });
        return response.data.token;
    } catch (error: any) {
        console.error('Login error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Login failed');
    }
};

export const signup = async (userData: any): Promise<string> => {
    try {
        const response = await client.post('/api/auth/signup', userData);
        return response.data.token;
    } catch (error: any) {
        console.error('Signup error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Signup failed');
    }
};

export const updateOnboarding = async (userData: any): Promise<void> => {
    try {
        await client.put('/api/users/profile/onboarding', userData);
    } catch (error: any) {
        console.error('Onboarding Update error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
};

// Deprecated: sendOtp/verifyOtp (Removed or kept for reference if needed, but switching to Email/Password)
// If we strictly follow the new plan which implies Email/Password for the web backend:

