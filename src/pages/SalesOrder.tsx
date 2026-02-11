import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Title,
    Group,
    Button,
    Card,
    Text,
    Stack,
    Badge,
    Stepper,
    Divider,
    Grid,
    ActionIcon,
    Collapse,
    Paper,
    Table,
    Modal,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useElementSize } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
    IconChevronDown,
    IconChevronUp,
    IconCalendar,
    IconUser,
    IconHome,
    IconReceipt,
    IconFileText,
    IconCheck,
    IconPrinter,
    IconArrowLeft,
    IconPlus,
    IconTrash,
    IconBed,
    IconPhone
} from '@tabler/icons-react';
import { usePackages } from '../hooks/usePackages';
import { useRooms } from '../hooks/useRooms';
import { useCustomerMutations } from '../hooks/useCustomerMutations';
import { useSalesOrderMutations } from '../hooks/useSalesOrderMutations';
import { useNotifications } from '../hooks/useNotifications';
import { useSalesOrder } from '../contexts/SalesOrderContext';
import type { Package, Room, Guardian, Resident, SalesOrder, Invoice, Contract, AdditionalServices } from '../types';
import { getBusinessSettings } from '../utils/businessSettings';
import { buildInvoiceItems, calculateInvoiceTotals } from '../utils/invoiceCalculator';
import { TextInput, Select, NumberInput, Textarea, DateInput, Checkbox, CheckboxGroup, Radio, RadioGroup } from '../components/EditableFields';
import { RecurrenceDisplay } from '../components/RecurrenceIcon';
import './SalesOrder.css';

interface GuardianFormValues {
    id?: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    relationship: string;
    pays: boolean;
}

type ResidentFormValues = Omit<Resident, 'id' | 'createdAt' | 'prefix' | 'guardianId'> & {
    prefix: Resident['prefix'] | null;
    guardianId?: string;
};

interface CheckoutData {
    package: Package | null;
    adjustedDays: number;
    checkIn: Date | null;
    guardians: Guardian[];
    primaryContactGuardianId: string | null;
    resident: Resident | null;
    room: Room | null;
    additionalServices: AdditionalServices;
    salesOrder: SalesOrder | null;
    invoice: Invoice | null;
    contract: Contract | null;
}

const formatStayEndDate = (checkIn: Date | null, days: number): string | null => {
    if (!checkIn || !days) return null;
    const endDate = new Date(checkIn);
    endDate.setDate(endDate.getDate() + days - 1);
    const datePart = endDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
    const weekday = endDate.toLocaleDateString('en-GB', { weekday: 'short' }).toLowerCase();
    return `${datePart} (${weekday})`;
};

