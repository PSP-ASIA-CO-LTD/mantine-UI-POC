import { useLocation, useNavigate } from 'react-router-dom';
import {
    Title,
    Group,
    Button,
    Text,
    Stack,
    Badge,
    Divider,
    Grid,
    ActionIcon,
    Paper,
    Table,
} from '@mantine/core';
import {
    IconArrowLeft,
    IconPrinter,
    IconMail,
    IconDownload,
} from '@tabler/icons-react';
import { useSalesOrder } from '../contexts/SalesOrderContext';
import type { Package, Room, Guardian, Resident, Invoice, AdditionalServices } from '../types';
import './SalesOrderInvoice.css';

interface InvoiceLocationState {
    draftId?: string;
    package: Package | null;
    adjustedDays: number;
    checkIn: Date | null;
    guardians: Guardian[];
    payingGuardians: Guardian[];
    primaryContactGuardianId: string | null;
    resident: Resident | null;
    room: Room | null;
    additionalServices: AdditionalServices;
    invoice: Invoice | null;
}

export function SalesOrderInvoice() {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentDraft, getOrderById } = useSalesOrder();
    const locationState = location.state as InvoiceLocationState | null;
    
    // Try to get data from location state, then from context
    const getStateData = (): InvoiceLocationState | null => {
        // First try location state
        if (locationState?.package) {
            return locationState;
        }
        
        // Try to load from context by draftId
        if (locationState?.draftId) {
            const savedOrder = getOrderById(locationState.draftId);
            if (savedOrder?.package) {
                return {
                    draftId: savedOrder.id,
                    package: savedOrder.package,
                    adjustedDays: savedOrder.adjustedDays,
                    checkIn: savedOrder.checkIn ? new Date(savedOrder.checkIn) : null,
                    guardians: savedOrder.guardians,
                    payingGuardians: savedOrder.guardians.filter(g => g.pays),
                    primaryContactGuardianId: savedOrder.primaryContactGuardianId,
                    resident: savedOrder.resident,
                    room: savedOrder.room,
                    additionalServices: savedOrder.additionalServices,
                    invoice: savedOrder.invoice
                };
            }
        }
        
        // Try current draft from context
        if (currentDraft?.package) {
            return {
                draftId: currentDraft.id,
                package: currentDraft.package,
                adjustedDays: currentDraft.adjustedDays,
                checkIn: currentDraft.checkIn ? new Date(currentDraft.checkIn) : null,
                guardians: currentDraft.guardians,
                payingGuardians: currentDraft.guardians.filter(g => g.pays),
                primaryContactGuardianId: currentDraft.primaryContactGuardianId,
                resident: currentDraft.resident,
                room: currentDraft.room,
                additionalServices: currentDraft.additionalServices,
                invoice: currentDraft.invoice
            };
        }
        
        return null;
    };
    
    const state = getStateData();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH').format(amount);
    };

    const formatDate = (date: Date | string | null) => {
        if (!date) return '—';
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getCheckOutDate = () => {
        if (!state?.checkIn || !state?.adjustedDays) return null;
        const checkIn = typeof state.checkIn === 'string' ? new Date(state.checkIn) : state.checkIn;
        const checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + state.adjustedDays - 1);
        return checkOut;
    };

    const calculateSubtotal = () => {
        let total = 0;

        // Package price
        if (state?.invoice?.subtotal) {
            total = state.invoice.subtotal;
        }

        // Additional bed
        if (state?.additionalServices?.additionalBed && state?.adjustedDays) {
            total += 500 * state.adjustedDays;
        }

        // Special amenities
        if (state?.additionalServices?.specialAmenities) {
            state.additionalServices.specialAmenities.forEach(amenity => {
                if (amenity === 'oxygen_concentrator') total += 300 * (state.adjustedDays || 0);
                if (amenity === 'air_mattress') total += 200 * (state.adjustedDays || 0);
            });
        }

        // Room price
        if (state?.room?.pricePerDay && state?.adjustedDays) {
            total += state.room.pricePerDay * state.adjustedDays;
        }

        return total;
    };

    const subtotal = calculateSubtotal();
    const tax = subtotal * 0.07;
    const grandTotal = subtotal + tax;

    const getRoomTypeLabel = (type: Room['type']) => {
        const labels = { standard: 'Standard', deluxe: 'Deluxe', suite: 'Suite' };
        return labels[type];
    };

    const getAmenityLabel = (amenity: string) => {
        const labels: Record<string, string> = {
            wheelchair: 'Wheelchair',
            oxygen_concentrator: 'Oxygen Concentrator',
            air_mattress: 'Air Mattress',
        };
        return labels[amenity] || amenity;
    };

    const getAmenityPrice = (amenity: string) => {
        const prices: Record<string, number> = {
            oxygen_concentrator: 300,
            air_mattress: 200,
            wheelchair: 0,
        };
        return prices[amenity] || 0;
    };

    // If no state data, show empty state
    if (!state || !state.package) {
        return (
            <div className="invoice-page">
                <Group mb="xl">
                    <ActionIcon variant="subtle" size="lg" onClick={() => navigate('/sales/order')}>
                        <IconArrowLeft size={20} />
                    </ActionIcon>
                    <Title order={2}>Invoice</Title>
                </Group>
                <Paper p="xl" withBorder ta="center">
                    <Text size="lg" c="dimmed" mb="md">No invoice data available</Text>
                    <Text size="sm" c="dimmed" mb="xl">
                        Please complete a sales order to generate an invoice.
                    </Text>
                    <Button onClick={() => navigate('/sales/order')}>
                        Create Sales Order
                    </Button>
                </Paper>
            </div>
        );
    }

    const payingGuardians = state.payingGuardians || state.guardians?.filter((g: any) => g.pays !== false) || [];
    const primaryGuardian = state.guardians?.find(g => g.id === state.primaryContactGuardianId) || state.guardians?.[0];

    return (
        <div className="invoice-page">
            {/* Header Actions */}
            <Group justify="space-between" mb="xl" className="invoice-header no-print">
                <Group>
                    <ActionIcon variant="subtle" size="lg" onClick={() => navigate(-1)}>
                        <IconArrowLeft size={20} />
                    </ActionIcon>
                    <Title order={2}>Invoice</Title>
                </Group>
                <Group gap="sm">
                    <Button
                        variant="light"
                        leftSection={<IconDownload size={18} />}
                    >
                        Download PDF
                    </Button>
                    <Button
                        variant="light"
                        leftSection={<IconMail size={18} />}
                    >
                        Send Email
                    </Button>
                    <Button
                        leftSection={<IconPrinter size={18} />}
                        onClick={() => window.print()}
                    >
                        Print
                    </Button>
                </Group>
            </Group>

            {/* A4 Paper Invoice */}
            <div className="invoice-a4-paper">
                {/* Letterhead */}
                <header className="invoice-letterhead">
                    <div className="letterhead-logo">
                        <div className="logo-placeholder">
                            <Text size="xs" c="dimmed">LOGO</Text>
                        </div>
                    </div>
                    <div className="letterhead-company">
                        <Text fw={700} size="xl" className="company-name">Elderly Care Facility</Text>
                        <Text size="sm" c="dimmed">123 Care Street, Bangkok 10110</Text>
                        <Text size="sm" c="dimmed">Tel: 02-XXX-XXXX | Email: contact@elderlycare.co.th</Text>
                        <Text size="sm" c="dimmed">Tax ID: 0-1234-56789-01-2</Text>
                    </div>
                </header>

                <Divider my="lg" className="letterhead-divider" />

                {/* Invoice Title & Number */}
                <Group justify="space-between" mb="xl" className="invoice-title-section">
                    <div>
                        <Text fw={700} size="xl" c="blue" className="invoice-title">INVOICE</Text>
                        <Text size="sm" c="dimmed" className="invoice-number">
                            {state.invoice?.invoiceNumber || `INV-${Date.now()}`}
                        </Text>
                    </div>
                    <div className="invoice-meta">
                        <Badge size="lg" color={state.invoice?.status === 'paid' ? 'green' : 'yellow'}>
                            {state.invoice?.status?.toUpperCase() || 'DRAFT'}
                        </Badge>
                    </div>
                </Group>

                {/* Billing & Resident Info */}
                <Grid mb="xl" className="billing-section">
                    <Grid.Col span={6}>
                        <Text size="sm" fw={600} c="dimmed" mb="xs" className="section-label">BILL TO</Text>
                        {payingGuardians.length > 0 ? (
                            <Stack gap="xs">
                                {payingGuardians.map((guardian: Guardian, idx: number) => (
                                    <Paper key={idx} p="sm" withBorder className="contact-card">
                                        <Text fw={500}>{guardian.firstName} {guardian.lastName}</Text>
                                        {guardian.address && (
                                            <Text size="sm" c="dimmed">{guardian.address}</Text>
                                        )}
                                        <Text size="sm" c="dimmed">{guardian.phone}</Text>
                                        <Text size="sm" c="dimmed">{guardian.email}</Text>
                                        <Badge size="xs" variant="light" mt="xs">{guardian.relationship}</Badge>
                                    </Paper>
                                ))}
                            </Stack>
                        ) : (
                            <Paper p="md" withBorder className="placeholder-card">
                                <Text size="sm" c="dimmed" fs="italic">No paying guardian specified</Text>
                            </Paper>
                        )}
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Text size="sm" fw={600} c="dimmed" mb="xs" className="section-label">CARE RECIPIENT</Text>
                        <Paper p="sm" withBorder className="contact-card">
                            {state.resident ? (
                                <>
                                    <Text fw={500}>{state.resident.firstName} {state.resident.lastName}</Text>
                                    <Text size="sm" c="dimmed">ID: {state.resident.idNumber || '—'}</Text>
                                    <Text size="sm" c="dimmed">DOB: {state.resident.dateOfBirth || '—'}</Text>
                                    {state.room && (
                                        <Badge size="sm" variant="light" mt="xs">
                                            Room {state.room.number} ({getRoomTypeLabel(state.room.type)})
                                        </Badge>
                                    )}
                                </>
                            ) : (
                                <Text size="sm" c="dimmed" fs="italic">Resident information not provided</Text>
                            )}
                        </Paper>

                        <Text size="sm" fw={600} c="dimmed" mb="xs" mt="md" className="section-label">PRIMARY CONTACT</Text>
                        <Paper p="sm" withBorder className="contact-card">
                            {primaryGuardian ? (
                                <>
                                    <Text fw={500}>{primaryGuardian.firstName} {primaryGuardian.lastName}</Text>
                                    <Text size="sm" c="dimmed">{primaryGuardian.phone}</Text>
                                </>
                            ) : (
                                <Text size="sm" c="dimmed" fs="italic">No primary contact</Text>
                            )}
                        </Paper>
                    </Grid.Col>
                </Grid>

                {/* Stay Period */}
                <Paper p="md" withBorder mb="lg" className="stay-period-card">
                    <Group justify="space-between">
                        <div>
                            <Text size="sm" fw={600} c="dimmed">Check-in</Text>
                            <Text fw={500}>{formatDate(state.checkIn)}</Text>
                        </div>
                        <div className="stay-arrow">→</div>
                        <div>
                            <Text size="sm" fw={600} c="dimmed">Check-out</Text>
                            <Text fw={500}>{formatDate(getCheckOutDate())}</Text>
                        </div>
                        <Badge size="lg" color="blue">{state.adjustedDays} Days</Badge>
                    </Group>
                </Paper>

                {/* Package Details */}
                <Text size="sm" fw={600} c="dimmed" mb="xs" className="section-label">PACKAGE</Text>
                <Paper p="md" withBorder mb="lg" className="package-card">
                    <Group justify="space-between" mb="sm">
                        <Text fw={600} size="lg">{state.package.name}</Text>
                        <Badge color="blue">{state.package.duration} days base</Badge>
                    </Group>
                    {state.package.description && (
                        <Text size="sm" c="dimmed" mb="md">{state.package.description}</Text>
                    )}
                    <Text size="xs" fw={600} c="dimmed" mb="xs">Included Services:</Text>
                    <div className="services-list">
                        {state.package.services.slice(0, 6).map((service, idx) => (
                            <div key={idx} className="service-item">
                                <Text size="xs">• {service.title}</Text>
                                <Badge size="xs" variant="light">{service.interval}</Badge>
                            </div>
                        ))}
                        {state.package.services.length > 6 && (
                            <Text size="xs" c="dimmed" mt="xs">
                                + {state.package.services.length - 6} more services
                            </Text>
                        )}
                    </div>
                </Paper>

                {/* Room Selection */}
                {state.room && (
                    <>
                        <Text size="sm" fw={600} c="dimmed" mb="xs" className="section-label">ROOM</Text>
                        <Paper p="md" withBorder mb="lg" className="room-card">
                            <Group justify="space-between">
                                <div>
                                    <Text fw={500}>Room {state.room.number}</Text>
                                    <Text size="sm" c="dimmed">Floor {state.room.floor}</Text>
                                </div>
                                <div>
                                    <Badge color={
                                        state.room.type === 'suite' ? 'violet' :
                                            state.room.type === 'deluxe' ? 'blue' : 'gray'
                                    }>
                                        {getRoomTypeLabel(state.room.type)}
                                    </Badge>
                                </div>
                                <Text fw={500} c="blue">฿{formatCurrency(state.room.pricePerDay)}/day</Text>
                            </Group>
                        </Paper>
                    </>
                )}

                {/* Additional Services */}
                {(state.additionalServices?.additionalBed ||
                    state.additionalServices?.specialAmenities?.length > 0 ||
                    state.additionalServices?.selfProvidePampers ||
                    state.additionalServices?.selfProvideMedications) && (
                        <>
                            <Text size="sm" fw={600} c="dimmed" mb="xs" className="section-label">ADDITIONAL OPTIONS</Text>
                            <Paper p="md" withBorder mb="lg" className="options-card">
                                <Stack gap="xs">
                                    {state.additionalServices.additionalBed && (
                                        <Group justify="space-between">
                                            <Text size="sm">Additional Bed</Text>
                                            <Text size="sm" c="blue">฿500/day</Text>
                                        </Group>
                                    )}
                                    {state.additionalServices.specialAmenities?.map((amenity, idx) => (
                                        <Group key={idx} justify="space-between">
                                            <Text size="sm">{getAmenityLabel(amenity)}</Text>
                                            <Text size="sm" c="blue">
                                                {getAmenityPrice(amenity) > 0
                                                    ? `฿${formatCurrency(getAmenityPrice(amenity))}/day`
                                                    : 'Included'}
                                            </Text>
                                        </Group>
                                    ))}
                                    {state.additionalServices.selfProvidePampers && (
                                        <Group justify="space-between">
                                            <Text size="sm">Self-Provided Pampers</Text>
                                            <Badge size="xs" variant="light" color="green">Guardian Supplies</Badge>
                                        </Group>
                                    )}
                                    {state.additionalServices.selfProvideMedications && (
                                        <Group justify="space-between">
                                            <Text size="sm">Self-Provided Medications</Text>
                                            <Badge size="xs" variant="light" color="green">Guardian Supplies</Badge>
                                        </Group>
                                    )}
                                </Stack>
                            </Paper>
                        </>
                    )}

                {/* Pricing Table */}
                <Table mb="xl" className="invoice-table">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Description</Table.Th>
                            <Table.Th ta="center">Days</Table.Th>
                            <Table.Th ta="right">Rate</Table.Th>
                            <Table.Th ta="right">Amount</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {/* Package */}
                        <Table.Tr>
                            <Table.Td>
                                <Text fw={500}>{state.package.name}</Text>
                                <Text size="xs" c="dimmed">Care package with {state.package.services.length} services</Text>
                            </Table.Td>
                            <Table.Td ta="center">{state.adjustedDays}</Table.Td>
                            <Table.Td ta="right">฿{formatCurrency(state.package.price / state.package.duration)}</Table.Td>
                            <Table.Td ta="right">฿{formatCurrency(state.invoice?.subtotal || state.package.price)}</Table.Td>
                        </Table.Tr>

                        {/* Room */}
                        {state.room && (
                            <Table.Tr>
                                <Table.Td>
                                    <Text fw={500}>Room {state.room.number} ({getRoomTypeLabel(state.room.type)})</Text>
                                    <Text size="xs" c="dimmed">Floor {state.room.floor}</Text>
                                </Table.Td>
                                <Table.Td ta="center">{state.adjustedDays}</Table.Td>
                                <Table.Td ta="right">฿{formatCurrency(state.room.pricePerDay)}</Table.Td>
                                <Table.Td ta="right">฿{formatCurrency(state.room.pricePerDay * state.adjustedDays)}</Table.Td>
                            </Table.Tr>
                        )}

                        {/* Additional Bed */}
                        {state.additionalServices?.additionalBed && (
                            <Table.Tr>
                                <Table.Td>Additional Bed</Table.Td>
                                <Table.Td ta="center">{state.adjustedDays}</Table.Td>
                                <Table.Td ta="right">฿500</Table.Td>
                                <Table.Td ta="right">฿{formatCurrency(500 * state.adjustedDays)}</Table.Td>
                            </Table.Tr>
                        )}

                        {/* Special Amenities */}
                        {state.additionalServices?.specialAmenities?.filter(a => getAmenityPrice(a) > 0).map((amenity, idx) => (
                            <Table.Tr key={idx}>
                                <Table.Td>{getAmenityLabel(amenity)}</Table.Td>
                                <Table.Td ta="center">{state.adjustedDays}</Table.Td>
                                <Table.Td ta="right">฿{formatCurrency(getAmenityPrice(amenity))}</Table.Td>
                                <Table.Td ta="right">฿{formatCurrency(getAmenityPrice(amenity) * state.adjustedDays)}</Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                    <Table.Tfoot>
                        <Table.Tr>
                            <Table.Td colSpan={3} ta="right"><Text fw={500}>Subtotal</Text></Table.Td>
                            <Table.Td ta="right">฿{formatCurrency(subtotal)}</Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td colSpan={3} ta="right"><Text fw={500}>VAT (7%)</Text></Table.Td>
                            <Table.Td ta="right">฿{formatCurrency(tax)}</Table.Td>
                        </Table.Tr>
                        <Table.Tr className="total-row">
                            <Table.Td colSpan={3} ta="right"><Text fw={700} size="lg">Total Due</Text></Table.Td>
                            <Table.Td ta="right">
                                <Text fw={700} size="xl" c="blue">฿{formatCurrency(grandTotal)}</Text>
                            </Table.Td>
                        </Table.Tr>
                    </Table.Tfoot>
                </Table>

                {/* Notes Section */}
                <Paper p="md" withBorder mb="lg" className="notes-section">
                    <Text size="sm" fw={600} mb="xs">Payment Terms & Notes</Text>
                    <Text size="xs" c="dimmed">
                        • Payment is due upon receipt of this invoice.
                    </Text>
                    <Text size="xs" c="dimmed">
                        • Please include invoice number when making payment.
                    </Text>
                    <Text size="xs" c="dimmed">
                        • For inquiries, contact: 02-XXX-XXXX or billing@elderlycare.co.th
                    </Text>
                </Paper>

                {/* Signature Section */}
                <Grid mt="xl" className="signature-section">
                    <Grid.Col span={6}>
                        <Text size="xs" c="dimmed" mb="xs">Invoice Date</Text>
                        <Text size="sm">{formatDate(new Date())}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Stack gap="xs" align="center" className="signature-block">
                            <img src="/signature.jpg" alt="Authorized Signature" className="signature-image" />
                            <Divider w="100%" />
                            <Text size="xs" c="dimmed">Authorized Signature</Text>
                            <Text size="sm" fw={500}>S. Wattana</Text>
                            <Text size="xs" c="dimmed">Managing Director</Text>
                        </Stack>
                    </Grid.Col>
                </Grid>

                {/* Footer */}
                <div className="invoice-footer">
                    <Text size="xs" c="dimmed" ta="center">
                        Thank you for choosing Elderly Care Facility. We are committed to providing excellent care.
                    </Text>
                </div>
            </div>
        </div>
    );
}
