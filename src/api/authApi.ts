import client from './client';

export const preWarmBackend = async (): Promise<void> => {
    try {
        await client.get('/api/public/ping');
    } catch {
        // Silent — pre-warm is best-effort only
    }
};

export const login = async (email: string, password: string): Promise<{ token: string; user: unknown }> => {
    try {
        const response = await client.post('/api/auth/login', { email, password });
        return { token: response.data.token, user: response.data.data.user };
    } catch (error: unknown) {
        const msg = (error as any)?.response?.data?.message || (error as Error)?.message;
        throw new Error(msg || 'Login failed');
    }
};

export const signup = async (userData: unknown): Promise<{ token: string; user: unknown }> => {
    try {
        const response = await client.post('/api/auth/signup', userData);
        return { token: response.data.token, user: response.data.data.user };
    } catch (error: unknown) {
        const msg = (error as any)?.response?.data?.message || (error as Error)?.message;
        throw new Error(msg || 'Signup failed');
    }
};

export const fetchMe = async (): Promise<unknown> => {
    try {
        const response = await client.get('/api/users/me');
        return response.data.data.user;
    } catch (error: unknown) {
        const msg = (error as any)?.response?.data?.message || (error as Error)?.message;
        throw new Error(msg || 'Failed to fetch user data');
    }
};

export const updateOnboarding = async (userData: unknown): Promise<void> => {
    try {
        await client.put('/api/users/profile/onboarding', userData);
    } catch (error: unknown) {
        const msg = (error as any)?.response?.data?.message || (error as Error)?.message;
        throw new Error(msg || 'Failed to update profile');
    }
};

export const calculateAssessmentScore = async (formData: unknown, token: string): Promise<unknown> => {
    try {
        const response = await client.post('/api/vitals/calculate-score', formData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data;
    } catch (error: unknown) {
        const msg = (error as any)?.response?.data?.message || (error as Error)?.message;
        throw new Error(msg || 'Failed to calculate score');
    }
};
