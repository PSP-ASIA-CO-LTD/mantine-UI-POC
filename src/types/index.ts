export interface Package {
    id: string;
    name: string;
    price: number;
    duration: number;
    description: string;
    serviceIds: string[];
    services: Service[];
}

export interface PackageRecord {
    id: string;
    name: string;
    price: number;
    duration: number;
    description: string;
    serviceIds: string[];
}

export interface ServiceRecord {
    id: string;
    title: string;
    departmentId: string;
    interval: string;
    description: string;
    price: number;
}

export interface Service extends ServiceRecord {
    dept: string;
}

export interface Staff {
    id: string;
    name: string;
    role: string;
    dept: string;
    status: string;
}

export interface Department {
    id: string;
    name: string;
    code?: string;
    description?: string;
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
    packages: PackageRecord[];
    staff: Staff[];
    departments: Department[];
    orders: Order[];
    tasks: Task[];
}

export interface DashboardStats {
    occupancy: number;
    pendingTasks: number;
    totalStaff: number;
    newPurchases: number;
}

// ==================== BUSINESS SETUP ====================

export interface BusinessInfo {
    businessName: string;
    businessType: string;
    address: string;
    phone: string;
}

export interface AdminInfo {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface FacilityInfo {
    numberOfBeds: string;
    numberOfFloors: string;
    operatingHours: string;
    licenseNumber: string;
}

export interface BusinessPreferences {
    timezone: string;
    currency: string;
    language: string;
}

export interface BusinessProfile {
    id: string;
    businessInfo: BusinessInfo;
    adminInfo: AdminInfo;
    facilityInfo: FacilityInfo;
    preferences: BusinessPreferences;
    depositMonths: number;
    createdAt: string;
    updatedAt: string;
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
    pays: boolean; // indicates if this guardian contributes to payment
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

export type ContractLanguage = 'th' | 'en';

export interface ContractEmailLogEntry {
    id: string;
    to: string[];
    subject: string;
    sentAt: string;
}

export interface StoredContractPricing {
    subtotal: number;
    tax: number;
    total: number;
}

export interface StoredContractSourceData {
    // Package info
    package: Package | null;
    adjustedDays: number;
    checkIn: string | null; // ISO string
    checkOut: string | null; // ISO string
    // People
    guardians: Guardian[];
    primaryContactGuardianId: string | null;
    resident: Resident | null;
    // Room & services
    room: Room | null;
    additionalServices: AdditionalServices;
    // Generated documents (for referencing numbers/status)
    salesOrder: SalesOrder | null;
    invoice: Invoice | null;
    contract: Contract | null;
}

export interface StoredContract {
    id: string; // share id used in /contract/:id
    contractNumber: string;
    language: ContractLanguage;
    status: 'pending' | 'signed' | 'expired' | 'terminated';
    createdAt: string;
    updatedAt: string;
    signedAt?: string;
    signedByEmail?: string;
    // Access control: viewer must enter one of these emails
    allowedGuardianEmails: string[];
    // “Compiled paper”: the exact contract body HTML snapshot
    compiledHtml: string;
    // Snapshot inputs used to generate compiled paper
    source: StoredContractSourceData;
    pricing: StoredContractPricing;
    emailLog: ContractEmailLogEntry[];
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

// ==================== SALES ORDER STORAGE ====================

export interface AdditionalServices {
    additionalBed: boolean;
    specialAmenities: string[];
    selfProvidePampers: boolean;
    selfProvideMedications: boolean;
}

export interface CompleteSalesOrderData {
    id: string;
    // Package info
    package: Package | null;
    adjustedDays: number;
    checkIn: string | null; // ISO string
    checkOut: string | null; // ISO string
    // People
    guardians: Guardian[];
    primaryContactGuardianId: string | null;
    resident: Resident | null;
    // Room & services
    room: Room | null;
    additionalServices: AdditionalServices;
    // Generated documents
    salesOrder: SalesOrder | null;
    invoice: Invoice | null;
    contract: Contract | null;
    // Meta
    status: 'draft' | 'pending_payment' | 'paid' | 'completed';
    createdAt: string;
    updatedAt: string;
}
