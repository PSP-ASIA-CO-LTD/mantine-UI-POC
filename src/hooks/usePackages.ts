import { useState, useEffect, useCallback } from 'react';
import { API } from '../api';
import type { Package } from '../types';

export function usePackages() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchPackages = useCallback(async () => {
        try {
            setLoading(true);
            const data = await API.getPackages();
            setPackages(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch packages'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);

    return { packages, loading, error, refetch: fetchPackages };
}
