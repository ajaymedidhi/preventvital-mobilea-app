import { API_URL } from '../api/client';
import { getLocalProductImage } from './productAssets';

export const getImageUrl = (imagePath: string | undefined, images: string[] | undefined): any => {
    // 1. Determine the path to use
    let path = imagePath;
    if (!path && images && images.length > 0) {
        path = images[0];
    }

    if (!path) {
        return { uri: 'https://via.placeholder.com/300' }; // Fallback
    }

    // 2. Try to find a local bundled asset first
    const localAsset = getLocalProductImage(path);
    if (localAsset) {
        return localAsset; // Returns the local require()
    }

    // 3. Check if it's already a full URL
    if (path.startsWith('http')) {
        return { uri: path };
    }

    // 4. Prepend API_URL for relative paths
    // Ensure path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // Safety check: ensure direct backend serving
    return { uri: `${API_URL}${normalizedPath}` };
};
