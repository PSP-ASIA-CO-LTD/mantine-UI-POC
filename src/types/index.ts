export interface Package {
    id: string;
    name: string;
    price: number;
    duration: number;
    description: string;
    services: Service[];
}

export interface Service {
    title: string;
    dept: string;
    interval: string;
    description: string;
    price: number;
}

export interface Staff {
    id: string;
    name: string;
    role: string;
    dept: string;
    status: string;
}

export interface Team {
    id: string;
    name: string;
    dept: string;
    members: string[];
    tasks: any[];
    assignmentTypes: AssignmentType[];
}

export interface AssignmentType {
    id: string;
    name: string;
    price: number;
    description: string;
    dept?: string;
}

export interface Order {
    id: string;
    customer: string;
    package_id: string;
    room: string;
    check_in: string;
    check_out: string;
    status: string;
}

export interface Task {
    id: string;
    order_id: string;
    dept: string;
    title: string;
    date: string;
    status: string;
}

export interface Database {
    packages: Package[];
    staff: Staff[];
    teams: Team[];
    orders: Order[];
    tasks: Task[];
}

export interface DashboardStats {
    occupancy: number;
    pendingTasks: number;
    totalStaff: number;
    newPurchases: number;
}
