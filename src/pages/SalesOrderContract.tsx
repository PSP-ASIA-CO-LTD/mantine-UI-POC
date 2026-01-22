import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ActionIcon,
    Button,
    Divider,
    Group,
    Modal,
    Paper,
    Select,
    Stack,
    Table,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconCheck, IconMail, IconPrinter } from '@tabler/icons-react';
import { API } from '../api';
import { PageActionBar } from '../components/PageActionBar';
import { useSalesOrder } from '../contexts/SalesOrderContext';
import type { ContractLanguage, StoredContract } from '../types';
import './SalesOrderContract.css';

type ContractLocationState = {
    draftId?: string;
};

const AMENITY_LABELS_TH: Record<string, string> = {
    wheelchair: 'รถเข็น (Wheelchair)',
    oxygen_concentrator: 'เครื่องผลิตออกซิเจน (Oxygen Concentrator)',
    air_mattress: 'ที่นอนลม (Air Mattress)',
};

const AMENITY_LABELS_EN: Record<string, string> = {
    wheelchair: 'Wheelchair',
    oxygen_concentrator: 'Oxygen Concentrator',
    air_mattress: 'Air Mattress',
};

const getAmenityPricePerDay = (amenity: string) => {
    if (amenity === 'oxygen_concentrator') return 300;
    if (amenity === 'air_mattress') return 200;
    if (amenity === 'wheelchair') return 0;
    return 0;
};

