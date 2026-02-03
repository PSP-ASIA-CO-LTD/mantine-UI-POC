import { useState, useEffect, useCallback } from 'react';
import { API } from '../api';
import type { Room } from '../types';

export function useRooms(availableOnly: boolean = false) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchRooms = useCallback(async () => {
        try {
            setLoading(true);
            const data = availableOnly ? await API.getAvailableRooms() : await API.getRooms();
            setRooms(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch rooms'));
        } finally {
            setLoading(false);
        }
    }, [availableOnly]);

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    return { rooms, loading, error, refetch: fetchRooms };
}
