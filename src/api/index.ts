import { buildDatabase } from '../utils/csvParser';
import type {
    Database, Package, Staff, Team, DashboardStats,
    Guardian, Resident, Room, SalesOrder, Invoice, Contract,
    Notification, OperationTask, StaffShift, SalesDashboardStats,
    StoredContract, ContractEmailLogEntry
} from '../types';

let db: Database | null = null;

// In-memory stores for JSON data
let guardians: Guardian[] = [];
let residents: Resident[] = [];
let rooms: Room[] = [];
let salesOrders: SalesOrder[] = [];
let invoices: Invoice[] = [];
let contracts: Contract[] = [];
let notifications: Notification[] = [];
let operationTasks: OperationTask[] = [];
let staffShifts: StaffShift[] = [];

let jsonLoaded = false;

// Stored “compiled paper” contracts (localStorage-backed)
const STORED_CONTRACTS_KEY = 'bourbon44_contracts';

const loadStoredContractsFromStorage = (): StoredContract[] => {
    try {
        const raw = localStorage.getItem(STORED_CONTRACTS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as StoredContract[]) : [];
    } catch (error) {
        console.error('Failed to load stored contracts:', error);
        return [];
    }
};

const saveStoredContractsToStorage = (items: StoredContract[]) => {
    try {
        localStorage.setItem(STORED_CONTRACTS_KEY, JSON.stringify(items));
    } catch (error) {
        console.error('Failed to save stored contracts:', error);
    }
};

const loadDB = async (): Promise<Database> => {
    if (db) return db;
    try {
        db = await buildDatabase();
        return db;
    } catch (error) {
        console.error("Failed to load database:", error);
        throw error;
    }
};

const loadJSON = async <T>(url: string): Promise<T[]> => {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error(`Failed to load JSON: ${url}`, error);
        return [];
    }
};

// LocalStorage keys
const STORAGE_KEYS = {
    guardians: 'bourbon44_db_guardians',
    residents: 'bourbon44_db_residents',
    rooms: 'bourbon44_db_rooms',
    salesOrders: 'bourbon44_db_salesOrders',
    invoices: 'bourbon44_db_invoices',
    contracts: 'bourbon44_db_contracts',
    notifications: 'bourbon44_db_notifications',
    operationTasks: 'bourbon44_db_operationTasks',
    staffShifts: 'bourbon44_db_staffShifts',
};

const persist = <T>(key: string, data: T[]) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to persist data', e);
    }
};

const loadWithPersistence = async <T>(key: string, url: string): Promise<T[]> => {
    try {
        const raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.error('Failed to load persisted data', e);
    }
    const data = await loadJSON<T>(url);
    persist(key, data);
    return data;
};

