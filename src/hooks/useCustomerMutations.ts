import { useState } from 'react';
import { API } from '../api';
import type { Guardian, Resident } from '../types';

export function useCustomerMutations() {
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const saveGuardian = async (data: Omit<Guardian, 'id' | 'createdAt'>) => {
        setProcessing(true);
        setError(null);
        try {
            const result = await API.saveGuardian(data);
            return result;
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error('Failed to save guardian');
            setError(errorObj);
            throw errorObj;
        } finally {
            setProcessing(false);
        }
    };

    const saveResident = async (data: Omit<Resident, 'id' | 'createdAt'>) => {
        setProcessing(true);
        setError(null);
        try {
            const result = await API.saveResident(data);
            return result;
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error('Failed to save resident');
            setError(errorObj);
            throw errorObj;
        } finally {
            setProcessing(false);
        }
    };

    const updateGuardian = async (id: string, data: Partial<Guardian>) => {
        setProcessing(true);
        setError(null);
        try {
            const result = await API.updateGuardian(id, data);
            return result;
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error('Failed to update guardian');
            setError(errorObj);
            throw errorObj;
        } finally {
            setProcessing(false);
        }
    };

    return {
        saveGuardian,
        saveResident,
        updateGuardian,
        processing,
        error
    };
}
