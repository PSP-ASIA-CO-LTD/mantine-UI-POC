import { buildDatabase } from '../utils/csvParser';
import type { Database, Package, Staff, Team, DashboardStats } from '../types';

let db: Database | null = null;

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

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const API = {
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
    
    getDashboardStats: async (): Promise<DashboardStats> => {
        await delay();
        const data = await loadDB();
        return {
            occupancy: Math.floor(Math.random() * 20) + 70, // 70-90%
            pendingTasks: data.tasks.filter(t => t.status === 'Pending').length,
            totalStaff: data.staff.length,
            newPurchases: data.orders.length
        };
    }
};
