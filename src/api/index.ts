import { jsonCrud } from './jsonCrud';
import type {
    Package, PackageRecord, Staff, Department, DashboardStats,
    Service, ServiceRecord, Order, Task,
    Guardian, Resident, Room, SalesOrder, Invoice, Contract,
    Notification, OperationTask, StaffShift, SalesDashboardStats,
    StoredContract, ContractEmailLogEntry, BusinessProfile
} from '../types';

// In-memory stores for JSON data
let packageRecords: PackageRecord[] = [];
let departments: Department[] = [];
let serviceRecords: ServiceRecord[] = [];
let orders: Order[] = [];
let tasks: Task[] = [];
let guardians: Guardian[] = [];
let residents: Resident[] = [];
let rooms: Room[] = [];
let staffMembers: Staff[] = [];
let salesOrders: SalesOrder[] = [];
let invoices: Invoice[] = [];
let contracts: Contract[] = [];
let notifications: Notification[] = [];
let operationTasks: OperationTask[] = [];
let staffShifts: StaffShift[] = [];
let businessProfiles: BusinessProfile[] = [];

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

const isSoftDeleted = (item: any) =>
    Boolean(item?.deletedAt || item?.isDeleted || item?._deleted);

const filterActive = <T>(items: T[]): T[] =>
    items.filter((item: any) => !isSoftDeleted(item));

const loadJSON = async <T>(url: string): Promise<T[]> => {
    try {
        const response = await fetch(url, { cache: 'no-store' });
        const parsed = await response.json();
        return Array.isArray(parsed) ? filterActive(parsed as T[]) : [];
    } catch (error) {
        console.error(`Failed to load JSON: ${url}`, error);
        return [];
    }
};

// LocalStorage keys
const STORAGE_KEYS = {
    packages: 'bourbon44_db_packages',
    departments: 'bourbon44_db_departments',
    services: 'bourbon44_db_services',
    orders: 'bourbon44_db_orders',
    tasks: 'bourbon44_db_tasks',
    business: 'bourbon44_db_business',
    guardians: 'bourbon44_db_guardians',
    residents: 'bourbon44_db_residents',
    rooms: 'bourbon44_db_rooms',
    staff: 'bourbon44_db_staff',
    salesOrders: 'bourbon44_db_salesOrders',
    invoices: 'bourbon44_db_invoices',
    contracts: 'bourbon44_db_contracts',
    notifications: 'bourbon44_db_notifications',
    operationTasks: 'bourbon44_db_operationTasks',
    staffShifts: 'bourbon44_db_staffShifts',
};

const FILE_BY_STORAGE_KEY: Record<string, string> = {
    [STORAGE_KEYS.packages]: 'packages',
    [STORAGE_KEYS.departments]: 'departments',
    [STORAGE_KEYS.services]: 'services',
    [STORAGE_KEYS.orders]: 'orders',
    [STORAGE_KEYS.tasks]: 'tasks',
    [STORAGE_KEYS.business]: 'business',
    [STORAGE_KEYS.guardians]: 'guardians',
    [STORAGE_KEYS.residents]: 'residents',
    [STORAGE_KEYS.rooms]: 'rooms',
    [STORAGE_KEYS.staff]: 'staff',
    [STORAGE_KEYS.salesOrders]: 'salesOrders',
    [STORAGE_KEYS.invoices]: 'invoices',
    [STORAGE_KEYS.contracts]: 'contracts',
    [STORAGE_KEYS.notifications]: 'notifications',
    [STORAGE_KEYS.operationTasks]: 'operationTasks',
    [STORAGE_KEYS.staffShifts]: 'staffShifts',
};

