import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NetworkContextType {
    isOnline: boolean;
    setIsOnline: (online: boolean) => void;
}

const NetworkContext = createContext<NetworkContextType>({
    isOnline: true,
    setIsOnline: () => {},
});

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
    const [isOnline, setIsOnline] = useState(true);

    return (
        <NetworkContext.Provider value={{ isOnline, setIsOnline }}>
            {children}
        </NetworkContext.Provider>
    );
};

export const useNetwork = () => useContext(NetworkContext);
