export const ProductAssets: { [key: string]: any } = {
    'bp_monitor.png': require('../../assets/products/bp_monitor.png'),
    'ecg_patch.png': require('../../assets/products/ecg_patch.png'),
    'gluco_smart.png': require('../../assets/products/gluco_smart.png'),
    'vital_watch.png': require('../../assets/products/vital_watch.png'),
    // Add new products here as they are added to the assets folder
};

export const getLocalProductImage = (path: string | undefined) => {
    if (!path) return null;
    
    // Extract filename from path (e.g. "/products/bp_monitor.png" -> "bp_monitor.png")
    const filename = path.split('/').pop();
    
    if (filename && ProductAssets[filename]) {
        return ProductAssets[filename];
    }
    
    return null;
};
