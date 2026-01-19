import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Title,
    Group,
    Button,
    Card,
    Text,
    Stack,
    Badge,
    TextInput,
    Select,
    NumberInput,
    Textarea,
    Stepper,
    Divider,
    Grid,
    ActionIcon,
    Collapse,
    Paper,
    Table,
    Radio,
    Checkbox,
    Modal,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
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
    IconMail,
    IconArrowLeft
} from '@tabler/icons-react';
import { API } from '../api';
import type { Package, Room, Guardian, Resident, SalesOrder, Invoice, Contract } from '../types';
import './SalesOrder.css';

interface CheckoutData {
    package: Package | null;
    adjustedDays: number;
    checkIn: Date | null;
    guardian: Guardian | null;
    resident: Resident | null;
    room: Room | null;
    salesOrder: SalesOrder | null;
    invoice: Invoice | null;
    contract: Contract | null;
}

export function SalesOrderPage() {
    const navigate = useNavigate();
    const [packages, setPackages] = useState<Package[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedPackage, setExpandedPackage] = useState<string | null>(null);
    const [step, setStep] = useState(0);
    const [checkoutData, setCheckoutData] = useState<CheckoutData>({
        package: null,
        adjustedDays: 0,
        checkIn: null,
        guardian: null,
        resident: null,
        room: null,
        salesOrder: null,
        invoice: null,
        contract: null
    });
    const [processing, setProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const guardianForm = useForm({
        initialValues: {
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            address: '',
            relationship: 'son'
        },
        validate: {
            firstName: (value) => value.length < 2 ? 'First name is required' : null,
            lastName: (value) => value.length < 2 ? 'Last name is required' : null,
            phone: (value) => value.length < 9 ? 'Valid phone is required' : null,
            email: (value) => !/^\S+@\S+$/.test(value) ? 'Valid email is required' : null,
        }
    });

    const residentForm = useForm({
        initialValues: {
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            gender: 'female' as const,
            idNumber: '',
            medicalConditions: '',
            allergies: '',
            dietaryRestrictions: '',
            emergencyContact: ''
        },
        validate: {
            firstName: (value) => value.length < 2 ? 'First name is required' : null,
            lastName: (value) => value.length < 2 ? 'Last name is required' : null,
            dateOfBirth: (value) => !value ? 'Date of birth is required' : null,
        }
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [pkgData, roomData] = await Promise.all([
                    API.getPackages(),
                    API.getAvailableRooms()
                ]);
                setPackages(pkgData);
                setRooms(roomData);
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH').format(amount);
    };

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

    const handleSetCheckIn = (date: Date | null) => {
        setCheckoutData(prev => ({
            ...prev,
            checkIn: date
        }));
    };

    const handleGuardianSubmit = async () => {
        if (!guardianForm.validate().hasErrors) {
            setProcessing(true);
            try {
                const guardian = await API.saveGuardian(guardianForm.values);
                setCheckoutData(prev => ({ ...prev, guardian }));
                setStep(2);
            } catch (error) {
                console.error('Failed to save guardian:', error);
            } finally {
                setProcessing(false);
            }
        }
    };

    const handleResidentSubmit = async () => {
        if (!residentForm.validate().hasErrors && checkoutData.guardian) {
            setProcessing(true);
            try {
                const resident = await API.saveResident({
                    ...residentForm.values,
                    gender: residentForm.values.gender as 'male' | 'female' | 'other',
                    guardianId: checkoutData.guardian.id
                });
                setCheckoutData(prev => ({ ...prev, resident }));
                setStep(3);
            } catch (error) {
                console.error('Failed to save resident:', error);
            } finally {
                setProcessing(false);
            }
        }
    };

    const handleSelectRoom = (room: Room) => {
        setCheckoutData(prev => ({ ...prev, room }));
    };

    const handleCreateOrder = async () => {
        if (!checkoutData.package || !checkoutData.guardian || !checkoutData.resident || !checkoutData.room || !checkoutData.checkIn) return;
        
        setProcessing(true);
        try {
            const checkOut = new Date(checkoutData.checkIn);
            checkOut.setDate(checkOut.getDate() + checkoutData.adjustedDays - 1);
            
            const adjustedPrice = calculatePrice(checkoutData.package, checkoutData.adjustedDays);
            
            const salesOrder = await API.createSalesOrder({
                packageId: checkoutData.package.id,
                packageName: checkoutData.package.name,
                residentId: checkoutData.resident.id,
                guardianId: checkoutData.guardian.id,
                roomId: checkoutData.room.id,
                checkIn: checkoutData.checkIn.toISOString().split('T')[0],
                checkOut: checkOut.toISOString().split('T')[0],
                adjustedDays: checkoutData.adjustedDays,
                basePrice: checkoutData.package.price,
                adjustedPrice,
                status: 'pending_payment',
                createdBy: 'Manager Alice'
            });

            const invoice = await API.createInvoice({
                salesOrderId: salesOrder.id,
                guardianId: checkoutData.guardian.id,
                guardianName: `${checkoutData.guardian.firstName} ${checkoutData.guardian.lastName}`,
                residentName: `${checkoutData.resident.firstName} ${checkoutData.resident.lastName}`,
                items: [{
                    description: `${checkoutData.package.name} (${checkoutData.adjustedDays} days)`,
                    quantity: 1,
                    unitPrice: adjustedPrice,
                    total: adjustedPrice
                }],
                subtotal: adjustedPrice,
                tax: adjustedPrice * 0.07,
                total: adjustedPrice * 1.07,
                status: 'issued'
            });

            setCheckoutData(prev => ({ ...prev, salesOrder, invoice }));
            setStep(4);
        } catch (error) {
            console.error('Failed to create order:', error);
        } finally {
            setProcessing(false);
        }
    };

    const handleMarkPaid = async (method: 'cash' | 'transfer' | 'credit_card') => {
        if (!checkoutData.invoice || !checkoutData.salesOrder || !checkoutData.guardian || !checkoutData.resident) return;
        
        setProcessing(true);
        try {
            await API.updateInvoice(checkoutData.invoice.id, {
                status: 'paid',
                paidAt: new Date().toISOString(),
                paymentMethod: method
            });

            await API.updateSalesOrder(checkoutData.salesOrder.id, {
                status: 'paid',
                paidAt: new Date().toISOString()
            });

            const contract = await API.createContract({
                salesOrderId: checkoutData.salesOrder.id,
                guardianId: checkoutData.guardian.id,
                residentId: checkoutData.resident.id,
                startDate: checkoutData.salesOrder.checkIn,
                endDate: checkoutData.salesOrder.checkOut,
                terms: `Care agreement for ${checkoutData.package?.name}. Includes all services as per package details.`,
                status: 'pending'
            });

            // Generate operation tasks
            if (checkoutData.package && checkoutData.resident && checkoutData.room) {
                await API.generateTasksFromPackage(
                    checkoutData.salesOrder,
                    checkoutData.package,
                    checkoutData.resident,
                    checkoutData.room.number
                );
            }

            // Create notification
            await API.createNotification({
                type: 'sale',
                title: 'New Sale Completed',
                message: `${checkoutData.package?.name} sold to ${checkoutData.guardian.firstName} ${checkoutData.guardian.lastName} for resident ${checkoutData.resident.firstName} ${checkoutData.resident.lastName}. Total: ฿${formatCurrency(checkoutData.invoice.total)}`,
                relatedId: checkoutData.salesOrder.id
            });

            setCheckoutData(prev => ({ 
                ...prev, 
                contract,
                invoice: { ...prev.invoice!, status: 'paid', paidAt: new Date().toISOString(), paymentMethod: method },
                salesOrder: { ...prev.salesOrder!, status: 'paid', paidAt: new Date().toISOString() }
            }));
            setStep(5);
        } catch (error) {
            console.error('Failed to process payment:', error);
        } finally {
            setProcessing(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!checkoutData.salesOrder) return;
        await API.updateSalesOrder(checkoutData.salesOrder.id, { status: 'draft' });
        navigate('/sales');
    };

    const handleFinish = () => {
        setShowSuccess(true);
    };

    const getRoomTypeLabel = (type: Room['type']) => {
        const labels = { standard: 'Standard', deluxe: 'Deluxe', suite: 'Suite' };
        return labels[type];
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="sales-order-page">
            <Group mb="xl">
                <ActionIcon variant="subtle" size="lg" onClick={() => navigate('/sales')}>
                    <IconArrowLeft size={20} />
                </ActionIcon>
                <Title order={2}>Create Sales Order</Title>
            </Group>

            <Stepper active={step} onStepClick={setStep} allowNextStepsSelect={false} mb="xl">
                <Stepper.Step label="Select Package" icon={<IconReceipt size={18} />} />
                <Stepper.Step label="Guardian Info" icon={<IconUser size={18} />} />
                <Stepper.Step label="Resident Info" icon={<IconUser size={18} />} />
                <Stepper.Step label="Select Room" icon={<IconHome size={18} />} />
                <Stepper.Step label="Invoice" icon={<IconReceipt size={18} />} />
                <Stepper.Step label="Complete" icon={<IconCheck size={18} />} />
            </Stepper>

            {/* Step 0: Package Selection */}
            {step === 0 && (
                <div className="package-list">
                    {packages.map(pkg => (
                        <Card 
                            key={pkg.id} 
                            padding="lg" 
                            radius="md" 
                            withBorder 
                            className="package-card"
                        >
                            <Group justify="space-between" onClick={() => setExpandedPackage(
                                expandedPackage === pkg.id ? null : pkg.id
                            )} style={{ cursor: 'pointer' }}>
                                <div>
                                    <Text fw={600} size="lg">{pkg.name}</Text>
                                    <Text size="sm" c="dimmed">{pkg.duration} days • {pkg.services.length} services</Text>
                                </div>
                                <Group gap="md">
                                    <Badge size="lg" color="blue">฿{formatCurrency(pkg.price)}</Badge>
                                    <ActionIcon variant="subtle">
                                        {expandedPackage === pkg.id ? <IconChevronUp /> : <IconChevronDown />}
                                    </ActionIcon>
                                </Group>
                            </Group>

                            <Collapse in={expandedPackage === pkg.id}>
                                <Divider my="md" />
                                <Text size="sm" c="dimmed" mb="md">{pkg.description}</Text>
                                
                                <Text fw={600} size="sm" mb="xs">Included Services:</Text>
                                <Stack gap="xs" mb="lg">
                                    {pkg.services.map((service, idx) => (
                                        <Paper key={idx} p="sm" withBorder>
                                            <Group justify="space-between">
                                                <div>
                                                    <Text size="sm" fw={500}>{service.title}</Text>
                                                    <Text size="xs" c="dimmed">{service.description}</Text>
                                                </div>
                                                <Group gap="xs">
                                                    <Badge size="xs" variant="light">{service.dept}</Badge>
                                                    <Badge size="xs" variant="outline">{service.interval}</Badge>
                                                </Group>
                                            </Group>
                                        </Paper>
                                    ))}
                                </Stack>

                                <Divider my="md" label="Adjust Stay Duration" labelPosition="center" />
                                
                                <Grid align="flex-end" mb="md">
                                    <Grid.Col span={4}>
                                        <NumberInput
                                            label="Number of Days"
                                            value={checkoutData.package?.id === pkg.id ? checkoutData.adjustedDays : pkg.duration}
                                            onChange={(val) => {
                                                if (checkoutData.package?.id !== pkg.id) {
                                                    setCheckoutData(prev => ({ ...prev, package: pkg, adjustedDays: Number(val) || pkg.duration }));
                                                } else {
                                                    handleAdjustDays(Number(val) || pkg.duration);
                                                }
                                            }}
                                            min={pkg.duration}
                                            max={365}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={4}>
                                        <DateInput
                                            label="Check-in Date"
                                            placeholder="Select date"
                                            value={checkoutData.checkIn}
                                            onChange={handleSetCheckIn}
                                            minDate={new Date()}
                                            leftSection={<IconCalendar size={16} />}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={4}>
                                        <Stack gap={4}>
                                            <Text size="sm" c="dimmed">Total Price</Text>
                                            <Text size="xl" fw={700} c="blue">
                                                ฿{formatCurrency(calculatePrice(
                                                    pkg, 
                                                    checkoutData.package?.id === pkg.id ? checkoutData.adjustedDays : pkg.duration
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
                    ))}
                </div>
            )}

            {/* Step 1: Guardian Info */}
            {step === 1 && (
                <Card padding="lg" radius="md" withBorder>
                    <Text fw={600} size="lg" mb="md">Guardian Information</Text>
                    <Text size="sm" c="dimmed" mb="lg">
                        Please provide the contact person responsible for the resident.
                    </Text>

                    <Grid>
                        <Grid.Col span={6}>
                            <TextInput
                                label="First Name"
                                placeholder="Enter first name"
                                required
                                {...guardianForm.getInputProps('firstName')}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Last Name"
                                placeholder="Enter last name"
                                required
                                {...guardianForm.getInputProps('lastName')}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Phone"
                                placeholder="08X-XXX-XXXX"
                                required
                                {...guardianForm.getInputProps('phone')}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Email"
                                placeholder="email@example.com"
                                required
                                {...guardianForm.getInputProps('email')}
                            />
                        </Grid.Col>
                        <Grid.Col span={8}>
                            <TextInput
                                label="Address"
                                placeholder="Full address"
                                {...guardianForm.getInputProps('address')}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Select
                                label="Relationship"
                                data={[
                                    { value: 'son', label: 'Son' },
                                    { value: 'daughter', label: 'Daughter' },
                                    { value: 'spouse', label: 'Spouse' },
                                    { value: 'relative', label: 'Relative' },
                                    { value: 'other', label: 'Other' }
                                ]}
                                {...guardianForm.getInputProps('relationship')}
                            />
                        </Grid.Col>
                    </Grid>

                    <Group justify="space-between" mt="xl">
                        <Button variant="subtle" onClick={() => setStep(0)}>Back</Button>
                        <Button onClick={handleGuardianSubmit} loading={processing}>
                            Continue
                        </Button>
                    </Group>
                </Card>
            )}

            {/* Step 2: Resident Info */}
            {step === 2 && (
                <Card padding="lg" radius="md" withBorder>
                    <Text fw={600} size="lg" mb="md">Resident Information</Text>
                    <Text size="sm" c="dimmed" mb="lg">
                        Please provide details about the person who will be staying.
                    </Text>

                    <Grid>
                        <Grid.Col span={6}>
                            <TextInput
                                label="First Name"
                                placeholder="Enter first name"
                                required
                                {...residentForm.getInputProps('firstName')}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Last Name"
                                placeholder="Enter last name"
                                required
                                {...residentForm.getInputProps('lastName')}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <TextInput
                                label="Date of Birth"
                                type="date"
                                required
                                {...residentForm.getInputProps('dateOfBirth')}
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
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <TextInput
                                label="ID Number"
                                placeholder="National ID"
                                {...residentForm.getInputProps('idNumber')}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Textarea
                                label="Medical Conditions"
                                placeholder="List any medical conditions..."
                                rows={2}
                                {...residentForm.getInputProps('medicalConditions')}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Allergies"
                                placeholder="Known allergies"
                                {...residentForm.getInputProps('allergies')}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Dietary Restrictions"
                                placeholder="E.g., low sodium, vegetarian"
                                {...residentForm.getInputProps('dietaryRestrictions')}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Emergency Contact"
                                placeholder="Phone number"
                                {...residentForm.getInputProps('emergencyContact')}
                            />
                        </Grid.Col>
                    </Grid>

                    <Group justify="space-between" mt="xl">
                        <Button variant="subtle" onClick={() => setStep(1)}>Back</Button>
                        <Button onClick={handleResidentSubmit} loading={processing}>
                            Continue
                        </Button>
                    </Group>
                </Card>
            )}

            {/* Step 3: Room Selection */}
            {step === 3 && (
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
                            >
                                <Group justify="space-between" mb="xs">
                                    <Text fw={600} size="lg">Room {room.number}</Text>
                                    <Badge color={room.type === 'suite' ? 'violet' : room.type === 'deluxe' ? 'blue' : 'gray'}>
                                        {getRoomTypeLabel(room.type)}
                                    </Badge>
                                </Group>
                                <Text size="sm" c="dimmed">Floor {room.floor}</Text>
                                <Text size="lg" fw={600} c="blue" mt="xs">
                                    +฿{formatCurrency(room.pricePerDay)}/day
                                </Text>
                                {checkoutData.room?.id === room.id && (
                                    <Badge color="green" mt="xs" fullWidth>Selected</Badge>
                                )}
                            </Card>
                        ))}
                    </div>

                    <Group justify="space-between" mt="xl">
                        <Button variant="subtle" onClick={() => setStep(2)}>Back</Button>
                        <Button 
                            onClick={handleCreateOrder} 
                            loading={processing}
                            disabled={!checkoutData.room}
                        >
                            Create Invoice
                        </Button>
                    </Group>
                </Card>
            )}

            {/* Step 4: Invoice */}
            {step === 4 && checkoutData.invoice && (
                <Card padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="lg">
                        <div>
                            <Text fw={600} size="lg">Invoice</Text>
                            <Text size="sm" c="dimmed">{checkoutData.invoice.invoiceNumber}</Text>
                        </div>
                        <Badge size="lg" color={checkoutData.invoice.status === 'paid' ? 'green' : 'yellow'}>
                            {checkoutData.invoice.status}
                        </Badge>
                    </Group>

                    <Grid mb="lg">
                        <Grid.Col span={6}>
                            <Text size="sm" c="dimmed">Bill To</Text>
                            <Text fw={500}>{checkoutData.invoice.guardianName}</Text>
                            <Text size="sm">{checkoutData.guardian?.address}</Text>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Text size="sm" c="dimmed">Resident</Text>
                            <Text fw={500}>{checkoutData.invoice.residentName}</Text>
                            <Text size="sm">Room {checkoutData.room?.number}</Text>
                        </Grid.Col>
                    </Grid>

                    <Table mb="lg">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Description</Table.Th>
                                <Table.Th ta="right">Qty</Table.Th>
                                <Table.Th ta="right">Price</Table.Th>
                                <Table.Th ta="right">Total</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {checkoutData.invoice.items.map((item, idx) => (
                                <Table.Tr key={idx}>
                                    <Table.Td>{item.description}</Table.Td>
                                    <Table.Td ta="right">{item.quantity}</Table.Td>
                                    <Table.Td ta="right">฿{formatCurrency(item.unitPrice)}</Table.Td>
                                    <Table.Td ta="right">฿{formatCurrency(item.total)}</Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                        <Table.Tfoot>
                            <Table.Tr>
                                <Table.Td colSpan={3} ta="right"><Text fw={500}>Subtotal</Text></Table.Td>
                                <Table.Td ta="right">฿{formatCurrency(checkoutData.invoice.subtotal)}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td colSpan={3} ta="right"><Text fw={500}>VAT (7%)</Text></Table.Td>
                                <Table.Td ta="right">฿{formatCurrency(checkoutData.invoice.tax)}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td colSpan={3} ta="right"><Text fw={700} size="lg">Total</Text></Table.Td>
                                <Table.Td ta="right"><Text fw={700} size="lg" c="blue">฿{formatCurrency(checkoutData.invoice.total)}</Text></Table.Td>
                            </Table.Tr>
                        </Table.Tfoot>
                    </Table>

                    <Divider my="lg" label="Payment Method" labelPosition="center" />

                    <Group justify="center" gap="md">
                        <Button 
                            variant="outline" 
                            size="lg"
                            onClick={() => handleMarkPaid('cash')}
                            loading={processing}
                        >
                            Pay with Cash
                        </Button>
                        <Button 
                            variant="outline" 
                            size="lg"
                            onClick={() => handleMarkPaid('transfer')}
                            loading={processing}
                        >
                            Pay with Transfer
                        </Button>
                        <Button 
                            variant="filled" 
                            size="lg"
                            onClick={() => handleMarkPaid('credit_card')}
                            loading={processing}
                        >
                            Pay with Card
                        </Button>
                    </Group>

                    <Divider my="lg" />

                    <Group justify="space-between">
                        <Button variant="subtle" onClick={() => setStep(3)}>Back</Button>
                        <Button variant="light" onClick={handleSaveDraft}>Save as Draft</Button>
                    </Group>
                </Card>
            )}

            {/* Step 5: Complete */}
            {step === 5 && (
                <Card padding="xl" radius="md" withBorder ta="center">
                    <IconCheck size={64} color="var(--mantine-color-green-6)" style={{ marginBottom: 16 }} />
                    <Title order={2} mb="sm">Payment Successful!</Title>
                    <Text size="lg" c="dimmed" mb="xl">
                        The sales order has been completed successfully.
                    </Text>

                    <Card padding="lg" withBorder mb="xl" ta="left">
                        <Text fw={600} mb="md">What's Next?</Text>
                        <Stack gap="sm">
                            <Group gap="sm">
                                <IconFileText size={20} />
                                <Text size="sm">Contract #{checkoutData.contract?.contractNumber} has been generated</Text>
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
                            <Text size="sm">4. Sign the contract upon arrival</Text>
                            <Text size="sm">5. Our staff will provide a facility tour and introduction</Text>
                        </Stack>
                    </Card>

                    <Group justify="center" gap="md">
                        <Button 
                            variant="outline" 
                            leftSection={<IconPrinter size={18} />}
                            onClick={() => window.print()}
                        >
                            Print Receipt
                        </Button>
                        <Button 
                            variant="outline" 
                            leftSection={<IconMail size={18} />}
                        >
                            Send via Email
                        </Button>
                        <Button onClick={handleFinish}>
                            Return to Dashboard
                        </Button>
                    </Group>
                </Card>
            )}

            <Modal 
                opened={showSuccess} 
                onClose={() => {}} 
                withCloseButton={false}
                centered
            >
                <Stack align="center" py="xl">
                    <IconCheck size={48} color="var(--mantine-color-green-6)" />
                    <Text fw={600} size="lg">Order Complete!</Text>
                    <Text size="sm" c="dimmed" ta="center">
                        A notification has been sent to the Sales Dashboard.
                    </Text>
                    <Button onClick={() => navigate('/sales')} mt="md">
                        Go to Sales Dashboard
                    </Button>
                </Stack>
            </Modal>
        </div>
    );
}
