import client from './client';

export const login = async (email: string, password: string): Promise<{ token: string; user: any }> => {
    try {
        const response = await client.post('/api/auth/login', { email, password });
        return { token: response.data.token, user: response.data.data.user };
    } catch (error: any) {
        const msg = error.response?.data?.message || error.message;
        console.log('Login error:', msg);
        throw new Error(msg || 'Login failed');
    }
};

export const signup = async (userData: any): Promise<{ token: string; user: any }> => {
    try {
        const response = await client.post('/api/auth/signup', userData);
        return { token: response.data.token, user: response.data.data.user };
    } catch (error: any) {
        const msg = error.response?.data?.message || error.message;
        console.log('Signup error:', msg);
        throw new Error(msg || 'Signup failed');
    }
};

export const fetchMe = async (): Promise<any> => {
    try {
        // According to routes, /api/users/me returns { data: { user, vitalScore } }
        const response = await client.get('/api/users/me');
        return response.data.data.user;
    } catch (error: any) {
        const msg = error.response?.data?.message || error.message;
        console.log('Fetch Me error:', msg);
        throw new Error(msg || 'Failed to fetch user data');
    }
};

export const updateOnboarding = async (userData: any): Promise<void> => {
    try {
        await client.put('/api/users/profile/onboarding', userData);
    } catch (error: any) {
        const msg = error.response?.data?.message || error.message;
        console.log('Onboarding Update error:', msg);
        throw new Error(msg || 'Failed to update profile');
    }
};

// Deprecated: sendOtp/verifyOtp (Removed or kept for reference if needed, but switching to Email/Password)
// If we strictly follow the new plan which implies Email/Password for the web backend:

export const calculateAssessmentScore = async (formData: any, token: string): Promise<any> => {
    try {
        const response = await client.post('/api/vitals/calculate-score', formData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error: any) {
        const msg = error.response?.data?.message || error.message;
        console.log('Scoring error:', msg);
        throw new Error(msg || 'Failed to calculate score');
    }
};