const loadAllJSON = async () => {
    if (jsonLoaded) return;

    const [g, r, rm, so, inv, ctr, ntf, ot, ss] = await Promise.all([
        loadWithPersistence<Guardian>(STORAGE_KEYS.guardians, '/data/guardians.json'),
        loadWithPersistence<Resident>(STORAGE_KEYS.residents, '/data/residents.json'),
        loadWithPersistence<Room>(STORAGE_KEYS.rooms, '/data/rooms.json'),
        loadWithPersistence<SalesOrder>(STORAGE_KEYS.salesOrders, '/data/salesOrders.json'),
        loadWithPersistence<Invoice>(STORAGE_KEYS.invoices, '/data/invoices.json'),
        loadWithPersistence<Contract>(STORAGE_KEYS.contracts, '/data/contracts.json'),
        loadWithPersistence<Notification>(STORAGE_KEYS.notifications, '/data/notifications.json'),
        loadWithPersistence<OperationTask>(STORAGE_KEYS.operationTasks, '/data/operationTasks.json'),
        loadWithPersistence<StaffShift>(STORAGE_KEYS.staffShifts, '/data/staffShifts.json'),
    ]);

    guardians = g;
    residents = r;
    rooms = rm;
    salesOrders = so;
    invoices = inv;
    contracts = ctr;
    notifications = ntf;
    operationTasks = ot;
    staffShifts = ss;
    jsonLoaded = true;
};

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const API = {
    // ==================== EXISTING APIs ====================
    getPackages: async (): Promise<Package[]> => {
        await delay();
        const data = await loadDB();
        return data.packages;
    },

    getPackageById: async (id: string): Promise<Package | undefined> => {
        await delay();
        const data = await loadDB();
        return data.packages.find(p => p.id === id);
    },

    getStaff: async (): Promise<Staff[]> => {
        await delay();
        const data = await loadDB();
        return data.staff;
    },

    getTeams: async (): Promise<Team[]> => {
        await delay();
        const data = await loadDB();
        return data.teams;
    },

    getOrders: async () => {
        await delay();
        const data = await loadDB();
        return data.orders;
    },

    getTasks: async () => {
        await delay();
        const data = await loadDB();
        return data.tasks;
    },

    savePackage: async (pkgData: Partial<Package> & { id?: string }): Promise<Package> => {
        await delay(600);
        const data = await loadDB();
        if (pkgData.id) {
            const index = data.packages.findIndex(p => p.id === pkgData.id);
            if (index !== -1) {
                data.packages[index] = { ...data.packages[index], ...pkgData } as Package;
                return data.packages[index];
            }
        }
        const newPkg = { ...pkgData, id: 'pkg-' + Date.now() } as Package;
        data.packages.push(newPkg);
        return newPkg;
    },

    deletePackage: async (id: string): Promise<boolean> => {
        await delay(400);
        const data = await loadDB();
        data.packages = data.packages.filter(p => p.id !== id);
        return true;
    },

    saveTeam: async (teamData: Partial<Team> & { id: string }): Promise<Team | null> => {
        await delay(500);
        const data = await loadDB();
        const index = data.teams.findIndex(t => t.id === teamData.id);
        if (index !== -1) {
            data.teams[index] = { ...data.teams[index], ...teamData } as Team;
            return data.teams[index];
        }
        return null;
    },

    deleteTeam: async (id: string): Promise<boolean> => {
        await delay(400);
        const data = await loadDB();
        data.teams = data.teams.filter(t => t.id !== id);
        return true;
    },

    saveStaff: async (staffData: Partial<Staff> & { id: string }): Promise<Staff | null> => {
        await delay(500);
        const data = await loadDB();
        const index = data.staff.findIndex(s => s.id === staffData.id);
        if (index !== -1) {
            data.staff[index] = { ...data.staff[index], ...staffData } as Staff;
            return data.staff[index];
        }
        return null;
    },

    deleteStaff: async (id: string): Promise<boolean> => {
        await delay(400);
        const data = await loadDB();
        data.staff = data.staff.filter(s => s.id !== id);
        return true;
    },

    getDashboardStats: async (): Promise<DashboardStats> => {
        await delay();
        const data = await loadDB();
        return {
            occupancy: Math.floor(Math.random() * 20) + 70,
            pendingTasks: data.tasks.filter(t => t.status === 'pending').length,
            totalStaff: data.staff.length,
            newPurchases: data.orders.length
        };
    },

    // ==================== SALES APIs ====================
    getGuardians: async (): Promise<Guardian[]> => {
        await loadAllJSON();
        await delay();
        return guardians;
    },

    getGuardianById: async (id: string): Promise<Guardian | undefined> => {
        await loadAllJSON();
        await delay();
        return guardians.find(g => g.id === id);
    },

    saveGuardian: async (data: Omit<Guardian, 'id' | 'createdAt'>): Promise<Guardian> => {
        await loadAllJSON();
        await delay(400);
        const newGuardian: Guardian = {
            ...data,
            pays: data.pays ?? false,
            id: 'gdn-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            createdAt: new Date().toISOString()
        };
        guardians.push(newGuardian);
        persist(STORAGE_KEYS.guardians, guardians);
        return newGuardian;
    },

    updateGuardian: async (id: string, data: Partial<Guardian>): Promise<Guardian | null> => {
        await loadAllJSON();
        await delay(300);
        const index = guardians.findIndex(g => g.id === id);
        if (index !== -1) {
            guardians[index] = { ...guardians[index], ...data };
            persist(STORAGE_KEYS.guardians, guardians);
            return guardians[index];
        }
        return null;
    },

    getResidents: async (): Promise<Resident[]> => {
        await loadAllJSON();
        await delay();
        return residents;
    },

    getResidentById: async (id: string): Promise<Resident | undefined> => {
        await loadAllJSON();
        await delay();
        return residents.find(r => r.id === id);
    },

    saveResident: async (data: Omit<Resident, 'id' | 'createdAt'>): Promise<Resident> => {
        await loadAllJSON();
        await delay(400);
        const newResident: Resident = {
            ...data,
            id: 'res-' + Date.now(),
            createdAt: new Date().toISOString()
        };
        residents.push(newResident);
        persist(STORAGE_KEYS.residents, residents);
        return newResident;
    },

    getRooms: async (): Promise<Room[]> => {
        await loadAllJSON();
        await delay();
        return rooms;
    },

    getAvailableRooms: async (): Promise<Room[]> => {
        await loadAllJSON();
        await delay();
        return rooms.filter(r => r.status === 'available');
    },

    updateRoomStatus: async (id: string, status: Room['status']): Promise<Room | null> => {
        await loadAllJSON();
        await delay();
        const room = rooms.find(r => r.id === id);
        if (room) {
            room.status = status;
            persist(STORAGE_KEYS.rooms, rooms);
            return room;
        }
        return null;
    },

    getSalesOrders: async (): Promise<SalesOrder[]> => {
        await loadAllJSON();
        await delay();
        return salesOrders;
    },

    getSalesOrderById: async (id: string): Promise<SalesOrder | undefined> => {
        await loadAllJSON();
        await delay();
        return salesOrders.find(so => so.id === id);
    },

    createSalesOrder: async (data: Omit<SalesOrder, 'id' | 'createdAt'>): Promise<SalesOrder> => {
        await loadAllJSON();
        await delay(500);
        const newOrder: SalesOrder = {
            ...data,
            id: 'so-' + Date.now(),
            createdAt: new Date().toISOString()
        };
        salesOrders.push(newOrder);
        persist(STORAGE_KEYS.salesOrders, salesOrders);
        return newOrder;
    },

    updateSalesOrder: async (id: string, data: Partial<SalesOrder>): Promise<SalesOrder | null> => {
        await loadAllJSON();
        await delay(400);
        const index = salesOrders.findIndex(so => so.id === id);
        if (index !== -1) {
            salesOrders[index] = { ...salesOrders[index], ...data };
            persist(STORAGE_KEYS.salesOrders, salesOrders);
            return salesOrders[index];
        }
        return null;
    },

    getInvoices: async (): Promise<Invoice[]> => {
        await loadAllJSON();
        await delay();
        return invoices;
    },

    getInvoiceById: async (id: string): Promise<Invoice | undefined> => {
        await loadAllJSON();
        await delay();
        return invoices.find(inv => inv.id === id);
    },

    getInvoiceBySalesOrderId: async (salesOrderId: string): Promise<Invoice | undefined> => {
        await loadAllJSON();
        await delay();
        return invoices.find(inv => inv.salesOrderId === salesOrderId);
    },

    createInvoice: async (data: Omit<Invoice, 'id' | 'invoiceNumber' | 'issuedAt'>): Promise<Invoice> => {
        await loadAllJSON();
        await delay(500);
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;
        const newInvoice: Invoice = {
            ...data,
            id: 'inv-' + Date.now(),
            invoiceNumber,
            issuedAt: new Date().toISOString()
        };
        invoices.push(newInvoice);
        persist(STORAGE_KEYS.invoices, invoices);
        return newInvoice;
    },

    updateInvoice: async (id: string, data: Partial<Invoice>): Promise<Invoice | null> => {
        await loadAllJSON();
        await delay(400);
        const index = invoices.findIndex(inv => inv.id === id);
        if (index !== -1) {
            invoices[index] = { ...invoices[index], ...data };
            persist(STORAGE_KEYS.invoices, invoices);
            return invoices[index];
        }
        return null;
    },

    getContracts: async (): Promise<Contract[]> => {
        await loadAllJSON();
        await delay();
        return contracts;
    },

    getContractBySalesOrderId: async (salesOrderId: string): Promise<Contract | undefined> => {
        await loadAllJSON();
        await delay();
        return contracts.find(c => c.salesOrderId === salesOrderId);
    },

    createContract: async (data: Omit<Contract, 'id' | 'contractNumber'>): Promise<Contract> => {
        await loadAllJSON();
        await delay(500);
        const contractNumber = `CTR-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(4, '0')}`;
        const newContract: Contract = {
            ...data,
            id: 'ctr-' + Date.now(),
            contractNumber
        };
        contracts.push(newContract);
        persist(STORAGE_KEYS.contracts, contracts);
        return newContract;
    },

    // ==================== STORED (COMPILED) CONTRACTS ====================
    getStoredContracts: async (): Promise<StoredContract[]> => {
        await delay(120);
        return loadStoredContractsFromStorage().sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    },

    getStoredContractById: async (id: string): Promise<StoredContract | undefined> => {
        await delay(120);
        return loadStoredContractsFromStorage().find(c => c.id === id);
    },

    getStoredContractBySalesOrderId: async (salesOrderId: string): Promise<StoredContract | undefined> => {
        await delay(120);
        return loadStoredContractsFromStorage().find(c => c.source.salesOrder?.id === salesOrderId);
    },

    upsertStoredContract: async (contract: StoredContract): Promise<StoredContract> => {
        await delay(200);
        const all = loadStoredContractsFromStorage();
        const idx = all.findIndex(c => c.id === contract.id);
        const updated: StoredContract = { ...contract, updatedAt: new Date().toISOString() };
        if (idx >= 0) {
            all[idx] = updated;
        } else {
            all.unshift(updated);
        }
        saveStoredContractsToStorage(all);
        return updated;
    },

    signStoredContract: async (id: string, signedByEmail: string): Promise<StoredContract | null> => {
        await delay(200);
        const all = loadStoredContractsFromStorage();
        const idx = all.findIndex(c => c.id === id);
        if (idx < 0) return null;

        const now = new Date().toISOString();
        all[idx] = {
            ...all[idx],
            status: 'signed',
            signedAt: now,
            signedByEmail,
            updatedAt: now
        };
        saveStoredContractsToStorage(all);
        return all[idx];
    },

    logStoredContractEmail: async (
        id: string,
        entry: Omit<ContractEmailLogEntry, 'id' | 'sentAt'>
    ): Promise<StoredContract | null> => {
        await delay(200);
        const all = loadStoredContractsFromStorage();
        const idx = all.findIndex(c => c.id === id);
        if (idx < 0) return null;

        const logEntry: ContractEmailLogEntry = {
            ...entry,
            id: 'eml-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
            sentAt: new Date().toISOString()
        };
        all[idx] = {
            ...all[idx],
            emailLog: [...(all[idx].emailLog || []), logEntry],
            updatedAt: new Date().toISOString()
        };
        saveStoredContractsToStorage(all);
        return all[idx];
    },

    getNotifications: async (): Promise<Notification[]> => {
        await loadAllJSON();
        await delay();
        return notifications.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    },

    getUnreadNotifications: async (): Promise<Notification[]> => {
        await loadAllJSON();
        await delay();
        return notifications.filter(n => !n.readAt);
    },

    createNotification: async (data: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> => {
        await loadAllJSON();
        const newNotification: Notification = {
            ...data,
            id: 'ntf-' + Date.now(),
            createdAt: new Date().toISOString()
        };
        notifications.unshift(newNotification);
        persist(STORAGE_KEYS.notifications, notifications);
        return newNotification;
    },

    markNotificationRead: async (id: string): Promise<void> => {
        await loadAllJSON();
        const notification = notifications.find(n => n.id === id);
        if (notification) {
            notification.readAt = new Date().toISOString();
            persist(STORAGE_KEYS.notifications, notifications);
        }
    },

    getSalesDashboardStats: async (): Promise<SalesDashboardStats> => {
        await loadAllJSON();
        await delay();

        const today = new Date().toISOString().split('T')[0];
        const todayOrders = salesOrders.filter(so =>
            so.createdAt.split('T')[0] === today && so.status === 'paid'
        );

        return {
            todaySales: todayOrders.length,
            todayRevenue: todayOrders.reduce((sum, so) => sum + so.adjustedPrice, 0),
            pendingPayments: salesOrders.filter(so => so.status === 'pending_payment').length,
            activeResidents: salesOrders.filter(so => so.status === 'active').length,
            recentSales: salesOrders
                .filter(so => so.status === 'paid' || so.status === 'active')
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
        };
    },

    // ==================== OPERATION APIs ====================
    getOperationTasks: async (): Promise<OperationTask[]> => {
        await loadAllJSON();
        await delay();
        return operationTasks;
    },

    getTasksByDate: async (date: string): Promise<OperationTask[]> => {
        await loadAllJSON();
        await delay();
        return operationTasks.filter(t => t.scheduledDate === date);
    },

    getTasksByStaff: async (staffId: string): Promise<OperationTask[]> => {
        await loadAllJSON();
        await delay();
        return operationTasks.filter(t => t.assignedTo === staffId);
    },

    getTasksByDept: async (dept: string): Promise<OperationTask[]> => {
        await loadAllJSON();
        await delay();
        return operationTasks.filter(t => t.serviceDept === dept);
    },

    updateTaskStatus: async (
        id: string,
        status: OperationTask['status'],
        completedBy?: string,
        notes?: string
    ): Promise<OperationTask | null> => {
        await loadAllJSON();
        await delay(300);
        const task = operationTasks.find(t => t.id === id);
        if (task) {
            task.status = status;
            if (status === 'completed') {
                task.completedAt = new Date().toISOString();
                task.completedBy = completedBy;
            }
            if (notes) task.notes = notes;
            persist(STORAGE_KEYS.operationTasks, operationTasks);
            return task;
        }
        return null;
    },

    reassignTask: async (id: string, staffId: string, staffName: string): Promise<OperationTask | null> => {
        await loadAllJSON();
        await delay(300);
        const task = operationTasks.find(t => t.id === id);
        if (task) {
            task.assignedTo = staffId;
            task.assignedToName = staffName;
            persist(STORAGE_KEYS.operationTasks, operationTasks);
            return task;
        }
        return null;
    },

    generateTasksFromPackage: async (
        salesOrder: SalesOrder,
        pkg: Package,
        resident: Resident,
        roomNumber: string
    ): Promise<OperationTask[]> => {
        await loadAllJSON();
        await delay(500);

        const newTasks: OperationTask[] = [];
        const checkIn = new Date(salesOrder.checkIn);
        const checkOut = new Date(salesOrder.checkOut);

        for (const service of pkg.services) {
            let currentDate = new Date(checkIn);

            while (currentDate <= checkOut) {
                const shouldAdd = (() => {
                    if (service.interval === 'Daily') return true;
                    if (service.interval.includes('Every')) {
                        const days = parseInt(service.interval.match(/\d+/)?.[0] || '1');
                        const diffDays = Math.floor((currentDate.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                        return diffDays % days === 0;
                    }
                    return true;
                })();

                if (shouldAdd) {
                    const task: OperationTask = {
                        id: 'opt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                        salesOrderId: salesOrder.id,
                        residentId: resident.id,
                        residentName: `${resident.firstName} ${resident.lastName}`,
                        roomNumber,
                        serviceTitle: service.title,
                        serviceDept: service.dept,
                        description: service.description,
                        scheduledDate: currentDate.toISOString().split('T')[0],
                        status: 'pending',
                        priority: 'normal'
                    };
                    newTasks.push(task);
                }

                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        operationTasks.push(...newTasks);
        persist(STORAGE_KEYS.operationTasks, operationTasks);
        return newTasks;
    },

    getStaffShifts: async (): Promise<StaffShift[]> => {
        await loadAllJSON();
        await delay();
        return staffShifts;
    },

    getShiftsByDate: async (date: string): Promise<StaffShift[]> => {
        await loadAllJSON();
        await delay();
        return staffShifts.filter(s => s.date === date);
    },

    getShiftsByStaff: async (staffId: string): Promise<StaffShift[]> => {
        await loadAllJSON();
        await delay();
        return staffShifts.filter(s => s.staffId === staffId);
    },

    getStaffAvailability: async (startDate: string, endDate: string): Promise<{
        date: string;
        totalStaff: number;
        scheduledStaff: number;
        taskCount: number;
    }[]> => {
        await loadAllJSON();
        await delay();

        const result: { date: string; totalStaff: number; scheduledStaff: number; taskCount: number }[] = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        const allStaff = (await API.getStaff()).length;

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const dayShifts = staffShifts.filter(s => s.date === dateStr);
            const dayTasks = operationTasks.filter(t => t.scheduledDate === dateStr && t.status === 'pending');

            result.push({
                date: dateStr,
                totalStaff: allStaff,
                scheduledStaff: dayShifts.length,
                taskCount: dayTasks.length
            });
        }

        return result;
    }
};