const mergeWithDeleted = <T>(active: T[], existing: any[]): T[] => {
    const activeById = new Map<string, any>();
    const newWithoutId: any[] = [];

    (active as any[]).forEach((item) => {
        const id = item?.id;
        if (id) {
            activeById.set(id, item);
        } else {
            newWithoutId.push(item);
        }
    });

    const merged = existing.map((item: any) => {
        const id = item?.id;
        if (id && activeById.has(id)) {
            const updated = activeById.get(id);
            activeById.delete(id);
            return updated;
        }
        return item;
    });

    return [...merged, ...Array.from(activeById.values()), ...newWithoutId];
};

const persistToFile = async <T>(key: string, data: T[]) => {
    if (!import.meta.env.DEV) return;
    const file = FILE_BY_STORAGE_KEY[key];
    if (!file) return;
    try {
        const existing = await jsonCrud.list<any>(file, { includeDeleted: true });
        const merged = mergeWithDeleted(data, existing);
        await jsonCrud.replaceAll(file, merged);
    } catch (error) {
        console.error(`Failed to persist JSON file for ${file}:`, error);
    }
};

const persist = <T>(key: string, data: T[]) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to persist data', e);
    }
    void persistToFile(key, data);
};

const loadWithPersistence = async <T>(key: string, url: string): Promise<T[]> => {
    if (import.meta.env.DEV) {
        const file = FILE_BY_STORAGE_KEY[key];
        if (file) {
            try {
                const data = await jsonCrud.list<T>(file);
                persist(key, data);
                return data;
            } catch (error) {
                console.error(`Failed to load JSON via CRUD API (${file})`, error);
            }
        }
    }
    try {
        const raw = localStorage.getItem(key);
        if (raw) {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? filterActive(parsed as T[]) : [];
        }
    } catch (e) {
        console.error('Failed to load persisted data', e);
    }
    const data = await loadJSON<T>(url);
    persist(key, data);
    return data;
};

const loadAllJSON = async () => {
    if (jsonLoaded) return;

    const [pk, dp, sv, od, tk, g, r, rm, stf, so, inv, ctr, ntf, ot, ss] = await Promise.all([
        loadWithPersistence<PackageRecord>(STORAGE_KEYS.packages, '/data/packages.json'),
        loadWithPersistence<Department>(STORAGE_KEYS.departments, '/data/departments.json'),
        loadWithPersistence<ServiceRecord>(STORAGE_KEYS.services, '/data/services.json'),
        loadWithPersistence<Order>(STORAGE_KEYS.orders, '/data/orders.json'),
        loadWithPersistence<Task>(STORAGE_KEYS.tasks, '/data/tasks.json'),
        loadWithPersistence<Guardian>(STORAGE_KEYS.guardians, '/data/guardians.json'),
        loadWithPersistence<Resident>(STORAGE_KEYS.residents, '/data/residents.json'),
        loadWithPersistence<Room>(STORAGE_KEYS.rooms, '/data/rooms.json'),
        loadWithPersistence<Staff>(STORAGE_KEYS.staff, '/data/staff.json'),
        loadWithPersistence<SalesOrder>(STORAGE_KEYS.salesOrders, '/data/salesOrders.json'),
        loadWithPersistence<Invoice>(STORAGE_KEYS.invoices, '/data/invoices.json'),
        loadWithPersistence<Contract>(STORAGE_KEYS.contracts, '/data/contracts.json'),
        loadWithPersistence<Notification>(STORAGE_KEYS.notifications, '/data/notifications.json'),
        loadWithPersistence<OperationTask>(STORAGE_KEYS.operationTasks, '/data/operationTasks.json'),
        loadWithPersistence<StaffShift>(STORAGE_KEYS.staffShifts, '/data/staffShifts.json'),
    ]);

    packageRecords = pk;
    departments = dp;
    serviceRecords = sv;
    orders = od;
    tasks = tk;
    guardians = g;
    residents = r;
    rooms = rm;
    staffMembers = stf;
    salesOrders = so;
    invoices = inv;
    contracts = ctr;
    notifications = ntf;
    operationTasks = ot;
    staffShifts = ss;
    jsonLoaded = true;
};