export function SalesOrderContract() {
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = (location.state || null) as ContractLocationState | null;

    const { currentDraft, loadDraft, updateDraft, saveDraft, getPrimaryGuardian, calculateTotalPrice } = useSalesOrder();

    const [stored, setStored] = useState<StoredContract | null>(null);
    const storedRef = useRef<StoredContract | null>(null);
    const [language, setLanguage] = useState<ContractLanguage>('th');

    const [showSignModal, setShowSignModal] = useState(false);
    const [signerEmail, setSignerEmail] = useState('');

    const paperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        storedRef.current = stored;
    }, [stored]);

    // Load draft by id when coming from SalesOrder.tsx step 4
    useEffect(() => {
        if (!locationState?.draftId) return;
        if (currentDraft?.id === locationState.draftId) return;
        loadDraft(locationState.draftId);
    }, [locationState?.draftId, currentDraft?.id, loadDraft]);

    const order = currentDraft;

    if (!order || !order.package || !order.contract) {
        return (
            <div className="contract-page">
                <Paper p="lg" withBorder>
                    <Stack gap="md">
                        <Title order={2}>Contract</Title>
                        <Text c="dimmed">No contract data available. Please complete a sales order first.</Text>
                        <Group justify="flex-start" gap="sm">
                            <Button onClick={() => navigate('/sales/order')}>Go to Sales Order</Button>
                        </Group>
                    </Stack>
                </Paper>
            </div>
        );
    }

    const contract = order.contract;
    const pkg = order.package;

    const days = useMemo(() => {
        return order.adjustedDays || pkg.duration;
    }, [order.adjustedDays, pkg.duration]);

    const pricing = useMemo(() => {
        return calculateTotalPrice(order);
    }, [order, calculateTotalPrice]);

    const sharePath = useMemo(() => {
        if (!stored?.id) return null;
        return `/contract/${stored.id}`;
    }, [stored?.id]);

    const shareUrl = useMemo(() => {
        if (!sharePath) return null;
        try {
            return new URL(sharePath, window.location.origin).toString();
        } catch {
            return sharePath;
        }
    }, [sharePath]);

    const primaryGuardian = useMemo(() => getPrimaryGuardian(order), [order, getPrimaryGuardian]);

    // Ensure stored contract exists (localStorage-backed) and aligns with the current draft
    useEffect(() => {
        const run = async () => {
            const salesOrderId = order.salesOrder?.id || contract.salesOrderId;
            const existing = salesOrderId ? await API.getStoredContractBySalesOrderId(salesOrderId) : undefined;

            if (existing) {
                setStored(existing);
                setLanguage(existing.language);
                return;
            }

            const now = new Date().toISOString();
            const guardianEmails = order.guardians
                .map(g => (g.email || '').trim().toLowerCase())
                .filter(Boolean);

            const id = `sctr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            const initial: StoredContract = {
                id,
                contractNumber: contract.contractNumber,
                language: 'th',
                status: contract.status,
                createdAt: now,
                updatedAt: now,
                allowedGuardianEmails: guardianEmails,
                compiledHtml: '',
                source: {
                    package: order.package,
                    adjustedDays: order.adjustedDays,
                    checkIn: order.checkIn,
                    checkOut: order.checkOut,
                    guardians: order.guardians,
                    primaryContactGuardianId: order.primaryContactGuardianId,
                    resident: order.resident,
                    room: order.room,
                    additionalServices: order.additionalServices,
                    salesOrder: order.salesOrder,
                    invoice: order.invoice,
                    contract,
                },
                pricing,
                emailLog: [],
            };

            const saved = await API.upsertStoredContract(initial);
            setStored(saved);
            setLanguage(saved.language);
        };

        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order.id]);

    // Keep the stored contract up to date with the current render (compiled paper + source snapshot)
    useEffect(() => {
        const run = async () => {
            const current = storedRef.current;
            if (!current) return;
            if (!paperRef.current) return;

            const compiledHtml = paperRef.current.innerHTML;
            const updated: StoredContract = {
                ...current,
                language,
                status: contract.status,
                contractNumber: contract.contractNumber,
                compiledHtml,
                source: {
                    package: order.package,
                    adjustedDays: order.adjustedDays,
                    checkIn: order.checkIn,
                    checkOut: order.checkOut,
                    guardians: order.guardians,
                    primaryContactGuardianId: order.primaryContactGuardianId,
                    resident: order.resident,
                    room: order.room,
                    additionalServices: order.additionalServices,
                    salesOrder: order.salesOrder,
                    invoice: order.invoice,
                    contract,
                },
                pricing,
                allowedGuardianEmails: order.guardians
                    .map(g => (g.email || '').trim().toLowerCase())
                    .filter(Boolean),
            };

            const saved = await API.upsertStoredContract(updated);
            setStored(saved);
        };

        const t = window.setTimeout(() => {
            run();
        }, 0);

        return () => window.clearTimeout(t);
    }, [
        language,
        pricing.subtotal,
        pricing.tax,
        pricing.total,
        order.updatedAt,
        contract.status,
        contract.contractNumber,
    ]);

    const contractTitle = language === 'th' ? 'สัญญาให้บริการดูแลผู้สูงอายุ/ผู้มีภาวะพึ่งพิง' : 'Care Service Agreement';
    const policyTitle = language === 'th' ? 'ระเบียบการใช้บริการ (รวมในสัญญา)' : 'Service Rules & Policy (Included)';
    const addOnsTitle = language === 'th' ? 'ข้อมูลห้องพักและบริการเพิ่มเติม' : 'Room & Additional Services';
    const pricingTitle = language === 'th' ? 'สรุปราคาและการชำระเงิน' : 'Pricing & Payment Summary';

    const amenityLabels = language === 'th' ? AMENITY_LABELS_TH : AMENITY_LABELS_EN;

    const handlePrint = () => {
        window.print();
    };

    const handleEmailGuardians = async () => {
        if (!stored) return;
        const recipients = order.guardians.map(g => (g.email || '').trim()).filter(Boolean);
        if (recipients.length === 0) {
            notifications.show({
                title: 'No guardian emails',
                message: 'Please add guardian email addresses before sending.',
                color: 'yellow',
            });
            return;
        }

        const subject =
            language === 'th'
                ? `สัญญาเลขที่ ${stored.contractNumber} (ลิงก์สำหรับดูเอกสาร)`
                : `Contract ${stored.contractNumber} (View link)`;

        const updated = await API.logStoredContractEmail(stored.id, { to: recipients, subject });
        if (updated) setStored(updated);

        await API.createNotification({
            type: 'info',
            title: language === 'th' ? 'บันทึกการส่งสัญญาแล้ว' : 'Contract email logged',
            message:
                language === 'th'
                    ? `บันทึกการส่งสัญญาถึง ${recipients.length} อีเมล (ยังไม่ส่งอีเมลจริงในระบบ) — ลิงก์: ${sharePath || ''}`
                    : `Logged sending to ${recipients.length} email(s) (no real email delivery yet) — Link: ${sharePath || ''}`,
            relatedId: stored.id,
        });

        notifications.show({
            title: language === 'th' ? 'บันทึกการส่งแล้ว' : 'Logged',
            message: language === 'th' ? 'ระบบบันทึกการส่งให้ผู้ปกครองทั้งหมดแล้ว' : 'Email send has been logged for all guardians',
            color: 'green',
        });
    };

    const openSignModal = () => {
        setSignerEmail(primaryGuardian?.email || '');
        setShowSignModal(true);
    };

    const handleSign = async () => {
        if (!stored) return;

        const email = signerEmail.trim().toLowerCase();
        const allowed = new Set(order.guardians.map(g => (g.email || '').trim().toLowerCase()).filter(Boolean));
        if (!email || !allowed.has(email)) {
            notifications.show({
                title: language === 'th' ? 'อีเมลไม่ถูกต้อง' : 'Invalid email',
                message:
                    language === 'th'
                        ? 'กรุณากรอกอีเมลของผู้ปกครองที่อยู่ในสัญญาเท่านั้น'
                        : 'Please enter a guardian email that is part of this contract.',
                color: 'red',
            });
            return;
        }

        const updatedStored = await API.signStoredContract(stored.id, email);
        if (updatedStored) setStored(updatedStored);

        const signedAt = new Date().toISOString();
        updateDraft({
            contract: {
                ...contract,
                status: 'signed',
                signedAt,
                signedBy: email,
            },
        });
        saveDraft();

        notifications.show({
            title: language === 'th' ? 'ลงนามแล้ว' : 'Signed',
            message: language === 'th' ? 'บันทึกการลงนามในสัญญาเรียบร้อย' : 'Contract signature has been recorded',
            color: 'green',
        });

        setShowSignModal(false);
    };

    const packageDailyRate = order.package.price / order.package.duration;
    const basePackagePrice = packageDailyRate * days;
    const roomPrice = order.room ? order.room.pricePerDay * days : 0;
    const bedPrice = order.additionalServices.additionalBed ? 500 * days : 0;
    const amenities = order.additionalServices.specialAmenities || [];

    return (
        <div className="contract-page">
            <PageActionBar
                className="contract-actions"
                left={
                    <>
                        <ActionIcon variant="subtle" size="lg" onClick={() => navigate(-1)} aria-label="Back">
                            <IconArrowLeft size={20} />
                        </ActionIcon>
                        <Title order={3}>{language === 'th' ? 'สัญญา' : 'Contract'}</Title>
                    </>
                }
                right={
                    <>
                        <Select
                            value={language}
                            onChange={(val) => setLanguage((val as ContractLanguage) || 'th')}
                            data={[
                                { value: 'th', label: 'ไทย (Thai)' },
                                { value: 'en', label: 'English' },
                            ]}
                            allowDeselect={false}
                            aria-label="Language"
                            comboboxProps={{ withinPortal: true }}
                        />
                        <Button variant="light" leftSection={<IconMail size={18} />} onClick={handleEmailGuardians}>
                            {language === 'th' ? 'อีเมลถึงผู้ปกครองทั้งหมด' : 'Email guardians'}
                        </Button>
                        <Button variant="light" leftSection={<IconPrinter size={18} />} onClick={handlePrint}>
                            {language === 'th' ? 'พิมพ์' : 'Print'}
                        </Button>
                        <Button leftSection={<IconCheck size={18} />} onClick={openSignModal}>
                            {language === 'th' ? 'ลงนาม' : 'Sign'}
                        </Button>
                    </>
                }
            />

            <div className="contract-a4-paper" ref={paperRef}>
                <Stack gap="lg">
                    <header className="contract-letterhead">
                        <Stack gap="xs">
                            <Group justify="space-between" gap="sm">
                                <Title order={2} className="contract-title">
                                    {contractTitle}
                                </Title>
                                <Stack gap={2} className="contract-meta">
                                    <Text size="sm" fw={600}>
                                        {language === 'th' ? 'เลขที่สัญญา' : 'Contract No.'}: {order.contract.contractNumber}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        {language === 'th' ? 'วันที่ออกเอกสาร' : 'Issued'}:{' '}
                                        {new Date(order.contract.id?.startsWith('ctr-') ? Date.now() : Date.now()).toLocaleDateString('th-TH')}
                                    </Text>
                                </Stack>
                            </Group>

                            {shareUrl && (
                                <Text size="sm" c="dimmed">
                                    {language === 'th' ? 'ลิงก์สำหรับดูเอกสาร' : 'View link'}: {shareUrl}
                                </Text>
                            )}
                        </Stack>
                    </header>

                    <Divider />

                    <section>
                        <Title order={3}>{language === 'th' ? 'ข้อมูลคู่สัญญา' : 'Parties'}</Title>
                        <Table withTableBorder withColumnBorders>
                            <Table.Tbody>
                                <Table.Tr>
                                    <Table.Td w="30%">{language === 'th' ? 'ผู้ให้บริการ' : 'Provider'}</Table.Td>
                                    <Table.Td>
                                        <Text fw={600}>Elderly Care Facility</Text>
                                        <Text size="sm" c="dimmed">123 Care Street, Bangkok 10110</Text>
                                    </Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td>{language === 'th' ? 'ผู้รับบริการ (ผู้สูงอายุ/ผู้ป่วย)' : 'Resident'}</Table.Td>
                                    <Table.Td>
                                        <Text fw={600}>
                                            {order.resident?.firstName} {order.resident?.lastName}
                                        </Text>
                                        <Text size="sm" c="dimmed">
                                            {language === 'th' ? 'เลขบัตร' : 'ID'}: {order.resident?.idNumber || '—'}
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td>{language === 'th' ? 'ผู้ปกครอง/ผู้ทำสัญญา' : 'Guardian(s)'}</Table.Td>
                                    <Table.Td>
                                        <Stack gap="xs">
                                            {order.guardians.map((g) => (
                                                <Group key={g.id} justify="space-between" gap="sm">
                                                    <Text size="sm" fw={600}>
                                                        {g.firstName} {g.lastName}
                                                    </Text>
                                                    <Text size="sm" c="dimmed">
                                                        {g.email} · {g.phone}
                                                    </Text>
                                                </Group>
                                            ))}
                                            {primaryGuardian?.id && (
                                                <Text size="sm" c="dimmed">
                                                    {language === 'th' ? 'ผู้ติดต่อหลัก' : 'Primary contact'}: {primaryGuardian.firstName}{' '}
                                                    {primaryGuardian.lastName}
                                                </Text>
                                            )}
                                        </Stack>
                                    </Table.Td>
                                </Table.Tr>
                            </Table.Tbody>
                        </Table>
                    </section>

                    <section>
                        <Title order={3}>{language === 'th' ? 'ระยะเวลาการให้บริการ' : 'Service Period'}</Title>
                        <Table withTableBorder withColumnBorders>
                            <Table.Tbody>
                                <Table.Tr>
                                    <Table.Td w="30%">{language === 'th' ? 'เริ่มบริการ' : 'Start'}</Table.Td>
                                    <Table.Td>{order.salesOrder?.checkIn || order.checkIn || '—'}</Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td>{language === 'th' ? 'สิ้นสุดบริการ' : 'End'}</Table.Td>
                                    <Table.Td>{order.salesOrder?.checkOut || order.checkOut || '—'}</Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td>{language === 'th' ? 'จำนวนวัน' : 'Days'}</Table.Td>
                                    <Table.Td>{days}</Table.Td>
                                </Table.Tr>
                            </Table.Tbody>
                        </Table>
                    </section>

                    <section>
                        <Title order={3}>{language === 'th' ? 'แพ็กเกจและรายการบริการ' : 'Package & Included Services'}</Title>
                        <Text size="sm" c="dimmed">
                            {order.package.name} — {language === 'th' ? 'ระยะฐาน' : 'base duration'} {order.package.duration}{' '}
                            {language === 'th' ? 'วัน' : 'days'}
                        </Text>

                        <Table withTableBorder withColumnBorders>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{language === 'th' ? 'บริการ' : 'Service'}</Table.Th>
                                    <Table.Th>{language === 'th' ? 'แผนก' : 'Dept'}</Table.Th>
                                    <Table.Th>{language === 'th' ? 'ความถี่' : 'Interval'}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {order.package.services.map((s, idx) => (
                                    <Table.Tr key={`${s.title}-${idx}`}>
                                        <Table.Td>
                                            <Text fw={600} size="sm">
                                                {s.title}
                                            </Text>
                                            {s.description && (
                                                <Text size="xs" c="dimmed">
                                                    {s.description}
                                                </Text>
                                            )}
                                        </Table.Td>
                                        <Table.Td>{s.dept}</Table.Td>
                                        <Table.Td>{s.interval}</Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </section>

                    <section>
                        <Title order={3}>{addOnsTitle}</Title>
                        <Table withTableBorder withColumnBorders>
                            <Table.Tbody>
                                <Table.Tr>
                                    <Table.Td w="30%">{language === 'th' ? 'ห้องพัก' : 'Room'}</Table.Td>
                                    <Table.Td>
                                        {order.room ? (
                                            <Stack gap={2}>
                                                <Text fw={600}>
                                                    {language === 'th' ? 'ห้อง' : 'Room'} {order.room.number}
                                                </Text>
                                                <Text size="sm" c="dimmed">
                                                    {language === 'th' ? 'อัตรา' : 'Rate'}: ฿{order.room.pricePerDay}/day
                                                </Text>
                                            </Stack>
                                        ) : (
                                            '—'
                                        )}
                                    </Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td>{language === 'th' ? 'เตียงเสริม' : 'Additional bed'}</Table.Td>
                                    <Table.Td>
                                        {order.additionalServices.additionalBed
                                            ? `${language === 'th' ? 'เลือก' : 'Selected'} (+฿500/day)`
                                            : language === 'th'
                                                ? 'ไม่เลือก'
                                                : 'Not selected'}
                                    </Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td>{language === 'th' ? 'อุปกรณ์เสริม' : 'Amenities'}</Table.Td>
                                    <Table.Td>
                                        {amenities.length > 0 ? (
                                            <Stack gap="xs">
                                                {amenities.map((a) => (
                                                    <Group key={a} justify="space-between" gap="sm">
                                                        <Text size="sm">{amenityLabels[a] || a}</Text>
                                                        <Text size="sm" c="dimmed">
                                                            {getAmenityPricePerDay(a) > 0 ? `+฿${getAmenityPricePerDay(a)}/day` : '฿0'}
                                                        </Text>
                                                    </Group>
                                                ))}
                                            </Stack>
                                        ) : (
                                            language === 'th' ? 'ไม่มี' : 'None'
                                        )}
                                    </Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td>{language === 'th' ? 'ของใช้ที่ญัติจัดหาเอง' : 'Self-provided items'}</Table.Td>
                                    <Table.Td>
                                        <Stack gap="xs">
                                            <Text size="sm">
                                                {order.additionalServices.selfProvidePampers
                                                    ? language === 'th'
                                                        ? 'ญัติจัดหาแพมเพิร์ส/ผ้าอ้อมเอง'
                                                        : 'Guardian provides pampers/adult diapers'
                                                    : language === 'th'
                                                        ? 'ศูนย์จัดหาแพมเพิร์ส/ผ้าอ้อม (ตามเงื่อนไข)'
                                                        : 'Facility provides pampers (per policy)'}
                                            </Text>
                                            <Text size="sm">
                                                {order.additionalServices.selfProvideMedications
                                                    ? language === 'th'
                                                        ? 'ญัติจัดหายาเอง'
                                                        : 'Guardian provides medications'
                                                    : language === 'th'
                                                        ? 'ศูนย์บริหารจัดการยา (ตามใบสั่งแพทย์)'
                                                        : 'Facility manages medications per doctor order'}
                                            </Text>
                                        </Stack>
                                    </Table.Td>
                                </Table.Tr>
                            </Table.Tbody>
                        </Table>
                    </section>

                    <section>
                        <Title order={3}>{pricingTitle}</Title>
                        <Table withTableBorder withColumnBorders>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{language === 'th' ? 'รายการ' : 'Item'}</Table.Th>
                                    <Table.Th ta="right">{language === 'th' ? 'จำนวนเงิน' : 'Amount'}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                <Table.Tr>
                                    <Table.Td>
                                        {language === 'th' ? 'แพ็กเกจ' : 'Package'} ({days} {language === 'th' ? 'วัน' : 'days'})
                                    </Table.Td>
                                    <Table.Td ta="right">฿{Math.round(basePackagePrice).toLocaleString('th-TH')}</Table.Td>
                                </Table.Tr>
                                {order.room && (
                                    <Table.Tr>
                                        <Table.Td>
                                            {language === 'th' ? 'ค่าห้องพัก' : 'Room fee'} ({days} {language === 'th' ? 'วัน' : 'days'})
                                        </Table.Td>
                                        <Table.Td ta="right">฿{Math.round(roomPrice).toLocaleString('th-TH')}</Table.Td>
                                    </Table.Tr>
                                )}
                                {order.additionalServices.additionalBed && (
                                    <Table.Tr>
                                        <Table.Td>
                                            {language === 'th' ? 'เตียงเสริม' : 'Additional bed'} ({days}{' '}
                                            {language === 'th' ? 'วัน' : 'days'})
                                        </Table.Td>
                                        <Table.Td ta="right">฿{Math.round(bedPrice).toLocaleString('th-TH')}</Table.Td>
                                    </Table.Tr>
                                )}
                                {amenities
                                    .filter(a => getAmenityPricePerDay(a) > 0)
                                    .map(a => (
                                        <Table.Tr key={`fee-${a}`}>
                                            <Table.Td>
                                                {(amenityLabels[a] || a)} ({days} {language === 'th' ? 'วัน' : 'days'})
                                            </Table.Td>
                                            <Table.Td ta="right">
                                                ฿{Math.round(getAmenityPricePerDay(a) * days).toLocaleString('th-TH')}
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                            </Table.Tbody>
                            <Table.Tfoot>
                                <Table.Tr>
                                    <Table.Td ta="right">
                                        <Text fw={600}>{language === 'th' ? 'ยอดรวมก่อนภาษี' : 'Subtotal'}</Text>
                                    </Table.Td>
                                    <Table.Td ta="right">฿{Math.round(pricing.subtotal).toLocaleString('th-TH')}</Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td ta="right">
                                        <Text fw={600}>{language === 'th' ? 'ภาษีมูลค่าเพิ่ม (7%)' : 'VAT (7%)'}</Text>
                                    </Table.Td>
                                    <Table.Td ta="right">฿{Math.round(pricing.tax).toLocaleString('th-TH')}</Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td ta="right">
                                        <Text fw={700}>{language === 'th' ? 'ยอดรวมสุทธิ' : 'Total'}</Text>
                                    </Table.Td>
                                    <Table.Td ta="right">
                                        <Text fw={700}>฿{Math.round(pricing.total).toLocaleString('th-TH')}</Text>
                                    </Table.Td>
                                </Table.Tr>
                            </Table.Tfoot>
                        </Table>
                    </section>

                    <section>
                        <Title order={3}>{policyTitle}</Title>
                        {language === 'th' ? (
                            <Stack gap="sm">
                                <Text size="sm">
                                    ระเบียบการใช้บริการนี้ถือเป็นส่วนหนึ่งของข้อตกลงการใช้บริการ และให้ถือว่าเป็นข้อกำหนดในสัญญานี้
                                </Text>
                                <Text size="sm" fw={600}>
                                    การชำระเงินและเอกสาร
                                </Text>
                                <Text size="sm">
                                    - ชำระค่าบริการล่วงหน้า (รายเดือน: ล่วงหน้า 1 เดือน + เงินประกัน/เงินมัดจำ 1 เดือน; รายวัน: ชำระทั้งหมด + เงินประกัน 25%)
                                </Text>
                                <Text size="sm">
                                    - เอกสารแนบ: สำเนาบัตร/พาสปอร์ตของผู้สูงอายุและญาติผู้ทำข้อตกลง + เอกสารประวัติสุขภาพ/ใบนัด/รายงานแพทย์
                                </Text>
                                <Text size="sm">- บัตรประชาชนและเอกสารสำคัญของผู้สูงอายุให้เก็บไว้ที่ศูนย์เพื่อการติดต่อโรงพยาบาล/ราชการ</Text>
                                <Text size="sm" fw={600}>
                                    ญาติและผู้ปกครอง
                                </Text>
                                <Text size="sm">- ผู้ทำข้อตกลงเป็นตัวแทนญาติทุกคนและสามารถตัดสินใจแทนได้</Text>
                                <Text size="sm">- การยกเลิกบริการในเดือนถัดไป ต้องแจ้งล่วงหน้าอย่างน้อย 15 วัน</Text>
                                <Text size="sm" fw={600}>
                                    ค่าใช้จ่ายและความรับผิดชอบ
                                </Text>
                                <Text size="sm">- ค่าใช้จ่ายที่โรงพยาบาลเป็นความรับผิดชอบของญาติ; หากศูนย์สำรองจ่ายต้องชำระคืนทันที</Text>
                                <Text size="sm">- สิ่งของมีค่า: ทางศูนย์ไม่รับผิดชอบกรณีสูญหาย</Text>
                                <Text size="sm">
                                    - กรณีฉุกเฉิน: ผู้ดูแลสามารถนำส่งโรงพยาบาลที่ระบุหรือใกล้ที่สุด โดยญาติรับผิดชอบค่าใช้จ่ายทั้งหมด
                                </Text>
                                <Text size="sm">
                                    - โรคติดต่อ: ศูนย์ไม่รับดูแล หากปกปิดข้อมูล ศูนย์มีสิทธิยกเลิกบริการโดยไม่คืนเงินประกันและค่าบริการล่วงหน้า
                                </Text>
                                <Text size="sm">
                                    - ยา/อาหารเสริมจากภายนอกที่นอกเหนือคำสั่งแพทย์ ถือว่าไม่อยู่ในความรับผิดชอบของศูนย์
                                </Text>
                                <Text size="sm" fw={600}>
                                    การเยี่ยมและที่จอดรถ
                                </Text>
                                <Text size="sm">- ไม่อนุญาตให้พักค้างคืน ยกเว้นได้รับอนุญาตเป็นกรณี</Text>
                                <Text size="sm">- เวลาเยี่ยม: 10:00–14:00 และ 17:00–20:00</Text>
                                <Text size="sm" fw={600}>
                                    กรณีพักรักษาตัวที่โรงพยาบาล
                                </Text>
                                <Text size="sm">
                                    - หากต้องการยกเลิกบริการ: คิดค่าบริการรายวัน วันละ 1,400 บาท + ค่าบริการส่วนเพิ่ม และคืนเงินมัดจำตามกำหนด
                                </Text>
                                <Text size="sm">
                                    - หากกลับมาใช้บริการต่อ: ลดวันละ 400 บาท ตามจำนวนวันที่ไปนอนโรงพยาบาล
                                </Text>
                            </Stack>
                        ) : (
                            <Stack gap="sm">
                                <Text size="sm">
                                    These rules are incorporated into and form part of this Agreement as binding terms.
                                </Text>
                                <Text size="sm" fw={600}>
                                    Payments & documents
                                </Text>
                                <Text size="sm">
                                    - Pay in advance (monthly: 1 month service + 1 month deposit; daily: pay in full + 25% deposit).
                                </Text>
                                <Text size="sm">
                                    - Required documents: resident ID/passport copy, guardian ID/passport copy, health history and medical reports.
                                </Text>
                                <Text size="sm">
                                    - Resident ID card and essential documents may be retained by the facility for hospital/government coordination.
                                </Text>
                                <Text size="sm" fw={600}>
                                    Guardians
                                </Text>
                                <Text size="sm">
                                    - The signing guardian represents the family and is authorized to make decisions for the resident.
                                </Text>
                                <Text size="sm">- Cancellation for the next month requires at least 15 days’ notice.</Text>
                                <Text size="sm" fw={600}>
                                    Costs & responsibility
                                </Text>
                                <Text size="sm">
                                    - Hospital expenses are the guardian’s responsibility. If the facility advances payments, reimbursement is due immediately.
                                </Text>
                                <Text size="sm">- Valuables: the facility is not responsible for loss or damage.</Text>
                                <Text size="sm">
                                    - Emergency: caregivers may transfer the resident to the designated or nearest hospital; all costs are borne by the guardian.
                                </Text>
                                <Text size="sm">
                                    - Infectious diseases: the facility may refuse/terminate service; concealment may result in termination and forfeiture of deposits.
                                </Text>
                                <Text size="sm">
                                    - External medicines/supplements outside doctor orders are not the facility’s responsibility.
                                </Text>
                                <Text size="sm" fw={600}>
                                    Visiting & overnight stays
                                </Text>
                                <Text size="sm">
                                    - No overnight stays unless explicitly approved by the facility. Visiting hours: 10:00–14:00 and 17:00–20:00.
                                </Text>
                                <Text size="sm" fw={600}>
                                    Hospital stay billing
                                </Text>
                                <Text size="sm">
                                    - If service is cancelled during a hospital stay: daily rate + extras; deposit refunded per policy.
                                </Text>
                                <Text size="sm">
                                    - If service continues: discount per hospital-stay day may apply (per facility policy).
                                </Text>
                            </Stack>
                        )}
                    </section>

                    <section>
                        <Title order={3}>{language === 'th' ? 'การลงนาม' : 'Signatures'}</Title>
                        <Table withTableBorder withColumnBorders>
                            <Table.Tbody>
                                <Table.Tr>
                                    <Table.Td w="30%">{language === 'th' ? 'ผู้ปกครอง' : 'Guardian'}</Table.Td>
                                    <Table.Td>
                                        <Text size="sm">
                                            {primaryGuardian?.firstName} {primaryGuardian?.lastName} ({primaryGuardian?.email || '—'})
                                        </Text>
                                        <Text size="sm" c="dimmed">
                                            {language === 'th' ? 'ลงนามเมื่อ' : 'Signed at'}: {stored?.signedAt || '—'}
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                                <Table.Tr>
                                    <Table.Td>{language === 'th' ? 'ผู้ให้บริการ' : 'Provider'}</Table.Td>
                                    <Table.Td>
                                        <Text size="sm">Elderly Care Facility</Text>
                                        <Text size="sm" c="dimmed">
                                            {language === 'th' ? 'ผู้ลงนาม' : 'Signed by'}: {language === 'th' ? 'เจ้าหน้าที่/ผู้มีอำนาจ' : 'Authorized staff'}
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            </Table.Tbody>
                        </Table>
                    </section>
                </Stack>
            </div>

            <Modal
                opened={showSignModal}
                onClose={() => setShowSignModal(false)}
                title={language === 'th' ? 'ลงนามสัญญา' : 'Sign contract'}
                centered
            >
                <Stack gap="md">
                    <Text size="sm" c="dimmed">
                        {language === 'th'
                            ? 'กรอกอีเมลผู้ปกครองเพื่อบันทึกการลงนาม (ต้องตรงกับอีเมลในสัญญา)'
                            : 'Enter a guardian email to record signature (must match a guardian email on this contract).'}
                    </Text>
                    <TextInput
                        label={language === 'th' ? 'อีเมลผู้ลงนาม' : 'Signer email'}
                        value={signerEmail}
                        onChange={(e) => setSignerEmail(e.currentTarget.value)}
                        placeholder="name@example.com"
                    />
                    <Group justify="flex-end" gap="sm">
                        <Button variant="subtle" onClick={() => setShowSignModal(false)}>
                            {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                        </Button>
                        <Button leftSection={<IconCheck size={18} />} onClick={handleSign}>
                            {language === 'th' ? 'ยืนยันการลงนาม' : 'Confirm sign'}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </div>
    );
}

