import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface DebugContextValue {
    isDebugMode: boolean;
    toggleDebugMode: () => void;
    setDebugMode: (enabled: boolean) => void;
}

const DebugContext = createContext<DebugContextValue | null>(null);

export function DebugProvider({ children }: { children: ReactNode }) {
    const [isDebugMode, setIsDebugMode] = useState(false);

    const toggleDebugMode = useCallback(() => {
        setIsDebugMode(prev => !prev);
    }, []);

    const setDebugMode = useCallback((enabled: boolean) => {
        setIsDebugMode(enabled);
    }, []);

    return (
        <DebugContext.Provider value={{ isDebugMode, toggleDebugMode, setDebugMode }}>
            {children}
        </DebugContext.Provider>
    );
}

export function useDebug() {
    const context = useContext(DebugContext);
    if (!context) {
        throw new Error('useDebug must be used within a DebugProvider');
    }
    return context;
}