const loadBusinessProfile = async () => {
    const data = await loadWithPersistence<BusinessProfile>(STORAGE_KEYS.business, '/data/business.json');
    businessProfiles = data;
    return businessProfiles;
};

const ensureBusinessProfile = (): BusinessProfile => {
    const existing = businessProfiles[0];
    if (existing) return existing;
    const now = new Date().toISOString();
    return {
        id: 'business-1',
        businessInfo: {
            businessName: '',
            businessType: '',
            address: '',
            phone: '',
        },
        adminInfo: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        facilityInfo: {
            numberOfBeds: '',
            numberOfFloors: '',
            operatingHours: '',
            licenseNumber: '',
        },
        preferences: {
            timezone: '',
            currency: '',
            language: '',
        },
        depositMonths: 1,
        createdAt: now,
        updatedAt: now,
    };
};

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const getDepartmentName = (departmentId: string) =>
    departments.find((d) => d.id === departmentId)?.name || 'Unknown';

const resolveService = (service: ServiceRecord): Service => ({
    ...service,
    dept: getDepartmentName(service.departmentId),
});

const resolvePackage = (pkg: PackageRecord): Package => {
    const serviceMap = new Map(serviceRecords.map((s) => [s.id, s]));
    const services = pkg.serviceIds
        .map((id) => serviceMap.get(id))
        .filter(Boolean)
        .map((service) => resolveService(service as ServiceRecord));

    return {
        ...pkg,
        services,
    };
};

