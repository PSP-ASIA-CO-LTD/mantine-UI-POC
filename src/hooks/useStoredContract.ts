import { useState, useCallback } from 'react';
import { API } from '../api';
import type { StoredContract, ContractEmailLogEntry } from '../types';

export function useStoredContract() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const getStoredContractBySalesOrderId = useCallback(async (salesOrderId: string) => {
        setLoading(true);
        try {
            return await API.getStoredContractBySalesOrderId(salesOrderId);
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const upsertStoredContract = useCallback(async (contract: StoredContract) => {
        setLoading(true);
        try {
            return await API.upsertStoredContract(contract);
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logEmail = useCallback(async (id: string, entry: Omit<ContractEmailLogEntry, 'id' | 'sentAt'>) => {
        setLoading(true);
        try {
            return await API.logStoredContractEmail(id, entry);
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const signContract = useCallback(async (id: string, email: string) => {
        setLoading(true);
        try {
            return await API.signStoredContract(id, email);
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        getStoredContractBySalesOrderId,
        upsertStoredContract,
        logEmail,
        signContract,
        loading,
        error
    };
}
