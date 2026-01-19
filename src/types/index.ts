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
    description: string;
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
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    assignedTo?: string;
    completedAt?: string;
    notes?: string;
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

// ==================== SALES TYPES ====================

export interface Guardian {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    relationship: string; // e.g., 'son', 'daughter', 'spouse', 'relative'
    createdAt: string;
}

export interface Resident {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    idNumber: string;
    medicalConditions: string;
    allergies: string;
    dietaryRestrictions: string;
    emergencyContact: string;
    guardianId: string;
    createdAt: string;
}

export interface Room {
    id: string;
    number: string;
    floor: number;
    type: 'standard' | 'deluxe' | 'suite';
    status: 'available' | 'occupied' | 'maintenance';
    pricePerDay: number;
}

export interface SalesOrder {
    id: string;
    packageId: string;
    packageName: string;
    residentId: string;
    guardianId: string;
    roomId: string;
    checkIn: string;
    checkOut: string;
    adjustedDays: number;
    basePrice: number;
    adjustedPrice: number;
    status: 'draft' | 'pending_payment' | 'paid' | 'active' | 'completed' | 'cancelled';
    createdAt: string;
    createdBy: string;
    paidAt?: string;
    notes?: string;
}

export interface Invoice {
    id: string;
    salesOrderId: string;
    invoiceNumber: string;
    guardianId: string;
    guardianName: string;
    residentName: string;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: 'draft' | 'issued' | 'paid' | 'cancelled';
    issuedAt: string;
    paidAt?: string;
    paymentMethod?: 'cash' | 'transfer' | 'credit_card';
    notes?: string;
}

export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Contract {
    id: string;
    salesOrderId: string;
    contractNumber: string;
    guardianId: string;
    residentId: string;
    startDate: string;
    endDate: string;
    terms: string;
    signedAt?: string;
    signedBy?: string;
    status: 'pending' | 'signed' | 'expired' | 'terminated';
}

export interface Notification {
    id: string;
    type: 'sale' | 'task' | 'alert' | 'info';
    title: string;
    message: string;
    relatedId?: string;
    createdAt: string;
    readAt?: string;
}

// ==================== OPERATION TYPES ====================

export interface OperationTask {
    id: string;
    salesOrderId: string;
    residentId: string;
    residentName: string;
    roomNumber: string;
    serviceTitle: string;
    serviceDept: string;
    description: string;
    scheduledDate: string;
    scheduledTime?: string;
    assignedTo?: string;
    assignedToName?: string;
    teamId?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    completedAt?: string;
    completedBy?: string;
    notes?: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface StaffShift {
    id: string;
    staffId: string;
    staffName: string;
    dept: string;
    date: string;
    startTime: string;
    endTime: string;
    status: 'scheduled' | 'checked_in' | 'checked_out' | 'absent';
}

export interface SalesDashboardStats {
    todaySales: number;
    todayRevenue: number;
    pendingPayments: number;
    activeResidents: number;
    recentSales: SalesOrder[];
}
