import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { 
    Package, Guardian, Resident, Room, SalesOrder, Invoice, Contract,
    AdditionalServices, CompleteSalesOrderData 
} from '../types';

const STORAGE_KEY = 'bourbon44_sales_orders';
const DRAFT_KEY = 'bourbon44_current_draft';

interface SalesOrderContextValue {
    // Current draft being edited
    currentDraft: CompleteSalesOrderData | null;
    // All saved orders
    savedOrders: CompleteSalesOrderData[];
    // Draft operations
    initNewDraft: () => string;
    updateDraft: (data: Partial<CompleteSalesOrderData>) => void;
    saveDraft: () => void;
    clearDraft: () => void;
    loadDraft: (id: string) => boolean;
    // Order operations
    getOrderById: (id: string) => CompleteSalesOrderData | undefined;
    getOrderBySalesOrderId: (salesOrderId: string) => CompleteSalesOrderData | undefined;
    updateOrder: (id: string, data: Partial<CompleteSalesOrderData>) => void;
    deleteOrder: (id: string) => void;
    // Summary helpers for invoice/contract
    getPayingGuardians: (order?: CompleteSalesOrderData | null) => Guardian[];
    getPrimaryGuardian: (order?: CompleteSalesOrderData | null) => Guardian | null;
    calculateTotalPrice: (order?: CompleteSalesOrderData | null) => { subtotal: number; tax: number; total: number };
}

const defaultAdditionalServices: AdditionalServices = {
    additionalBed: false,
    specialAmenities: [],
    selfProvidePampers: false,
    selfProvideMedications: false
};

const createEmptyDraft = (): CompleteSalesOrderData => ({
    id: `draft-${Date.now()}`,
    package: null,
    adjustedDays: 0,
    checkIn: null,
    checkOut: null,
    guardians: [],
    primaryContactGuardianId: null,
    resident: null,
    room: null,
    additionalServices: { ...defaultAdditionalServices },
    salesOrder: null,
    invoice: null,
    contract: null,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
});

const SalesOrderContext = createContext<SalesOrderContextValue | null>(null);

export function SalesOrderProvider({ children }: { children: ReactNode }) {
    const [currentDraft, setCurrentDraft] = useState<CompleteSalesOrderData | null>(null);
    const [savedOrders, setSavedOrders] = useState<CompleteSalesOrderData[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const storedOrders = localStorage.getItem(STORAGE_KEY);
            if (storedOrders) {
                setSavedOrders(JSON.parse(storedOrders));
            }
            
            const storedDraft = localStorage.getItem(DRAFT_KEY);
            if (storedDraft) {
                setCurrentDraft(JSON.parse(storedDraft));
            }
        } catch (error) {
            console.error('Failed to load sales order data from storage:', error);
        }
    }, []);

    // Persist saved orders to localStorage
    useEffect(() => {
        if (savedOrders.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(savedOrders));
        }
    }, [savedOrders]);

    // Persist current draft to localStorage
    useEffect(() => {
        if (currentDraft) {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(currentDraft));
        } else {
            localStorage.removeItem(DRAFT_KEY);
        }
    }, [currentDraft]);

    const initNewDraft = useCallback(() => {
        const draft = createEmptyDraft();
        setCurrentDraft(draft);
        return draft.id;
    }, []);

    const updateDraft = useCallback((data: Partial<CompleteSalesOrderData>) => {
        setCurrentDraft(prev => {
            if (!prev) {
                const newDraft = createEmptyDraft();
                return { ...newDraft, ...data, updatedAt: new Date().toISOString() };
            }
            return { ...prev, ...data, updatedAt: new Date().toISOString() };
        });
    }, []);

    const saveDraft = useCallback(() => {
        if (!currentDraft) return;
        
        setSavedOrders(prev => {
            const existingIndex = prev.findIndex(o => o.id === currentDraft.id);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = { ...currentDraft, updatedAt: new Date().toISOString() };
                return updated;
            }
            return [...prev, { ...currentDraft, updatedAt: new Date().toISOString() }];
        });
    }, [currentDraft]);

    const clearDraft = useCallback(() => {
        setCurrentDraft(null);
        localStorage.removeItem(DRAFT_KEY);
    }, []);

    const loadDraft = useCallback((id: string) => {
        const order = savedOrders.find(o => o.id === id);
        if (order) {
            setCurrentDraft({ ...order });
            return true;
        }
        return false;
    }, [savedOrders]);

    const getOrderById = useCallback((id: string) => {
        return savedOrders.find(o => o.id === id);
    }, [savedOrders]);

    const getOrderBySalesOrderId = useCallback((salesOrderId: string) => {
        return savedOrders.find(o => o.salesOrder?.id === salesOrderId);
    }, [savedOrders]);

    const updateOrder = useCallback((id: string, data: Partial<CompleteSalesOrderData>) => {
        setSavedOrders(prev => prev.map(order => 
            order.id === id 
                ? { ...order, ...data, updatedAt: new Date().toISOString() }
                : order
        ));
    }, []);

    const deleteOrder = useCallback((id: string) => {
        setSavedOrders(prev => prev.filter(o => o.id !== id));
    }, []);

    const getPayingGuardians = useCallback((order?: CompleteSalesOrderData | null) => {
        const target = order || currentDraft;
        if (!target) return [];
        return target.guardians.filter(g => g.pays);
    }, [currentDraft]);

    const getPrimaryGuardian = useCallback((order?: CompleteSalesOrderData | null) => {
        const target = order || currentDraft;
        if (!target || target.guardians.length === 0) return null;
        return target.guardians.find(g => g.id === target.primaryContactGuardianId) || target.guardians[0];
    }, [currentDraft]);

    const calculateTotalPrice = useCallback((order?: CompleteSalesOrderData | null) => {
        const target = order || currentDraft;
        if (!target || !target.package) {
            return { subtotal: 0, tax: 0, total: 0 };
        }

        const pkg = target.package;
        const days = target.adjustedDays || pkg.duration;
        
        // Base package price (adjusted for days)
        const dailyRate = pkg.price / pkg.duration;
        let subtotal = dailyRate * days;

        // Room price
        if (target.room) {
            subtotal += target.room.pricePerDay * days;
        }

        // Additional services
        if (target.additionalServices) {
            if (target.additionalServices.additionalBed) {
                subtotal += 500 * days;
            }
            target.additionalServices.specialAmenities.forEach(amenity => {
                if (amenity === 'oxygen_concentrator') subtotal += 300 * days;
                if (amenity === 'air_mattress') subtotal += 200 * days;
            });
        }

        const tax = subtotal * 0.07;
        const total = subtotal + tax;

        return { subtotal, tax, total };
    }, [currentDraft]);

    return (
        <SalesOrderContext.Provider value={{
            currentDraft,
            savedOrders,
            initNewDraft,
            updateDraft,
            saveDraft,
            clearDraft,
            loadDraft,
            getOrderById,
            getOrderBySalesOrderId,
            updateOrder,
            deleteOrder,
            getPayingGuardians,
            getPrimaryGuardian,
            calculateTotalPrice
        }}>
            {children}
        </SalesOrderContext.Provider>
    );
}

export function useSalesOrder() {
    const context = useContext(SalesOrderContext);
    if (!context) {
        throw new Error('useSalesOrder must be used within a SalesOrderProvider');
    }
    return context;
}
