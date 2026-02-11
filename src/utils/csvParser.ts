import Papa from 'papaparse';
import type { Database, PackageRecord, Staff, Department, Order, Task } from '../types';

const parse = async (url: string): Promise<any[]> => {
    try {
        const response = await fetch(url);
        const csv = await response.text();
        
        return new Promise((resolve, reject) => {
            Papa.parse(csv, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    resolve(results.data || []);
                },
                error: (error: unknown) => {
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error(`Failed to load CSV: ${url}`, error);
        throw error;
    }
};

export const buildDatabase = async (): Promise<Database> => {
    try {
        const [packagesData, staffData, teamsData, ordersData, tasksData] = await Promise.all([
            parse('/data/packages.csv'),
            parse('/data/staff.csv'),
            parse('/data/teams.csv'),
            parse('/data/orders.csv'),
            parse('/data/tasks.csv')
        ]);

        // Process packages
        const packages: PackageRecord[] = packagesData.map((row: any) => ({
            id: row.id,
            name: row.name,
            price: parseFloat(row.price) || 0,
            duration: parseInt(row.duration) || 0,
            description: row.description,
            serviceIds: []
        }));

        // Process staff
        const staff: Staff[] = staffData.map((row: any) => ({
            id: row.id,
            name: row.name,
            role: row.role,
            dept: row.dept,
            status: row.status
        }));

        // Process departments
        const departments: Department[] = teamsData.map((row: any) => ({
            id: row.id,
            name: row.dept || row.name,
            description: row.description,
        }));


        // Process orders
        const orders: Order[] = ordersData.map((row: any) => ({
            id: row.id,
            customer: row.customer,
            package_id: row.package_id,
            room: row.room,
            check_in: row.check_in,
            check_out: row.check_out,
            status: row.status
        }));

        // Process tasks
        const tasks: Task[] = tasksData.map((row: any) => ({
            id: row.id,
            order_id: row.order_id,
            dept: row.dept,
            title: row.title,
            date: row.date,
            status: row.status
        }));

        return {
            packages,
            staff,
            departments,
            orders,
            tasks
        };
    } catch (error) {
        console.error('Failed to build database from CSV:', error);
        throw error;
    }
};