export function SalesOrderPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const navState = location.state as { draftId?: string; forceStep?: number } | null;

    const { currentDraft, initNewDraft, loadDraft, updateDraft, saveDraft, clearDraft } = useSalesOrder();
    const depositMonths = getBusinessSettings().depositMonths;

    const { packages, loading: loadingPackages, error: packageError } = usePackages();
    const { rooms, loading: loadingRooms, error: roomError } = useRooms(true); // true for availableOnly

    // Mutation hooks
    const { saveGuardian, saveResident, updateGuardian, processing: savingCustomer } = useCustomerMutations();
    const {
        createSalesOrder,
        createInvoice,
        updateInvoice,
        updateSalesOrder,
        createContract,
        generateTasks,
        processing: processingOrder
    } = useSalesOrderMutations();
    const { createNotification } = useNotifications();

    // Derived state
    const loading = loadingPackages || loadingRooms;
    const processing = savingCustomer || processingOrder;
    const { ref: salesOrderRef, width: salesOrderWidth } = useElementSize();
    const isStayDurationTwoCol = salesOrderWidth > 0 && salesOrderWidth <= 1192;

    // Error handling
    useEffect(() => {
        if (packageError) {
            notifications.show({ title: 'Error', message: 'Failed to load packages', color: 'red' });
        }
        if (roomError) {
            notifications.show({ title: 'Error', message: 'Failed to load rooms', color: 'red' });
        }
    }, [packageError, roomError]);
    const [expandedPackage, setExpandedPackage] = useState<string | null>(null);
    const [step, setStep] = useState(0);
    const [checkoutData, setCheckoutData] = useState<CheckoutData>({
        package: null,
        adjustedDays: 0,
        checkIn: null,
        guardians: [],
        primaryContactGuardianId: null,
        resident: null,
        room: null,
        additionalServices: {
            additionalBed: false,
            specialAmenities: [],
            selfProvidePampers: false,
            selfProvideMedications: false
        },
        salesOrder: null,
        invoice: null,
        contract: null
    });
    // Removed local processing state in favor of hook state
    const [guardianForms, setGuardianForms] = useState<GuardianFormValues[]>([{
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        relationship: 'son',
        pays: true
    }]);

    // Payment modals state
    const [showBankModal, setShowBankModal] = useState(false);
    const [showCreditCardModal, setShowCreditCardModal] = useState(false);
    const [selectedBank, setSelectedBank] = useState<string | null>(null);
    const [creditCardLast4, setCreditCardLast4] = useState('');
    const [showPromptPayModal, setShowPromptPayModal] = useState(false);
    const [guardianErrors, setGuardianErrors] = useState<Record<number, Record<string, string>>>({});
    const restoredDraftIdRef = useRef<string | null>(null);
    const appliedForceStepRef = useRef<string | null>(null);

    // Sync local state with context for persistence
    const syncToContext = useCallback(() => {
        updateDraft({
            package: checkoutData.package,
            adjustedDays: checkoutData.adjustedDays,
            checkIn: checkoutData.checkIn?.toISOString() || null,
            checkOut: checkoutData.checkIn && checkoutData.adjustedDays
                ? new Date(checkoutData.checkIn.getTime() + (checkoutData.adjustedDays - 1) * 24 * 60 * 60 * 1000).toISOString()
                : null,
            guardians: checkoutData.guardians,
            primaryContactGuardianId: checkoutData.primaryContactGuardianId,
            resident: checkoutData.resident,
            room: checkoutData.room,
            additionalServices: checkoutData.additionalServices,
            salesOrder: checkoutData.salesOrder,
            invoice: checkoutData.invoice,
            contract: checkoutData.contract,
            status: checkoutData.salesOrder?.status === 'paid' ? 'paid'
                : checkoutData.invoice ? 'pending_payment'
                    : 'draft'
        });
    }, [checkoutData, updateDraft]);

    // Initialize draft on mount or restore from context
    useEffect(() => {
        // If draft isn't ready yet, ensure we have one.
        if (!currentDraft) {
            // If navigation requests a specific draft, wait for it to load.
            if (navState?.draftId) return;
            // Avoid re-initializing endlessly if something clears the draft.
            if (!restoredDraftIdRef.current) initNewDraft();
            return;
        }

        // Restore only once per draft id to avoid clobbering local edits as we auto-sync.
        if (restoredDraftIdRef.current === currentDraft.id) return;

        if (currentDraft.package) {
            restoredDraftIdRef.current = currentDraft.id;
            // Restore state from existing draft
            setCheckoutData({
                package: currentDraft.package,
                adjustedDays: currentDraft.adjustedDays,
                checkIn: currentDraft.checkIn ? new Date(currentDraft.checkIn) : null,
                guardians: currentDraft.guardians,
                primaryContactGuardianId: currentDraft.primaryContactGuardianId,
                resident: currentDraft.resident,
                room: currentDraft.room,
                additionalServices: currentDraft.additionalServices,
                salesOrder: currentDraft.salesOrder,
                invoice: currentDraft.invoice,
                contract: currentDraft.contract
            });
            // Restore guardian forms from saved guardians
            if (currentDraft.guardians.length > 0) {
                setGuardianForms(currentDraft.guardians.map(g => ({
                    id: g.id,
                    firstName: g.firstName,
                    lastName: g.lastName,
                    phone: g.phone,
                    email: g.email,
                    address: g.address,
                    relationship: g.relationship,
                    pays: g.pays
                })));
            }
            // Determine current step based on saved data
            if (currentDraft.contract) setStep(4);
            else if (currentDraft.invoice) setStep(3);
            else if (currentDraft.room) setStep(2);
            else if (currentDraft.guardians.length > 0) setStep(1);
        }
    }, [currentDraft, initNewDraft, navState?.draftId]);

    // If we were navigated here with a draftId, ensure it is loaded.
    useEffect(() => {
        const draftId = navState?.draftId;
        if (!draftId) return;
        if (currentDraft?.id === draftId) return;
        loadDraft(draftId);
    }, [navState?.draftId, currentDraft?.id, loadDraft]);

    // Optionally force the visible step (e.g. coming back from "View Full Invoice").
    useEffect(() => {
        const forceStep = navState?.forceStep;
        if (typeof forceStep !== 'number') return;

        const key = `${navState?.draftId || currentDraft?.id || 'none'}:${forceStep}`;
        if (appliedForceStepRef.current === key) return;
        appliedForceStepRef.current = key;
        setStep(forceStep);
    }, [navState?.forceStep, navState?.draftId, currentDraft?.id]);

    const validateGuardian = (guardian: GuardianFormValues): Record<string, string> => {
        const errors: Record<string, string> = {};
        if (guardian.firstName.length < 2) errors.firstName = 'First name is required';
        if (guardian.lastName.length < 2) errors.lastName = 'Last name is required';
        if (guardian.phone.length < 9) errors.phone = 'Valid phone is required';
        if (!/^\S+@\S+$/.test(guardian.email)) errors.email = 'Valid email is required';
        return errors;
    };

    const addGuardian = () => {
        setGuardianForms(prev => [...prev, {
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            address: '',
            relationship: 'relative',
            pays: false
        }]);
    };

    const removeGuardian = (index: number) => {
        if (guardianForms.length > 1) {
            setGuardianForms(prev => prev.filter((_, i) => i !== index));
            setGuardianErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[index];
                return newErrors;
            });
        }
    };

    const updateGuardianField = (index: number, field: keyof GuardianFormValues, value: string) => {
        setGuardianForms(prev => prev.map((g, i) =>
            i === index ? { ...g, [field]: value } : g
        ));
    };

    const residentForm = useForm<ResidentFormValues>({
        initialValues: {
            prefix: 'mrs',
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            gender: 'female' as const,
            idNumber: '',
            hospitalNumber: '',
            race: '',
            nationality: '',
            religion: '',
            maritalStatus: '',
            occupation: '',
            bloodGroup: '',
            addressNumber: '',
            addressMoo: '',
            residenceName: '',
            addressSoi: '',
            addressStreet: '',
            addressSubDistrict: '',
            addressDistrict: '',
            addressProvince: '',
            addressPostalCode: '',
            phoneHome: '',
            phoneMobile: '',
            email: '',
            medicalConditions: '',
            allergies: '',
            dietaryRestrictions: '',
            emergencyContact: '',
            emergencyContactName: '',
            emergencyContactRelationship: '',
            emergencyContactAddressSameAsResident: true,
            emergencyContactAddress: '',
        },
        validate: {
            firstName: (value) => value.length < 2 ? 'First name is required' : null,
            lastName: (value) => value.length < 2 ? 'Last name is required' : null,
            dateOfBirth: (value) => !value ? 'Date of birth is required' : null,
        }
    });

    // Data loading is now handled by hooks usePackages and useRooms

    // Auto-sync to context when checkout data changes (debounced)
    useEffect(() => {
        if (step === 5) return;
        const timeout = setTimeout(() => {
            if (checkoutData.package || checkoutData.guardians.length > 0) {
                syncToContext();
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [checkoutData, syncToContext]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH').format(amount);
    };

    const invoiceItemsForDisplay =
        checkoutData.invoice && checkoutData.package
            ? buildInvoiceItems({
                pkg: checkoutData.package,
                adjustedDays: checkoutData.adjustedDays,
                room: checkoutData.room,
                additionalServices: checkoutData.additionalServices,
                depositMonths,
            })
            : (checkoutData.invoice?.items ?? []);

    const invoiceTotalsForDisplay = calculateInvoiceTotals(invoiceItemsForDisplay);

    const calculatePrice = (pkg: Package, days: number) => {
        const basePrice = pkg.price;
        const baseDays = pkg.duration;
        const extraDays = Math.max(0, days - baseDays);
        const dailyRate = basePrice / baseDays;
        return basePrice + (extraDays * dailyRate);
    };

    const handleSelectPackage = (pkg: Package) => {
        setCheckoutData(prev => ({
            ...prev,
            package: pkg,
            adjustedDays: pkg.duration
        }));
        setStep(1);
    };

    const handleAdjustDays = (days: number) => {
        setCheckoutData(prev => ({
            ...prev,
            adjustedDays: days
        }));
    };

    const handleSetCheckIn = (value: Date | string | null) => {
        const date = value instanceof Date ? value : value ? new Date(value) : null;
        setCheckoutData(prev => ({
            ...prev,
            checkIn: date
        }));
    };

    const handleCopyGuardianToResident = () => {
        const firstGuardian = guardianForms[0];
        residentForm.setValues({
            ...residentForm.values,
            firstName: firstGuardian.firstName,
            lastName: firstGuardian.lastName,
            phoneMobile: firstGuardian.phone,
            email: firstGuardian.email,
            addressStreet: firstGuardian.address,
            emergencyContactName: `${firstGuardian.firstName} ${firstGuardian.lastName}`.trim(),
            emergencyContactRelationship: firstGuardian.relationship,
            emergencyContactAddressSameAsResident: false,
            emergencyContactAddress: firstGuardian.address,
            emergencyContact: firstGuardian.phone,
        });
    };

    // Auto-fill sample data for testing
    const handleAutoFillContactInfo = () => {
        // Set 2 guardians
        setGuardianForms([
            {
                firstName: 'สมชาย',
                lastName: 'ใจดี',
                phone: '081-234-5678',
                email: 'somchai.jaidee@email.com',
                address: '123/45 ถ.สุขุมวิท 55 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110',
                relationship: 'son',
                pays: true
            },
            {
                firstName: 'สมหญิง',
                lastName: 'ใจดี',
                phone: '082-345-6789',
                email: 'somying.jaidee@email.com',
                address: '88/9 หมู่บ้านพฤกษา ถ.รัตนาธิเบศร์ อ.เมือง จ.นนทบุรี 11000',
                relationship: 'daughter',
                pays: true
            }
        ]);

        // Set resident info
        residentForm.setValues({
            prefix: 'mrs',
            firstName: 'สมศรี',
            lastName: 'ใจดี',
            dateOfBirth: '1948-05-15',
            gender: 'female',
            idNumber: '3-1001-00123-45-6',
            hospitalNumber: '',
            race: 'ไทย',
            nationality: 'ไทย',
            religion: 'พุทธ',
            maritalStatus: 'married',
            occupation: 'เกษียณ',
            bloodGroup: 'O+',
            addressNumber: '99/1',
            addressMoo: '5',
            residenceName: 'พฤกษาวิลล์',
            addressSoi: 'สุขุมวิท 55',
            addressStreet: 'ถ.สุขุมวิท',
            addressSubDistrict: 'คลองตันเหนือ',
            addressDistrict: 'วัฒนา',
            addressProvince: 'กรุงเทพฯ',
            addressPostalCode: '10110',
            phoneHome: '02-123-4567',
            phoneMobile: '081-234-5678',
            email: 'somsri.jaidee@email.com',
            medicalConditions: 'เบาหวานชนิดที่ 2, ความดันโลหิตสูง, ข้อเข่าเสื่อม',
            allergies: 'Penicillin, ถั่วลิสง',
            dietaryRestrictions: 'อาหารลดโซเดียม, ลดน้ำตาล',
            emergencyContact: '081-234-5678',
            emergencyContactName: 'สมชาย ใจดี',
            emergencyContactRelationship: 'son',
            emergencyContactAddressSameAsResident: false,
            emergencyContactAddress: '123/45 ถ.สุขุมวิท 55 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110',
        });

        // Clear any validation errors
        setGuardianErrors({});
    };

    const handleContactSubmit = async () => {
        // Validate all guardians
        let allValid = true;
        const newErrors: Record<number, Record<string, string>> = {};

        guardianForms.forEach((guardian, index) => {
            const errors = validateGuardian(guardian);
            if (Object.keys(errors).length > 0) {
                allValid = false;
                newErrors[index] = errors;
            }
        });

        setGuardianErrors(newErrors);

        const residentValid = !residentForm.validate().hasErrors;

        if (!allValid || !residentValid) return;

        try {
            // Save all guardians
            const savedGuardians: Guardian[] = [];
            for (const guardianData of guardianForms) {
                const guardian = await saveGuardian(guardianData);
                savedGuardians.push(guardian);
            }

            // Use first guardian as the primary guardian for resident
            const resident = await saveResident({
                ...residentForm.values,
                prefix: residentForm.values.prefix || undefined,
                gender: residentForm.values.gender as 'male' | 'female' | 'other',
                guardianId: savedGuardians[0].id
            });

            const linkedGuardians = await Promise.all(
                savedGuardians.map(async (guardian) => {
                    const updated = await updateGuardian(guardian.id, { residentId: resident.id });
                    return updated ?? { ...guardian, residentId: resident.id };
                })
            );

            setCheckoutData(prev => ({
                ...prev,
                guardians: linkedGuardians,
                primaryContactGuardianId: savedGuardians[0].id,
                resident
            }));
            setStep(2);
        } catch (error) {
            console.error('Failed to save contact info:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to save contact info',
                color: 'red'
            });
        }
    };


    const handleSelectRoom = (room: Room) => {
        setCheckoutData(prev => ({ ...prev, room }));
    };

    const handleCreateOrder = async () => {
        const primaryGuardian = checkoutData.guardians.find(g => g.id === checkoutData.primaryContactGuardianId) || checkoutData.guardians[0];

        // Validate all required data before proceeding
        if (!checkoutData.package) {
            notifications.show({
                title: 'Missing Information',
                message: 'Please select a package first',
                color: 'red',
            });
            return;
        }
        if (!primaryGuardian) {
            notifications.show({
                title: 'Missing Information',
                message: 'Please add guardian information first',
                color: 'red',
            });
            return;
        }
        if (!checkoutData.resident) {
            notifications.show({
                title: 'Missing Information',
                message: 'Please add resident information first',
                color: 'red',
            });
            return;
        }
        if (!checkoutData.room) {
            notifications.show({
                title: 'Missing Information',
                message: 'Please select a room first',
                color: 'red',
            });
            return;
        }
        if (!checkoutData.checkIn) {
            notifications.show({
                title: 'Missing Information',
                message: 'Please select a check-in date first',
                color: 'red',
            });
            return;
        }

        try {
            const checkOut = new Date(checkoutData.checkIn);
            checkOut.setDate(checkOut.getDate() + checkoutData.adjustedDays - 1);

            const adjustedPrice = calculatePrice(checkoutData.package, checkoutData.adjustedDays);
            const { depositMonths } = getBusinessSettings();
            const items = buildInvoiceItems({
                pkg: checkoutData.package,
                adjustedDays: checkoutData.adjustedDays,
                room: checkoutData.room,
                additionalServices: checkoutData.additionalServices,
                depositMonths,
            });
            const { subtotal, tax, total } = calculateInvoiceTotals(items);

            const salesOrder = await createSalesOrder({
                packageId: checkoutData.package.id,
                packageName: checkoutData.package.name,
                residentId: checkoutData.resident.id,
                guardianId: primaryGuardian.id,
                roomId: checkoutData.room.id,
                checkIn: checkoutData.checkIn.toISOString().split('T')[0],
                checkOut: checkOut.toISOString().split('T')[0],
                adjustedDays: checkoutData.adjustedDays,
                basePrice: checkoutData.package.price,
                adjustedPrice,
                status: 'pending_payment',
                createdBy: 'Manager Alice'
            });

            const invoice = await createInvoice({
                salesOrderId: salesOrder.id,
                guardianId: primaryGuardian.id,
                guardianName: `${primaryGuardian.firstName} ${primaryGuardian.lastName}`,
                residentName: `${checkoutData.resident.firstName} ${checkoutData.resident.lastName}`,
                items,
                subtotal,
                tax,
                total,
                status: 'issued'
            });

            setCheckoutData(prev => ({ ...prev, salesOrder, invoice }));
            // Save to persistent storage
            saveDraft();
            setStep(3);
        } catch (error) {
            console.error('Failed to create order:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to create order. Please try again.',
                color: 'red',
            });
        }
    };


    const handleMarkPaid = async (method: 'cash' | 'transfer' | 'credit_card') => {
        const primaryGuardian = checkoutData.guardians.find(g => g.id === checkoutData.primaryContactGuardianId) || checkoutData.guardians[0];
        if (!checkoutData.invoice || !checkoutData.salesOrder || !primaryGuardian || !checkoutData.resident) return;

        const computedItems = checkoutData.package
            ? buildInvoiceItems({
                pkg: checkoutData.package,
                adjustedDays: checkoutData.adjustedDays,
                room: checkoutData.room,
                additionalServices: checkoutData.additionalServices,
                depositMonths,
            })
            : checkoutData.invoice.items;
        const computedTotals = calculateInvoiceTotals(computedItems);

        try {
            await updateInvoice(checkoutData.invoice.id, {
                items: computedItems,
                subtotal: computedTotals.subtotal,
                tax: computedTotals.tax,
                total: computedTotals.total,
                status: 'paid',
                paidAt: new Date().toISOString(),
                paymentMethod: method
            });

            await updateSalesOrder(checkoutData.salesOrder.id, {
                status: 'paid',
                paidAt: new Date().toISOString()
            });

            const contract = await createContract({
                salesOrderId: checkoutData.salesOrder.id,
                guardianId: primaryGuardian.id,
                residentId: checkoutData.resident.id,
                startDate: checkoutData.salesOrder.checkIn,
                endDate: checkoutData.salesOrder.checkOut,
                terms: `Care agreement for ${checkoutData.package?.name}. Includes all services as per package details.`,
                status: 'pending'
            });

            // Generate operation tasks
            if (checkoutData.package && checkoutData.resident && checkoutData.room) {
                await generateTasks(
                    checkoutData.salesOrder,
                    checkoutData.package,
                    checkoutData.resident,
                    checkoutData.room.number
                );
            }

            // Create notification
            await createNotification({
                type: 'sale',
                title: 'New Sale Completed',
                message: `${checkoutData.package?.name} sold to ${primaryGuardian.firstName} ${primaryGuardian.lastName} for resident ${checkoutData.resident.firstName} ${checkoutData.resident.lastName}. Total: ฿${formatCurrency(computedTotals.total)}`,
                relatedId: checkoutData.salesOrder.id
            });

            setCheckoutData(prev => ({
                ...prev,
                contract,
                invoice: {
                    ...prev.invoice!,
                    items: computedItems,
                    subtotal: computedTotals.subtotal,
                    tax: computedTotals.tax,
                    total: computedTotals.total,
                    status: 'paid',
                    paidAt: new Date().toISOString(),
                    paymentMethod: method
                },
                salesOrder: { ...prev.salesOrder!, status: 'paid', paidAt: new Date().toISOString() }
            }));
            // Save completed order to persistent storage
            saveDraft();
            setStep(4);
        } catch (error) {
            console.error('Failed to process payment:', error);
        }
    };


    const handleSaveDraft = async () => {
        if (!checkoutData.salesOrder) return;
        await updateSalesOrder(checkoutData.salesOrder.id, { status: 'draft' });
        navigate('/sales');
    };

    const handleCompleteOrder = () => {
        saveDraft();
        clearDraft();
        restoredDraftIdRef.current = null;
        setStep(5);
    };

    const handleFinish = () => {
        navigate('/sales');
    };

    const getRoomTypeLabel = (type: Room['type']) => {
        const labels = { standard: 'Standard', deluxe: 'Deluxe', suite: 'Suite' };
        return labels[type];
    };

    // Generate step descriptions based on filled data
    const getStepDescription = (stepIndex: number): string | undefined => {
        switch (stepIndex) {
            case 0: // Select Package
                if (checkoutData.package) {
                    return checkoutData.package.name;
                }
                return undefined;
            case 1: // Contact Info
                if (checkoutData.guardians.length > 0 && checkoutData.resident) {
                    const guardianCount = checkoutData.guardians.length;
                    return `${guardianCount} Guardian${guardianCount > 1 ? 's' : ''}, 1 Resident`;
                }
                return undefined;
            case 2: // Select Room
                if (checkoutData.room) {
                    const extras: string[] = [];
                    if (checkoutData.additionalServices.additionalBed) extras.push('Bed');
                    if (checkoutData.additionalServices.specialAmenities.length > 0) {
                        extras.push(`+${checkoutData.additionalServices.specialAmenities.length}`);
                    }
                    const extraStr = extras.length > 0 ? ` + ${extras.join(', ')}` : '';
                    return `Room ${checkoutData.room.number}${extraStr}`;
                }
                return undefined;
            case 3: // Invoice
                if (checkoutData.invoice?.status === 'paid') {
                    return 'Paid';
                }
                return undefined;
            case 4: // Contract
                if (step >= 5) {
                    return 'Signed';
                }
                return undefined;
            default:
                return undefined;
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="sales-order-page" ref={salesOrderRef}>
            <Group mb="xl">
                {step !== 5 && <ActionIcon variant="subtle" size="lg" onClick={() => navigate('/sales')}>
                    <IconArrowLeft size={20} />
                </ActionIcon>}
                <Title order={2}>Create Sales Order</Title>
            </Group>

            {step !== 5 && <Stepper
                active={step}
                onStepClick={setStep}
                mb="xl"
                color="blue"
                size="sm"
                iconSize={32}
            >
                <Stepper.Step
                    label="Select Package"
                    description={getStepDescription(0)}
                    icon={<IconReceipt size={16} />}
                />
                <Stepper.Step
                    label="Contact Info"
                    description={getStepDescription(1)}
                    icon={<IconUser size={16} />}
                />
                <Stepper.Step
                    label="Select Room"
                    description={getStepDescription(2)}
                    icon={<IconHome size={16} />}
                />
                <Stepper.Step
                    label="Invoice"
                    description={getStepDescription(3)}
                    icon={<IconReceipt size={16} />}
                />
                <Stepper.Step
                    label="Contract"
                    description={getStepDescription(4)}
                    icon={<IconFileText size={16} />}
                />
            </Stepper>}

            {/* Step 0: Package Selection */}
            {step === 0 && (
                <div className="package-list">
                    {packages.map(pkg => {
                        const adjustedDays = checkoutData.package?.id === pkg.id
                            ? checkoutData.adjustedDays
                            : pkg.duration;
                        const endDateLabel = formatStayEndDate(checkoutData.checkIn, adjustedDays);

                        return (
                        <Card
                            key={pkg.id}
                            padding="lg"
                            radius="md"
                            withBorder
                            className={`package-card ${expandedPackage === pkg.id ? 'package-card--expanded' : ''}`}
                        >
                            <Group justify="space-between" onClick={() => setExpandedPackage(
                                expandedPackage === pkg.id ? null : pkg.id
                            )} style={{ cursor: 'pointer' }}>
                                <div>
                                    <Text fw={600} size="lg" data-er-field="SALE_PACKAGE.name">{pkg.name}</Text>
                                    <Text size="sm" c="dimmed" data-er-field="SALE_PACKAGE.duration_days">{pkg.duration} days • {pkg.services.length} services</Text>
                                </div>
                                <Group gap="md">
                                    <Badge size="lg" color="blue" data-er-field="SALE_PACKAGE.price">฿{formatCurrency(pkg.price)}</Badge>
                                    <ActionIcon variant="subtle">
                                        {expandedPackage === pkg.id ? <IconChevronUp /> : <IconChevronDown />}
                                    </ActionIcon>
                                </Group>
                            </Group>

                            <Collapse in={expandedPackage === pkg.id}>
                                <Divider my="md" />
                                <Text size="sm" c="dimmed" mb="md" data-er-field="SALE_PACKAGE.description">{pkg.description}</Text>

                                <Text fw={600} size="sm" mb="xs">Included Services:</Text>
                                <Stack gap="xs" mb="lg">
                                    {pkg.services.map((service, idx) => (
                                        <Paper key={idx} p="sm" withBorder>
                                            <Stack gap={2}>
                                                <Group justify="space-between" align="center" wrap="nowrap">
                                                    <Text size="sm" fw={500}>{service.title}</Text>
                                                    <Badge size="xs" variant="light" style={{ textTransform: 'none' }}>{service.dept}</Badge>
                                                </Group>
                                                <Group justify="space-between" wrap="nowrap" align="center">
                                                    <Text size="xs" c="dimmed" style={{ flex: 1 }}>{service.description}</Text>
                                                    <div style={{ transform: 'scale(0.9)', transformOrigin: 'right' }}>
                                                        <RecurrenceDisplay interval={service.interval} />
                                                    </div>
                                                </Group>
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>

                                <Divider my="md" label="Adjust Stay Duration" labelPosition="center" />

                                <Grid align="flex-end" mb="md">
                                    <Grid.Col span={isStayDurationTwoCol ? 6 : 4}>
                                        <NumberInput
                                            label="Number of Days"
                                            value={adjustedDays}
                                            onChange={(val) => {
                                                if (checkoutData.package?.id !== pkg.id) {
                                                    setCheckoutData(prev => ({ ...prev, package: pkg, adjustedDays: Number(val) || pkg.duration }));
                                                } else {
                                                    handleAdjustDays(Number(val) || pkg.duration);
                                                }
                                            }}
                                            min={pkg.duration}
                                            max={365}
                                            suffix=" days"
                                            classNames={{ controls: 'days-input-controls' }}
                                            data-er-field="SALES_ORDER.adjusted_days"
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={isStayDurationTwoCol ? 6 : 4}>
                                        <DateInput
                                            label="Check-in Date"
                                            placeholder="Select date"
                                            value={checkoutData.checkIn}
                                            onChange={handleSetCheckIn}
                                            minDate={new Date()}
                                            description={endDateLabel ? `End date: ${endDateLabel}` : 'End date: —'}
                                            data-er-field="SALES_ORDER.check_in"
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={isStayDurationTwoCol ? 6 : 4}>
                                        <Stack gap={4}>
                                            <Text size="sm" c="dimmed">Total Price</Text>
                                            <Text size="xl" fw={700} c="blue" data-er-field="SALES_ORDER.adjusted_price">
                                                ฿{formatCurrency(calculatePrice(
                                                    pkg,
                                                    adjustedDays
                                                ))}
                                            </Text>
                                        </Stack>
                                    </Grid.Col>
                                </Grid>

                                <Button
                                    fullWidth
                                    size="lg"
                                    onClick={() => handleSelectPackage(pkg)}
                                    disabled={!checkoutData.checkIn}
                                >
                                    Purchase This Package
                                </Button>
                            </Collapse>
                        </Card>
                        );
                    })}
                </div>
            )}

            {/* Step 1: Guardian & Resident Info (Combined) */}
            {step === 1 && (
                <div className="contact-forms-grid">
                    {/* Auto-fill Button for Testing */}
                    <div className="autofill-bar">
                        <Button
                            variant="filled"
                            color="grape"
                            size="sm"
                            onClick={handleAutoFillContactInfo}
                        >
                            Auto-fill Sample Data (2 Guardians + 1 Resident)
                        </Button>
                    </div>

                    {/* Resident Block */}
                    <Card padding="lg" radius="md" withBorder className="contact-form-card">
                        <Group justify="space-between" mb="md">
                            <div>
                                <Text fw={600} size="lg">Resident Information</Text>
                                <Text size="sm" c="dimmed">
                                    Person who will be staying at the facility.
                                </Text>
                            </div>
                            <Button
                                variant="light"
                                size="xs"
                                onClick={handleCopyGuardianToResident}
                            >
                                Copy from Guardian
                            </Button>
                        </Group>

	                        <Stack gap="md">
	                            <Grid>
                                    <Grid.Col span={2}>
                                        <Select
                                            label="Prefix"
                                            placeholder="Prefix"
                                            data={[
                                                { value: 'mr', label: 'Mr.' },
                                                { value: 'mrs', label: 'Mrs.' },
                                                { value: 'miss', label: 'Miss' },
                                                { value: 'ms', label: 'Ms.' },
                                                { value: 'dr', label: 'Dr.' },
                                                { value: 'other', label: 'Other' },
                                            ]}
                                            {...residentForm.getInputProps('prefix')}
                                            data-er-field="RESIDENT.prefix"
                                        />
                                    </Grid.Col>

                                    <Grid.Col span={5}>
	                                    <TextInput
	                                        label="First Name"
	                                        placeholder="First name"
	                                        required
	                                        {...residentForm.getInputProps('firstName')}
	                                        data-er-field="RESIDENT.first_name"
	                                    />
	                                </Grid.Col>
	                                <Grid.Col span={5}>
	                                    <TextInput
	                                        label="Last Name"
	                                        placeholder="Last name"
	                                        required
	                                        {...residentForm.getInputProps('lastName')}
	                                        data-er-field="RESIDENT.last_name"
	                                    />
	                                </Grid.Col>
	                            </Grid>
	                            <Grid>
	                                <Grid.Col span={4}>
                                    <DateInput
                                        label="Date of Birth"
                                        placeholder="Select date"
                                        required
                                        {...residentForm.getInputProps('dateOfBirth')}
                                        value={residentForm.values.dateOfBirth ? new Date(residentForm.values.dateOfBirth) : null}
                                        onChange={(val) => residentForm.setFieldValue('dateOfBirth', val ? val.toISOString().split('T')[0] : '')}
                                        data-er-field="RESIDENT.date_of_birth"
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <Select
                                        label="Gender"
                                        data={[
                                            { value: 'male', label: 'Male' },
                                            { value: 'female', label: 'Female' },
                                            { value: 'other', label: 'Other' }
                                        ]}
                                        {...residentForm.getInputProps('gender')}
                                        data-er-field="RESIDENT.gender"
                                    />
                                </Grid.Col>
                                <Grid.Col span={4}>
                                    <TextInput
                                        label="ID Number"
                                        placeholder="National ID"
                                        {...residentForm.getInputProps('idNumber')}
	                                        data-er-field="RESIDENT.id_number"
	                                    />
	                                </Grid.Col>
	                            </Grid>
	                            <Grid>
	                                <Grid.Col span={4}>
	                                    <TextInput
	                                        label="Hospital No. (HN)"
	                                        placeholder="External patient ID"
	                                        {...residentForm.getInputProps('hospitalNumber')}
	                                        data-er-field="RESIDENT.hospital_number"
	                                    />
	                                </Grid.Col>
	                                <Grid.Col span={4}>
	                                    <TextInput
	                                        label="Race"
	                                        placeholder="e.g., ไทย"
	                                        {...residentForm.getInputProps('race')}
	                                        data-er-field="RESIDENT.race"
	                                    />
	                                </Grid.Col>
	                                <Grid.Col span={4}>
	                                    <TextInput
	                                        label="Nationality"
	                                        placeholder="e.g., ไทย"
	                                        {...residentForm.getInputProps('nationality')}
	                                        data-er-field="RESIDENT.nationality"
	                                    />
	                                </Grid.Col>
	                            </Grid>
	                            <Grid>
	                                <Grid.Col span={6}>
	                                    <TextInput
	                                        label="Religion"
	                                        placeholder="e.g., Christianity"
	                                        {...residentForm.getInputProps('religion')}
	                                        data-er-field="RESIDENT.religion"
	                                    />
	                                </Grid.Col>
	                                <Grid.Col span={6}>
	                                    <Select
	                                        label="Marital Status"
	                                        placeholder="Select status"
	                                        data={[
	                                            { value: 'single', label: 'Single' },
	                                            { value: 'married', label: 'Married' },
	                                            { value: 'other', label: 'Other' },
	                                        ]}
	                                        clearable
	                                        {...residentForm.getInputProps('maritalStatus')}
	                                        data-er-field="RESIDENT.marital_status"
	                                    />
	                                </Grid.Col>
	                            </Grid>
	                            <Grid>
	                                <Grid.Col span={6}>
	                                    <TextInput
	                                        label="Occupation"
	                                        placeholder="e.g., รับจ้าง"
	                                        {...residentForm.getInputProps('occupation')}
	                                        data-er-field="RESIDENT.occupation"
	                                    />
	                                </Grid.Col>
	                                <Grid.Col span={6}>
	                                    <TextInput
	                                        label="Blood Group"
	                                        placeholder="e.g., AB Rh+"
	                                        {...residentForm.getInputProps('bloodGroup')}
	                                        data-er-field="RESIDENT.blood_group"
	                                    />
	                                </Grid.Col>
	                            </Grid>

	                            <Divider my="xs" label="Contact Info" labelPosition="center" />

	                            <Grid>
	                                <Grid.Col span={6}>
	                                    <TextInput
	                                        label="Mobile Phone"
	                                        placeholder="08X-XXX-XXXX"
	                                        {...residentForm.getInputProps('phoneMobile')}
	                                        data-er-field="RESIDENT.phone_mobile"
	                                    />
	                                </Grid.Col>
	                                <Grid.Col span={6}>
	                                    <TextInput
	                                        label="Home Phone"
	                                        placeholder="02-XXX-XXXX"
	                                        {...residentForm.getInputProps('phoneHome')}
	                                        data-er-field="RESIDENT.phone_home"
	                                    />
	                                </Grid.Col>
	                            </Grid>
	                            <TextInput
	                                label="Email"
	                                placeholder="email@example.com"
	                                type="email"
	                                {...residentForm.getInputProps('email')}
	                                data-er-field="RESIDENT.email"
	                            />

	                            <Divider my="xs" label="Address" labelPosition="center" />

	                            <Grid>
	                                <Grid.Col span={4}>
	                                    <TextInput
	                                        label="Address No."
	                                        placeholder="e.g., 36"
	                                        {...residentForm.getInputProps('addressNumber')}
	                                        data-er-field="RESIDENT.address_number"
	                                    />
	                                </Grid.Col>
	                                <Grid.Col span={4}>
	                                    <TextInput
	                                        label="Moo"
	                                        placeholder="e.g., 9"
	                                        {...residentForm.getInputProps('addressMoo')}
	                                        data-er-field="RESIDENT.address_moo"
	                                    />
	                                </Grid.Col>
	                                <Grid.Col span={4}>
	                                    <TextInput
	                                        label="Village/Building"
	                                        placeholder="Village or Building name"
	                                        {...residentForm.getInputProps('residenceName')}
	                                        data-er-field="RESIDENT.address_village"
	                                    />
	                                </Grid.Col>
	                            </Grid>
	                            <Grid>
	                                <Grid.Col span={6}>
	                                    <TextInput
	                                        label="Street"
	                                        placeholder="Street name"
	                                        {...residentForm.getInputProps('addressStreet')}
	                                        data-er-field="RESIDENT.address_street"
	                                    />
	                                </Grid.Col>
	                                <Grid.Col span={6}>
	                                    <TextInput
	                                        label="Soi"
	                                        placeholder="Soi name / number"
	                                        {...residentForm.getInputProps('addressSoi')}
	                                        data-er-field="RESIDENT.address_soi"
	                                    />
	                                </Grid.Col>
	                            </Grid>
	                            <Grid>
	                                <Grid.Col span={4}>
	                                    <TextInput
	                                        label="Sub-district"
	                                        placeholder="Sub-district"
	                                        {...residentForm.getInputProps('addressSubDistrict')}
	                                        data-er-field="RESIDENT.address_sub_district"
	                                    />
	                                </Grid.Col>
	                                <Grid.Col span={4}>
	                                    <TextInput
	                                        label="District"
	                                        placeholder="District"
	                                        {...residentForm.getInputProps('addressDistrict')}
	                                        data-er-field="RESIDENT.address_district"
	                                    />
	                                </Grid.Col>
	                                <Grid.Col span={4}>
	                                    <TextInput
	                                        label="Province"
	                                        placeholder="Province"
	                                        {...residentForm.getInputProps('addressProvince')}
	                                        data-er-field="RESIDENT.address_province"
	                                    />
	                                </Grid.Col>
	                            </Grid>
	                            <Grid>
	                                <Grid.Col span={4}>
	                                    <TextInput
	                                        label="Postal Code"
	                                        placeholder="e.g., 10170"
	                                        {...residentForm.getInputProps('addressPostalCode')}
	                                        data-er-field="RESIDENT.address_postal_code"
	                                    />
	                                </Grid.Col>
	                            </Grid>

	                            <Divider my="xs" label="Medical" labelPosition="center" />

	                            <Textarea
	                                label="Medical Conditions"
	                                placeholder="List any medical conditions..."
	                                rows={2}
	                                {...residentForm.getInputProps('medicalConditions')}
	                                data-er-field="RESIDENT.medical_conditions"
	                            />
                            <Grid>
                                <Grid.Col span={6}>
                                    <TextInput
                                        label="Allergies"
                                        placeholder="Known allergies"
                                        {...residentForm.getInputProps('allergies')}
                                        data-er-field="RESIDENT.allergies"
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <TextInput
                                        label="Dietary Restrictions"
                                        placeholder="E.g., low sodium, vegetarian"
                                        {...residentForm.getInputProps('dietaryRestrictions')}
                                        data-er-field="RESIDENT.dietary_restrictions"
	                                    />
	                                </Grid.Col>
	                            </Grid>

	                            <Divider my="xs" label="Emergency Contact" labelPosition="center" />

	                            <Grid>
	                                <Grid.Col span={6}>
	                                    <TextInput
	                                        label="Emergency Contact Name"
	                                        placeholder="Full name"
	                                        {...residentForm.getInputProps('emergencyContactName')}
	                                        data-er-field="RESIDENT.emergency_contact_name"
	                                    />
	                                </Grid.Col>
	                                <Grid.Col span={6}>
	                                    <Select
	                                        label="Relationship to Resident"
	                                        placeholder="Select relationship"
	                                        data={[
	                                            { value: 'father', label: 'Father' },
	                                            { value: 'mother', label: 'Mother' },
	                                            { value: 'son', label: 'Son' },
	                                            { value: 'daughter', label: 'Daughter' },
	                                            { value: 'spouse', label: 'Spouse' },
	                                            { value: 'sibling', label: 'Sibling' },
	                                            { value: 'relative', label: 'Relative' },
	                                            { value: 'friend', label: 'Friend' },
	                                            { value: 'employer', label: 'Employer' },
	                                            { value: 'other', label: 'Other' },
	                                        ]}
	                                        clearable
	                                        {...residentForm.getInputProps('emergencyContactRelationship')}
	                                        data-er-field="RESIDENT.emergency_contact_relationship"
	                                    />
	                                </Grid.Col>
	                            </Grid>
	                            <TextInput
	                                label="Emergency Contact Phone"
	                                placeholder="Phone number"
	                                {...residentForm.getInputProps('emergencyContact')}
	                                data-er-field="RESIDENT.emergency_contact"
	                            />
	                            <Checkbox
	                                label="Emergency contact address is same as resident"
	                                {...residentForm.getInputProps('emergencyContactAddressSameAsResident', { type: 'checkbox' })}
	                                data-er-field="RESIDENT.emergency_contact_address_same"
	                            />
	                            {!residentForm.values.emergencyContactAddressSameAsResident && (
	                                <Textarea
	                                    label="Emergency Contact Address"
	                                    placeholder="Full address"
	                                    rows={2}
	                                    {...residentForm.getInputProps('emergencyContactAddress')}
	                                    data-er-field="RESIDENT.emergency_contact_address"
	                                />
	                            )}
	                        </Stack>
	                    </Card>

                    {/* Guardian Block */}
                    <Card padding="lg" radius="md" withBorder className="contact-form-card guardians-card">
                        <Group justify="space-between" mb="md">
                            <div>
                                <Text fw={600} size="lg">Guardian Information</Text>
                                <Text size="sm" c="dimmed">
                                    Contact persons responsible for the resident.
                                </Text>
                            </div>
                            <Button
                                variant="light"
                                size="xs"
                                leftSection={<IconPlus size={14} />}
                                onClick={addGuardian}
                            >
                                Add Guardian
                            </Button>
                        </Group>

                        <Stack gap="lg">
                            {guardianForms.map((guardian, index) => (
                                <div key={index} className="guardian-form-block">
                                    <Group justify="space-between" mb="sm">
                                        <Badge variant="light" size="sm">
                                            Guardian {index + 1} {index === 0 && '(Primary)'}
                                        </Badge>
                                        {guardianForms.length > 1 && (
                                            <ActionIcon
                                                variant="subtle"
                                                color="red"
                                                size="sm"
                                                onClick={() => removeGuardian(index)}
                                            >
                                                <IconTrash size={14} />
                                            </ActionIcon>
                                        )}
                                    </Group>
                                    <Stack gap="md">
                                        <Grid>
                                            <Grid.Col span={6}>
                                                <TextInput
                                                    label="First Name"
                                                    placeholder="Enter first name"
                                                    required
                                                    value={guardian.firstName}
                                                    onChange={(e) => updateGuardianField(index, 'firstName', e.target.value)}
                                                    error={guardianErrors[index]?.firstName}
                                                    data-er-field="GUARDIAN.first_name"
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={6}>
                                                <TextInput
                                                    label="Last Name"
                                                    placeholder="Enter last name"
                                                    required
                                                    value={guardian.lastName}
                                                    onChange={(e) => updateGuardianField(index, 'lastName', e.target.value)}
                                                    error={guardianErrors[index]?.lastName}
                                                    data-er-field="GUARDIAN.last_name"
                                                />
                                            </Grid.Col>
                                        </Grid>
                                        <Grid>
                                            <Grid.Col span={6}>
                                                <TextInput
                                                    label="Phone"
                                                    placeholder="08X-XXX-XXXX"
                                                    required
                                                    value={guardian.phone}
                                                    onChange={(e) => updateGuardianField(index, 'phone', e.target.value)}
                                                    error={guardianErrors[index]?.phone}
                                                    data-er-field="GUARDIAN.phone"
                                                />
                                            </Grid.Col>
                                            <Grid.Col span={6}>
                                                <TextInput
                                                    label="Email"
                                                    placeholder="email@example.com"
                                                    required
                                                    value={guardian.email}
                                                    onChange={(e) => updateGuardianField(index, 'email', e.target.value)}
                                                    error={guardianErrors[index]?.email}
                                                    data-er-field="GUARDIAN.email"
                                                />
                                            </Grid.Col>
                                        </Grid>
                                        <TextInput
                                            label="Address"
                                            placeholder="Full address"
                                            value={guardian.address}
                                            onChange={(e) => updateGuardianField(index, 'address', e.target.value)}
                                            data-er-field="GUARDIAN.address"
                                        />
	                                        <Select
	                                            label="Relationship to Resident"
	                                            data={[
	                                                { value: 'father', label: 'Father' },
	                                                { value: 'mother', label: 'Mother' },
	                                                { value: 'son', label: 'Son' },
	                                                { value: 'daughter', label: 'Daughter' },
	                                                { value: 'spouse', label: 'Spouse' },
	                                                { value: 'sibling', label: 'Sibling' },
	                                                { value: 'relative', label: 'Relative' },
	                                                { value: 'friend', label: 'Friend' },
	                                                { value: 'employer', label: 'Employer' },
	                                                { value: 'other', label: 'Other' }
	                                            ]}
	                                            value={guardian.relationship}
	                                            onChange={(val) => updateGuardianField(index, 'relationship', val || 'other')}
	                                            data-er-field="GUARDIAN.relationship"
	                                        />
                                        <Checkbox
                                            label="This guardian pays for care"
                                            description="Check if this guardian contributes to payment"
                                            checked={guardian.pays ?? false}
                                            onChange={(e) => {
                                                const checked = e.currentTarget.checked;
                                                setGuardianForms(prev => prev.map((g, i) =>
                                                    i === index ? { ...g, pays: checked } : g
                                                ));
                                            }}
                                            data-er-field="GUARDIAN.pays"
                                        />
                                    </Stack>
                                    {index < guardianForms.length - 1 && <Divider my="xl" />}
                                </div>
                            ))}
                        </Stack>
                    </Card>

                    {/* Navigation */}
                    <div className="contact-forms-actions">
                        <Button variant="subtle" onClick={() => setStep(0)}>Back</Button>
                        <Button onClick={handleContactSubmit} loading={processing}>
                            Continue to Room Selection
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 2: Room Selection */}
            {step === 2 && (
                <Stack gap="md">
                    <Card padding="lg" radius="md" withBorder>
                        <Text fw={600} size="lg" mb="md">Select Room</Text>
                        <Text size="sm" c="dimmed" mb="lg">
                            Choose an available room for the resident.
                        </Text>

                        <div className="room-grid">
                            {rooms.map(room => (
                                <Card
                                    key={room.id}
                                    padding="md"
                                    radius="md"
                                    withBorder
                                    className={`room-card ${checkoutData.room?.id === room.id ? 'selected' : ''}`}
                                    onClick={() => handleSelectRoom(room)}
                                    data-er-field="ROOM"
                                >
                                    <Group justify="space-between" mb="xs">
                                        <Text fw={600} size="lg" data-er-field="ROOM.room_number">Room {room.number}</Text>
                                        <Badge color={room.type === 'suite' ? 'violet' : room.type === 'deluxe' ? 'blue' : 'gray'} data-er-field="ROOM.room_type">
                                            {getRoomTypeLabel(room.type)}
                                        </Badge>
                                    </Group>
                                    <Text size="sm" c="dimmed" data-er-field="ROOM.floor">Floor {room.floor}</Text>
                                    <Text size="lg" fw={600} c="blue" mt="xs" data-er-field="ROOM.price_per_day">
                                        +฿{formatCurrency(room.pricePerDay)}/day
                                    </Text>
                                    {checkoutData.room?.id === room.id && (
                                        <Badge color="green" mt="xs" fullWidth>Selected</Badge>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </Card>

                    {/* Additional Services */}
                    <Card padding="lg" radius="md" withBorder>
                        <Text fw={600} size="lg" mb="md">Additional Services</Text>
                        <Text size="sm" c="dimmed" mb="lg">
                            Select additional room equipment and services.
                        </Text>

                        <div className="additional-services-grid">
                            {/* Additional Equipment */}
                            <Paper p="md" withBorder>
                                <Group gap="sm" mb="md">
                                    <IconBed size={20} />
                                    <Text fw={500}>Room Equipment</Text>
                                </Group>
                                <Checkbox
                                    label="Additional Bed (+฿500/day)"
                                    description="Extra bed for guardian overnight stay"
                                    checked={checkoutData.additionalServices.additionalBed ?? false}
                                    onChange={(e) => {
                                        const checked = e.currentTarget.checked;
                                        setCheckoutData(prev => ({
                                            ...prev,
                                            additionalServices: {
                                                ...prev.additionalServices,
                                                additionalBed: checked
                                            }
                                        }));
                                    }}
                                    data-er-field="ADDITIONAL_SERVICES.additional_bed"
                                />
                            </Paper>

                            {/* Special Amenities */}
                            <Paper p="md" withBorder>
                                <Text fw={500} mb="md">Special Amenities</Text>
                                <CheckboxGroup
                                    value={checkoutData.additionalServices.specialAmenities}
                                    onChange={(value) => setCheckoutData(prev => ({
                                        ...prev,
                                        additionalServices: {
                                            ...prev.additionalServices,
                                            specialAmenities: value
                                        }
                                    }))}
                                    data-er-field="ADDITIONAL_SERVICES.special_amenities"
                                >
                                    <Stack gap="xs">
                                        <Checkbox value="wheelchair" label="Wheelchair" />
                                        <Checkbox value="oxygen_concentrator" label="Oxygen Concentrator (+฿300/day)" />
                                        <Checkbox value="air_mattress" label="Air Mattress (+฿200/day)" />
                                    </Stack>
                                </CheckboxGroup>
                            </Paper>

                            {/* Self-Provided Items */}
                            <Paper p="md" withBorder>
                                <Text fw={500} mb="md">Self-Provided Items</Text>
                                <Text size="xs" c="dimmed" mb="md">
                                    Check items that guardian will provide themselves.
                                </Text>
                                <Stack gap="xs">
                                    <Checkbox
                                        label="Pampers / Adult Diapers"
                                        description="Guardian will supply pampers for the elder"
                                        checked={checkoutData.additionalServices.selfProvidePampers ?? false}
                                        onChange={(e) => {
                                            const checked = e.currentTarget.checked;
                                            setCheckoutData(prev => ({
                                                ...prev,
                                                additionalServices: {
                                                    ...prev.additionalServices,
                                                    selfProvidePampers: checked
                                                }
                                            }));
                                        }}
                                        data-er-field="ADDITIONAL_SERVICES.self_provide_pampers"
                                    />
                                    <Checkbox
                                        label="Medications"
                                        description="Guardian will supply medications for the elder"
                                        checked={checkoutData.additionalServices.selfProvideMedications ?? false}
                                        onChange={(e) => {
                                            const checked = e.currentTarget.checked;
                                            setCheckoutData(prev => ({
                                                ...prev,
                                                additionalServices: {
                                                    ...prev.additionalServices,
                                                    selfProvideMedications: checked
                                                }
                                            }));
                                        }}
                                        data-er-field="ADDITIONAL_SERVICES.self_provide_medications"
                                    />
                                </Stack>
                            </Paper>

                            {/* Primary Contact Selection */}
                            <Paper p="md" withBorder>
                                <Group gap="sm" mb="md">
                                    <IconPhone size={20} />
                                    <Text fw={500}>Primary Contact</Text>
                                </Group>
                                <Text size="xs" c="dimmed" mb="md">
                                    Select guardian phone number for contacting.
                                </Text>
                                <Select
                                    placeholder="Select primary contact"
                                    data={checkoutData.guardians.map(g => ({
                                        value: g.id,
                                        label: `${g.firstName} ${g.lastName} - ${g.phone} (${g.relationship})`
                                    }))}
                                    value={checkoutData.primaryContactGuardianId}
                                    onChange={(val) => setCheckoutData(prev => ({
                                        ...prev,
                                        primaryContactGuardianId: val
                                    }))}
                                />
                            </Paper>
                        </div>
                    </Card>

                    <Group justify="space-between">
                        <Button variant="subtle" onClick={() => setStep(1)}>Back</Button>
                        <Button
                            onClick={handleCreateOrder}
                            loading={processing}
                            disabled={!checkoutData.room || !checkoutData.package || checkoutData.guardians.length === 0 || !checkoutData.resident || !checkoutData.checkIn}
                        >
                            Create Invoice
                        </Button>
                    </Group>
                </Stack>
            )}

            {/* Step 3: Invoice */}
            {step === 3 && checkoutData.invoice && (
                <div className="invoice-step-container">
                    {/* A4 Paper Invoice */}
                    <div className="invoice-a4-paper">
                        {/* Letterhead */}
                        <div className="invoice-letterhead">
                            <div className="letterhead-logo-placeholder">
                                <Text size="xs" c="dimmed">Company Logo</Text>
                            </div>
                            <div className="letterhead-info">
                                <Text fw={700} size="xl">Elderly Care Facility</Text>
                                <Text size="sm" c="dimmed">123 Care Street, Bangkok 10110</Text>
                                <Text size="sm" c="dimmed">Tel: 02-XXX-XXXX | Email: contact@elderlycare.co.th</Text>
                                <Text size="sm" c="dimmed">Tax ID: 0-1234-56789-01-2</Text>
                            </div>
                        </div>

                        <Divider my="lg" />

                        {/* Invoice Header */}
                        <Group justify="space-between" mb="xl">
                            <div>
                                <Text fw={700} size="xl" c="blue">INVOICE</Text>
                                <Text size="sm" c="dimmed" data-er-field="INVOICE.invoice_number">{checkoutData.invoice.invoiceNumber}</Text>
                            </div>
                            <Badge size="lg" color={checkoutData.invoice.status === 'paid' ? 'green' : 'yellow'} data-er-field="INVOICE.status">
                                {checkoutData.invoice.status.toUpperCase()}
                            </Badge>
                        </Group>

                        {/* Billing Info */}
                        <Grid mb="xl">
                            <Grid.Col span={6}>
                                <Text size="sm" fw={600} c="dimmed" mb="xs">BILL TO (Paying Guardian)</Text>
                                {guardianForms.filter(g => g.pays).length > 0 ? (
                                    guardianForms.filter(g => g.pays).map((guardian, idx) => (
                                        <Paper key={idx} p="sm" withBorder mb="xs" className="invoicee-card" data-er-field="INVOICE.guardian_id">
                                            <Text fw={500} data-er-field="INVOICE.guardian_name">{guardian.firstName} {guardian.lastName}</Text>
                                            {guardian.address ? (
                                                <Text size="sm" c="dimmed">{guardian.address}</Text>
                                            ) : (
                                                <Text size="sm" c="dimmed" fs="italic" className="placeholder-text">
                                                    Address not provided
                                                </Text>
                                            )}
                                            <Text size="sm" c="dimmed">{guardian.phone}</Text>
                                            <Text size="sm" c="dimmed">{guardian.email}</Text>
                                            <Badge size="xs" variant="light" mt="xs">{guardian.relationship}</Badge>
                                        </Paper>
                                    ))
                                ) : (
                                    <Paper p="md" withBorder className="placeholder-box">
                                        <Text size="sm" c="dimmed" fs="italic">No paying guardian selected</Text>
                                    </Paper>
                                )}
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Text size="sm" fw={600} c="dimmed" mb="xs">RESIDENT / CARE RECIPIENT</Text>
                                <Paper p="sm" withBorder>
                                    <Text fw={500} data-er-field="INVOICE.resident_name">{checkoutData.invoice.residentName}</Text>
                                    <Text size="sm" c="dimmed">Room {checkoutData.room?.number}</Text>
                                    <Group gap="xs" mt="xs">
                                        <Badge size="xs" variant="light">
                                            <span data-er-field="SALES_ORDER.check_in">{checkoutData.checkIn?.toLocaleDateString()}</span> - <span data-er-field="SALES_ORDER.check_out">{
                                                checkoutData.checkIn && checkoutData.adjustedDays
                                                    ? new Date(checkoutData.checkIn.getTime() + (checkoutData.adjustedDays - 1) * 24 * 60 * 60 * 1000).toLocaleDateString()
                                                    : ''
                                            }</span>
                                        </Badge>
                                        <Badge size="xs" variant="outline">{checkoutData.adjustedDays} days</Badge>
                                    </Group>
                                </Paper>
                            </Grid.Col>
                        </Grid>

                        {/* Package Details */}
                        <Text size="sm" fw={600} c="dimmed" mb="xs">PACKAGE DETAILS</Text>
                        <Paper p="md" withBorder mb="lg" className={!checkoutData.package ? 'placeholder-box' : ''}>
                            {checkoutData.package ? (
                                <>
                                    <Group justify="space-between" mb="sm">
                                        <Text fw={600} data-er-field="SALE_PACKAGE.name">{checkoutData.package.name}</Text>
                                        <Badge color="blue" data-er-field="SALE_PACKAGE.duration_days">{checkoutData.package.duration} days base</Badge>
                                    </Group>
                                    {checkoutData.package.description ? (
                                        <Text size="sm" c="dimmed" mb="md">{checkoutData.package.description}</Text>
                                    ) : (
                                        <Text size="sm" c="dimmed" fs="italic" mb="md" className="placeholder-text">
                                            Package description not available
                                        </Text>
                                    )}
                                    <Text size="xs" fw={600} c="dimmed" mb="xs">Included Services:</Text>
                                    {checkoutData.package.services.length > 0 ? (
                                        <Stack gap={4}>
                                            {checkoutData.package.services.slice(0, 5).map((service, idx) => (
                                                <Group key={idx} gap="xs">
                                                    <Text size="xs">•</Text>
                                                    <Text size="xs">{service.title}</Text>
                                                    <div style={{ transform: 'scale(0.85)', transformOrigin: 'left' }}>
                                                        <RecurrenceDisplay interval={service.interval} />
                                                    </div>
                                                </Group>
                                            ))}
                                            {checkoutData.package.services.length > 5 && (
                                                <Text size="xs" c="dimmed">+ {checkoutData.package.services.length - 5} more services</Text>
                                            )}
                                        </Stack>
                                    ) : (
                                        <Text size="xs" c="dimmed" fs="italic" className="placeholder-text">
                                            No services defined
                                        </Text>
                                    )}
                                </>
                            ) : (
                                <Text size="sm" c="dimmed" fs="italic">Package information not available</Text>
                            )}
                        </Paper>

                        {/* Pricing Table */}
                        <Table mb="xl" className="invoice-table">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Description</Table.Th>
                                    <Table.Th ta="center">Qty</Table.Th>
                                    <Table.Th ta="right">Unit Price</Table.Th>
                                    <Table.Th ta="right">Amount</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {invoiceItemsForDisplay.map((item, idx) => (
                                    <Table.Tr key={idx} data-er-field="INVOICE_ITEM">
                                        <Table.Td data-er-field="INVOICE_ITEM.description">{item.description}</Table.Td>
                                        <Table.Td ta="center" data-er-field="INVOICE_ITEM.quantity">{item.quantity}</Table.Td>
                                        <Table.Td ta="right" data-er-field="INVOICE_ITEM.unit_price">฿{formatCurrency(item.unitPrice)}</Table.Td>
                                        <Table.Td ta="right" data-er-field="INVOICE_ITEM.total">฿{formatCurrency(item.total)}</Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                            <Table.Tfoot>
                                <Table.Tr>
                                    <Table.Td colSpan={3} ta="right"><Text fw={500}>Subtotal</Text></Table.Td>
                                    <Table.Td ta="right" data-er-field="INVOICE.subtotal">฿{formatCurrency(invoiceTotalsForDisplay.subtotal)}</Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td colSpan={3} ta="right"><Text fw={500}>VAT (7%)</Text></Table.Td>
                                    <Table.Td ta="right" data-er-field="INVOICE.tax">฿{formatCurrency(invoiceTotalsForDisplay.tax)}</Table.Td>
                                </Table.Tr>
                                <Table.Tr className="invoice-total-row">
                                    <Table.Td colSpan={3} ta="right"><Text fw={700} size="lg">Total Due</Text></Table.Td>
                                    <Table.Td ta="right" data-er-field="INVOICE.total"><Text fw={700} size="xl" c="blue">฿{formatCurrency(invoiceTotalsForDisplay.total)}</Text></Table.Td>
                                </Table.Tr>
                            </Table.Tfoot>
                        </Table>

                        {/* Signature Section */}
                        <Grid mt="xl" className="invoice-signature-section">
                            <Grid.Col span={6}>
                                <Text size="xs" c="dimmed" mb="xs">Invoice Date</Text>
                                <Text size="sm" data-er-field="INVOICE.issued_at">{new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Stack gap="xs" align="center" className="signature-block">
                                    <img src="/signature.jpg" alt="Authorized Signature" className="owner-signature" />
                                    <Divider w="100%" />
                                    <Text size="xs" c="dimmed">Authorized Signature</Text>
                                    <Text size="sm" fw={500}>S. Wattana</Text>
                                    <Text size="xs" c="dimmed">Managing Director</Text>
                                </Stack>
                            </Grid.Col>
                        </Grid>
                    </div>

                    {/* Payment Section - Outside A4 */}
                    <Card padding="lg" radius="md" withBorder className="payment-section">
                        <Text fw={600} size="lg" mb="md">Payment Channels</Text>

                        <div className="payment-buttons-grid">
                            {/* PromptPay */}
                            <Button
                                variant="outline"
                                size="lg"
                                className="payment-btn promptpay"
                                onClick={() => setShowPromptPayModal(true)}
                            >
                                <Stack gap={4} align="center">
                                    <Text size="sm" fw={600}>PromptPay</Text>
                                    <Text size="xs" c="dimmed">QR Code</Text>
                                </Stack>
                            </Button>

                            {/* Bank Transfer */}
                            <Button
                                variant="outline"
                                size="lg"
                                className="payment-btn bank"
                                onClick={() => setShowBankModal(true)}
                            >
                                <Stack gap={4} align="center">
                                    <Text size="sm" fw={600}>Bank Transfer</Text>
                                    <Text size="xs" c="dimmed">4 Banks</Text>
                                </Stack>
                            </Button>

                            {/* Cash */}
                            <Button
                                variant="outline"
                                size="lg"
                                className="payment-btn cash"
                                onClick={() => handleMarkPaid('cash')}
                                loading={processing}
                            >
                                <Stack gap={4} align="center">
                                    <Text size="sm" fw={600}>Cash</Text>
                                    <Text size="xs" c="dimmed">In Person</Text>
                                </Stack>
                            </Button>

                            {/* Credit Card */}
                            <Button
                                variant="outline"
                                size="lg"
                                className="payment-btn credit-card"
                                onClick={() => setShowCreditCardModal(true)}
                            >
                                <Stack gap={4} align="center">
                                    <Text size="sm" fw={600}>Credit Card</Text>
                                    <Text size="xs" c="dimmed">Visa / MC</Text>
                                </Stack>
                            </Button>
                        </div>

                        <Divider my="lg" />

                        <Group justify="space-between">
                            <Button variant="subtle" onClick={() => setStep(2)}>Back</Button>
                            <Group gap="sm">
                                <Button variant="light" onClick={handleSaveDraft}>Save as Draft</Button>
                                <Button
                                    variant="outline"
                                    leftSection={<IconPrinter size={18} />}
                                    onClick={() => {
                                        // Sync current data to context before navigating
                                        syncToContext();
                                        navigate('/sales/order/invoice', {
                                            state: {
                                                draftId: currentDraft?.id,
                                                package: checkoutData.package,
                                                adjustedDays: checkoutData.adjustedDays,
                                                checkIn: checkoutData.checkIn,
                                                guardians: checkoutData.guardians,
                                                payingGuardians: guardianForms.filter(g => g.pays),
                                                primaryContactGuardianId: checkoutData.primaryContactGuardianId,
                                                resident: checkoutData.resident,
                                                room: checkoutData.room,
                                                additionalServices: checkoutData.additionalServices,
                                                invoice: checkoutData.invoice
                                            }
                                        });
                                    }}
                                >
                                    View Full Invoice
                                </Button>
                            </Group>
                        </Group>
                    </Card>

                    {/* PromptPay Modal */}
                    <Modal
                        opened={showPromptPayModal}
                        onClose={() => setShowPromptPayModal(false)}
                        title="PromptPay QR Code"
                        centered
                    >
                        <Stack align="center" gap="md">
                            <Paper p="lg" withBorder className="qr-placeholder">
                                <Stack align="center" gap="xs">
                                    <div className="qr-code-box">
                                        <Text size="xs" c="dimmed">QR Code</Text>
                                    </div>
                                    <Text size="sm" c="dimmed">Scan to pay ฿{formatCurrency(invoiceTotalsForDisplay.total)}</Text>
                                </Stack>
                            </Paper>
                            <Text size="sm" c="dimmed">PromptPay ID: 0-1234-56789-01-2</Text>
                            <Text size="sm" c="dimmed">Elderly Care Facility Co., Ltd.</Text>
                            <Divider w="100%" />
                            <Button
                                fullWidth
                                onClick={() => {
                                    setShowPromptPayModal(false);
                                    handleMarkPaid('transfer');
                                }}
                                loading={processing}
                            >
                                Confirm Payment Received
                            </Button>
                        </Stack>
                    </Modal>

                    {/* Bank Transfer Modal */}
                    <Modal
                        opened={showBankModal}
                        onClose={() => setShowBankModal(false)}
                        title="Bank Transfer Details"
                        centered
                        size="md"
                    >
                        <Stack gap="md">
                            <Text size="sm" c="dimmed">Select bank and confirm payment:</Text>

                            <RadioGroup value={selectedBank || ''} onChange={setSelectedBank}>
                                <Stack gap="sm">
                                    <Paper p="md" withBorder className={`bank-option ${selectedBank === 'kbank' ? 'selected' : ''}`}>
                                        <Radio value="kbank" label={
                                            <Group gap="md">
                                                <div className="bank-logo kbank">K</div>
                                                <div>
                                                    <Text size="sm" fw={500}>Kasikorn Bank (KBank)</Text>
                                                    <Text size="xs" c="dimmed">Acc: 123-4-56789-0</Text>
                                                </div>
                                            </Group>
                                        } />
                                    </Paper>
                                    <Paper p="md" withBorder className={`bank-option ${selectedBank === 'scb' ? 'selected' : ''}`}>
                                        <Radio value="scb" label={
                                            <Group gap="md">
                                                <div className="bank-logo scb">S</div>
                                                <div>
                                                    <Text size="sm" fw={500}>Siam Commercial Bank (SCB)</Text>
                                                    <Text size="xs" c="dimmed">Acc: 234-5-67890-1</Text>
                                                </div>
                                            </Group>
                                        } />
                                    </Paper>
                                    <Paper p="md" withBorder className={`bank-option ${selectedBank === 'bbl' ? 'selected' : ''}`}>
                                        <Radio value="bbl" label={
                                            <Group gap="md">
                                                <div className="bank-logo bbl">B</div>
                                                <div>
                                                    <Text size="sm" fw={500}>Bangkok Bank</Text>
                                                    <Text size="xs" c="dimmed">Acc: 345-6-78901-2</Text>
                                                </div>
                                            </Group>
                                        } />
                                    </Paper>
                                    <Paper p="md" withBorder className={`bank-option ${selectedBank === 'ktb' ? 'selected' : ''}`}>
                                        <Radio value="ktb" label={
                                            <Group gap="md">
                                                <div className="bank-logo ktb">K</div>
                                                <div>
                                                    <Text size="sm" fw={500}>Krungthai Bank</Text>
                                                    <Text size="xs" c="dimmed">Acc: 456-7-89012-3</Text>
                                                </div>
                                            </Group>
                                        } />
                                    </Paper>
                                </Stack>
                            </RadioGroup>

                            <Divider />

                            <Text size="sm" fw={500}>Amount: ฿{formatCurrency(invoiceTotalsForDisplay.total)}</Text>
                            <Text size="sm" c="dimmed">Account Name: Elderly Care Facility Co., Ltd.</Text>

                            <Button
                                fullWidth
                                disabled={!selectedBank}
                                onClick={() => {
                                    setShowBankModal(false);
                                    handleMarkPaid('transfer');
                                }}
                                loading={processing}
                            >
                                Confirm Payment Received
                            </Button>
                        </Stack>
                    </Modal>

                    {/* Credit Card Modal */}
                    <Modal
                        opened={showCreditCardModal}
                        onClose={() => setShowCreditCardModal(false)}
                        title="Credit Card Payment"
                        centered
                    >
                        <Stack gap="md">
                            <Text size="sm" c="dimmed">
                                Enter the last 4 digits of the card used for payment verification:
                            </Text>

                            <TextInput
                                label="Last 4 digits of card"
                                placeholder="XXXX"
                                maxLength={4}
                                value={creditCardLast4}
                                onChange={(e) => setCreditCardLast4(e.target.value.replace(/\D/g, ''))}
                                description="For record keeping purposes"
                            />

                            <Text size="sm" fw={500}>Amount: ฿{formatCurrency(invoiceTotalsForDisplay.total)}</Text>

                            <Button
                                fullWidth
                                disabled={creditCardLast4.length !== 4}
                                onClick={() => {
                                    setShowCreditCardModal(false);
                                    handleMarkPaid('credit_card');
                                }}
                                loading={processing}
                            >
                                Confirm Payment (Card ending {creditCardLast4 || '****'})
                            </Button>
                        </Stack>
                    </Modal>
                </div>
            )}

            {/* Step 3: Invoice - No data fallback */}
            {step === 3 && !checkoutData.invoice && (
                <Card padding="xl" radius="md" withBorder ta="center">
                    <IconReceipt size={48} color="var(--mantine-color-gray-5)" style={{ marginBottom: 16 }} />
                    <Title order={3} mb="sm" c="dimmed">No Invoice Available</Title>
                    <Text size="sm" c="dimmed" mb="xl">
                        Please complete the previous steps to generate an invoice.
                    </Text>
                    <Button variant="light" onClick={() => setStep(0)}>
                        Start from Package Selection
                    </Button>
                </Card>
            )}

            {/* Step 4: Contract */}
            {step === 4 && checkoutData.contract && (
                <Card padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="lg">
                        <div>
                            <Text fw={700} size="lg">Service Agreement</Text>
                            <Group gap="xs">
                                <Text size="sm" c="dimmed" data-er-field="CONTRACT.contract_number">Contract #{checkoutData.contract.contractNumber}</Text>
                                <Text size="sm" c="dimmed">•</Text>
                                <Text size="sm" c="dimmed" fw={500}>Order ID: {checkoutData.salesOrder?.id}</Text>
                            </Group>
                        </div>
                        <Badge size="lg" color={checkoutData.contract.status === 'signed' ? 'green' : 'yellow'} data-er-field="CONTRACT.status">
                            {checkoutData.contract.status}
                        </Badge>
                    </Group>

                    <Card padding="md" withBorder mb="lg" bg="gray.0">
                        <Grid>
                            <Grid.Col span={6}>
                                <Text size="sm" c="dimmed">Start Date</Text>
                                <Text fw={500} data-er-field="CONTRACT.start_date">{checkoutData.contract.startDate}</Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Text size="sm" c="dimmed">End Date</Text>
                                <Text fw={500} data-er-field="CONTRACT.end_date">{checkoutData.contract.endDate}</Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Text size="sm" c="dimmed">Primary Guardian</Text>
                                <Text fw={500} data-er-field="CONTRACT.guardian_id">
                                    {(checkoutData.guardians.find(g => g.id === checkoutData.primaryContactGuardianId) || checkoutData.guardians[0])?.firstName}{' '}
                                    {(checkoutData.guardians.find(g => g.id === checkoutData.primaryContactGuardianId) || checkoutData.guardians[0])?.lastName}
                                </Text>
                                {checkoutData.guardians.length > 1 && (
                                    <Text size="xs" c="dimmed">+{checkoutData.guardians.length - 1} other guardian(s)</Text>
                                )}
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Text size="sm" c="dimmed">Resident</Text>
                                <Text fw={500} data-er-field="CONTRACT.resident_id">{checkoutData.resident?.firstName} {checkoutData.resident?.lastName}</Text>
                            </Grid.Col>
                        </Grid>

                        <Divider my="sm" />

                        <Text size="sm" c="dimmed">
                            Open the full contract document to review, print, sign, and send to all guardians.
                        </Text>
                    </Card>

                    <Group justify="space-between">
                        <Button variant="subtle" onClick={() => setStep(3)}>Back</Button>
                        <Group gap="sm">
                            <Button
                                variant="outline"
                                leftSection={<IconFileText size={18} />}
                                onClick={() => {
                                    syncToContext();
                                    navigate('/sales/order/contract', { state: { draftId: currentDraft?.id } });
                                }}
                            >
                                Open Contract Page
                            </Button>
                            <Button
                                variant="filled"
                                color="blue"
                                onClick={handleCompleteOrder}
                            >
                                Complete Order
                            </Button>
                        </Group>
                    </Group>
                </Card>
            )}

            {/* Step 4: Contract - No data fallback */}
            {step === 4 && !checkoutData.contract && (
                <Card padding="xl" radius="md" withBorder ta="center">
                    <IconFileText size={48} color="var(--mantine-color-gray-5)" style={{ marginBottom: 16 }} />
                    <Title order={3} mb="sm" c="dimmed">No Contract Available</Title>
                    <Text size="sm" c="dimmed" mb="xl">
                        Please complete payment first to generate a contract.
                    </Text>
                    <Button variant="light" onClick={() => setStep(3)}>
                        Go to Invoice
                    </Button>
                </Card>
            )}

            {/* Step 5: Complete */}
            {step === 5 && (
                <Card padding="xl" radius="md" withBorder ta="center">
                    <IconCheck size={64} color="var(--mantine-color-green-6)" style={{ marginBottom: 16 }} />
                    <Title order={2} mb="sm">Order Complete!</Title>
                    <Text size="lg" c="dimmed" mb="xl">
                        The sales order has been completed successfully.
                    </Text>

                    <Card padding="lg" withBorder mb="xl" ta="left">
                        <Text fw={600} mb="md">Summary</Text>
                        <Stack gap="sm">
                            <Group gap="sm">
                                <IconCheck size={20} color="var(--mantine-color-green-6)" />
                                <Text size="sm" fw={600}>Order ID: {checkoutData.salesOrder?.id}</Text>
                            </Group>
                            <Group gap="sm">
                                <IconFileText size={20} />
                                <Text size="sm">
                                    Contract #{checkoutData.contract?.contractNumber} has been signed
                                    <Button
                                        variant="link"
                                        size="compact-xs"
                                        onClick={() => navigate('/sales/order/contract', { state: { draftId: currentDraft?.id } })}
                                        ml="xs"
                                    >
                                        View Service Agreement
                                    </Button>
                                </Text>
                            </Group>
                            <Group gap="sm">
                                <IconReceipt size={20} />
                                <Text size="sm">Receipt #{checkoutData.invoice?.invoiceNumber} is ready</Text>
                            </Group>
                            <Group gap="sm">
                                <IconCalendar size={20} />
                                <Text size="sm">
                                    Check-in: {checkoutData.salesOrder?.checkIn} | Check-out: {checkoutData.salesOrder?.checkOut}
                                </Text>
                            </Group>
                        </Stack>
                    </Card>

                    <Text fw={600} mb="md">Instructions for Guardian</Text>
                    <Card padding="md" withBorder mb="xl" ta="left" bg="gray.0">
                        <Stack gap="xs">
                            <Text size="sm">1. Please arrive at the facility on the check-in date by 10:00 AM</Text>
                            <Text size="sm">2. Bring the resident's ID card and any relevant medical documents</Text>
                            <Text size="sm">3. Prepare personal belongings (clothes, toiletries, medications)</Text>
                            <Text size="sm">4. Our staff will provide a facility tour and introduction</Text>
                        </Stack>
                    </Card>

                    <Paper withBorder p="md" mt="xl" bg="gray.0" radius="md">
                        <Group justify="center">
                            <Button
                                variant="subtle"
                                onClick={handleFinish}
                            >
                                Return to Sales Dashboard
                            </Button>
                            <Button
                                variant="filled"
                                color="blue"
                                leftSection={<IconFileText size={18} />}
                                onClick={() => navigate('/sales/order/contract', { state: { draftId: currentDraft?.id } })}
                            >
                                Open Contract Page
                            </Button>
                        </Group>
                    </Paper>
                </Card>
            )}
        </div>
    );
}