export const API = {
    // ==================== EXISTING APIs ====================
    getPackages: async (): Promise<Package[]> => {
        await delay();
        await loadAllJSON();
        return packageRecords.map(resolvePackage);
    },

    getPackageById: async (id: string): Promise<Package | undefined> => {
        await delay();
        await loadAllJSON();
        const pkg = packageRecords.find(p => p.id === id);
        return pkg ? resolvePackage(pkg) : undefined;
    },

    getStaff: async (): Promise<Staff[]> => {
        await delay();
        await loadAllJSON();
        return staffMembers;
    },

    getDepartments: async (): Promise<Department[]> => {
        await delay();
        await loadAllJSON();
        return departments;
    },

    getOrders: async () => {
        await delay();
        await loadAllJSON();
        return orders;
    },

    getTasks: async () => {
        await delay();
        await loadAllJSON();
        return tasks;
    },

    getServices: async (): Promise<Service[]> => {
        await delay();
        await loadAllJSON();
        return serviceRecords.map(resolveService);
    },

    getServicesByDepartment: async (departmentId: string): Promise<Service[]> => {
        await delay();
        await loadAllJSON();
        return serviceRecords
            .filter((service) => service.departmentId === departmentId)
            .map(resolveService);
    },

    savePackage: async (pkgData: Partial<Package> & { id?: string; serviceIds?: string[] }): Promise<Package> => {
        await delay(600);
        await loadAllJSON();
        const serviceIds = pkgData.serviceIds
            ?? pkgData.services?.map((service) => service.id)
            ?? [];
        if (pkgData.id) {
            const index = packageRecords.findIndex(p => p.id === pkgData.id);
            if (index !== -1) {
                packageRecords[index] = {
                    ...packageRecords[index],
                    ...pkgData,
                    serviceIds,
                } as PackageRecord;
                persist(STORAGE_KEYS.packages, packageRecords);
                return resolvePackage(packageRecords[index]);
            }
        }
        const newPkg: PackageRecord = {
            id: 'pkg-' + Date.now(),
            name: pkgData.name || 'Untitled Package',
            price: pkgData.price || 0,
            duration: pkgData.duration || 0,
            description: pkgData.description || '',
            serviceIds,
        };
        packageRecords.push(newPkg);
        persist(STORAGE_KEYS.packages, packageRecords);
        return resolvePackage(newPkg);
    },

    deletePackage: async (id: string): Promise<boolean> => {
        await delay(400);
        await loadAllJSON();
        packageRecords = packageRecords.filter(p => p.id !== id);
        persist(STORAGE_KEYS.packages, packageRecords);
        return true;
    },

    saveDepartment: async (departmentData: Partial<Department> & { id: string }): Promise<Department | null> => {
        await delay(500);
        await loadAllJSON();
        const index = departments.findIndex(d => d.id === departmentData.id);
        if (index !== -1) {
            departments[index] = { ...departments[index], ...departmentData } as Department;
            persist(STORAGE_KEYS.departments, departments);
            return departments[index];
        }
        return null;
    },

    deleteDepartment: async (id: string): Promise<boolean> => {
        await delay(400);
        await loadAllJSON();
        departments = departments.filter(d => d.id !== id);
        persist(STORAGE_KEYS.departments, departments);
        return true;
    },

    saveStaff: async (staffData: Partial<Staff> & { id: string }): Promise<Staff | null> => {
        await loadAllJSON();
        await delay(500);
        const index = staffMembers.findIndex(s => s.id === staffData.id);
        if (index !== -1) {
            staffMembers[index] = { ...staffMembers[index], ...staffData } as Staff;
            persist(STORAGE_KEYS.staff, staffMembers);
            return staffMembers[index];
        }
        return null;
    },

    createStaff: async (staffData: Omit<Staff, 'id'> & { id?: string }): Promise<Staff> => {
        await loadAllJSON();
        await delay(500);
        const newStaff: Staff = {
            ...staffData,
            id: staffData.id || `st-${Date.now()}`
        };
        staffMembers.push(newStaff);
        persist(STORAGE_KEYS.staff, staffMembers);
        return newStaff;
    },

    updateStaff: async (id: string, updates: Partial<Staff>): Promise<Staff | null> => {
        await loadAllJSON();
        await delay(300);
        const index = staffMembers.findIndex((s) => s.id === id);
        if (index === -1) return null;

        staffMembers[index] = {
            ...staffMembers[index],
            ...updates,
            id: staffMembers[index].id,
        };

        persist(STORAGE_KEYS.staff, staffMembers);
        return staffMembers[index];
    },

    deleteStaff: async (id: string): Promise<boolean> => {
        await loadAllJSON();
        await delay(400);
        staffMembers = staffMembers.filter(s => s.id !== id);
        persist(STORAGE_KEYS.staff, staffMembers);
        return true;
    },

    getBusinessProfile: async (): Promise<BusinessProfile> => {
        await delay(200);
        await loadBusinessProfile();
        return ensureBusinessProfile();
    },

    saveBusinessProfile: async (profile: BusinessProfile): Promise<BusinessProfile> => {
        await delay(300);
        await loadBusinessProfile();
        const now = new Date().toISOString();
        const existing = businessProfiles[0];
        const next: BusinessProfile = {
            ...profile,
            id: profile.id || existing?.id || 'business-1',
            createdAt: existing?.createdAt || profile.createdAt || now,
            updatedAt: now,
        };
        businessProfiles = [next];
        persist(STORAGE_KEYS.business, businessProfiles);
        return next;
    },

    getDashboardStats: async (): Promise<DashboardStats> => {
        await delay();
        await loadAllJSON();
        return {
            occupancy: Math.floor(Math.random() * 20) + 70,
            pendingTasks: tasks.filter(t => t.status === 'pending').length,
            totalStaff: staffMembers.length,
            newPurchases: orders.length
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

    updateResident: async (id: string, data: Partial<Resident>): Promise<Resident | null> => {
        await loadAllJSON();
        await delay(300);
        const index = residents.findIndex(r => r.id === id);
        if (index !== -1) {
            residents[index] = { ...residents[index], ...data };
            persist(STORAGE_KEYS.residents, residents);
            return residents[index];
        }
        return null;
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
            const currentDate = new Date(checkIn);

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
