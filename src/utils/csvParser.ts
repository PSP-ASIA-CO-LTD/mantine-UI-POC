import Papa from 'papaparse';
import type { Database, Package, Staff, Team, Order, Task, AssignmentType } from '../types';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

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
                error: (error) => {
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error(`Failed to load CSV: ${url}`, error);
        throw error;
    }
};

const parseMembers = (memberString: string): string[] => {
    if (!memberString) return [];
    return memberString.split('|').map(m => m.trim());
};

const parseAssignmentTypes = (assignmentString: string): AssignmentType[] => {
    if (!assignmentString) return [];
    return assignmentString.split('|').map(at => {
        const [id, name, price] = at.trim().split(':');
        return {
            id: id || 'at-' + Date.now(),
            name: name || '',
            price: parseFloat(price) || 0,
            description: ''
        };
    });
};

const parseServices = (serviceString: string): any[] => {
    if (!serviceString) return [];
    
    return serviceString.split('|').map(s => {
        const parts = s.trim().split(':');
        return {
            title: parts[0] || '',
            dept: parts[1] || '',
            interval: parts[2] || 'Daily',
            description: parts[3] || '',
            price: parseFloat(parts[4]) || 0
        };
    });
};

export const buildDatabase = async (): Promise<Database> => {
    try {
        const [packagesData, staffData, teamsData, assignmentsData, ordersData, tasksData] = await Promise.all([
            parse('/data/packages.csv'),
            parse('/data/staff.csv'),
            parse('/data/teams.csv'),
            parse('/data/assignments.csv'),
            parse('/data/orders.csv'),
            parse('/data/tasks.csv')
        ]);

        // Process packages
        const packages: Package[] = packagesData.map((row: any) => ({
            id: row.id,
            name: row.name,
            price: parseFloat(row.price) || 0,
            duration: parseInt(row.duration) || 0,
            description: row.description,
            services: parseServices(row.services)
        }));

        // Process staff
        const staff: Staff[] = staffData.map((row: any) => ({
            id: row.id,
            name: row.name,
            role: row.role,
            dept: row.dept,
            status: row.status
        }));

        // Build assignment map for teams
        const assignmentMap: Record<string, AssignmentType[]> = {};
        assignmentsData.forEach((row: any) => {
            const teamId = row.team_id;
            if (!assignmentMap[teamId]) assignmentMap[teamId] = [];
            assignmentMap[teamId].push({
                id: row.id,
                name: row.name,
                price: parseFloat(row.price) || 0,
                description: row.description || ''
            });
        });

        // Process teams
        const teams: Team[] = teamsData.map((row: any) => ({
            id: row.id,
            name: row.name,
            dept: row.dept,
            members: parseMembers(row.members),
            tasks: [],
            assignmentTypes: assignmentMap[row.id] || parseAssignmentTypes(row.assignmentTypes)
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
            teams,
            orders,
            tasks
        };
    } catch (error) {
        console.error('Failed to build database from CSV:', error);
        throw error;
    }
};
