import { useState } from 'react';
import { API } from '../api';
import type { SalesOrder, Invoice, Contract, Package, Resident } from '../types';

export function useSalesOrderMutations() {
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createSalesOrder = async (data: Omit<SalesOrder, 'id' | 'createdAt'>) => {
        setProcessing(true);
        setError(null);
        try {
            return await API.createSalesOrder(data);
        } catch (err) {
            const e = err instanceof Error ? err : new Error('Failed to create sales order');
            setError(e);
            throw e;
        } finally {
            setProcessing(false);
        }
    };

    const createInvoice = async (data: Omit<Invoice, 'id' | 'invoiceNumber' | 'issuedAt'>) => {
        setProcessing(true);
        setError(null);
        try {
            return await API.createInvoice(data);
        } catch (err) {
            const e = err instanceof Error ? err : new Error('Failed to create invoice');
            setError(e);
            throw e;
        } finally {
            setProcessing(false);
        }
    };

    const updateInvoice = async (id: string, data: Partial<Invoice>) => {
        setProcessing(true);
        setError(null);
        try {
            return await API.updateInvoice(id, data);
        } catch (err) {
            const e = err instanceof Error ? err : new Error('Failed to update invoice');
            setError(e);
            throw e;
        } finally {
            setProcessing(false);
        }
    };

    const updateSalesOrder = async (id: string, data: Partial<SalesOrder>) => {
        setProcessing(true);
        setError(null);
        try {
            return await API.updateSalesOrder(id, data);
        } catch (err) {
            const e = err instanceof Error ? err : new Error('Failed to update sales order');
            setError(e);
            throw e;
        } finally {
            setProcessing(false);
        }
    };

    const createContract = async (data: Omit<Contract, 'id' | 'contractNumber'>) => {
        setProcessing(true);
        setError(null);
        try {
            return await API.createContract(data);
        } catch (err) {
            const e = err instanceof Error ? err : new Error('Failed to create contract');
            setError(e);
            throw e;
        } finally {
            setProcessing(false);
        }
    };

    const generateTasks = async (
        salesOrder: SalesOrder,
        pkg: Package,
        resident: Resident,
        roomNumber: string
    ) => {
        setProcessing(true);
        setError(null);
        try {
            return await API.generateTasksFromPackage(salesOrder, pkg, resident, roomNumber);
        } catch (err) {
            const e = err instanceof Error ? err : new Error('Failed to generate tasks');
            setError(e);
            throw e;
        } finally {
            setProcessing(false);
        }
    };

    return {
        createSalesOrder,
        createInvoice,
        updateInvoice,
        updateSalesOrder,
        createContract,
        generateTasks,
        processing,
        error
    };
}
